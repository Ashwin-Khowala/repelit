import fs from "fs";
import yaml from "yaml";
import path from "path";
import { KubeConfig, AppsV1Api, CoreV1Api, NetworkingV1Api } from "@kubernetes/client-node";
import { NextRequest, NextResponse } from "next/server";

// Initialize Kubernetes clients
const kubeconfig = new KubeConfig();

if (process.env.NODE_ENV === "production") {
    console.log("here bois");
    kubeconfig.loadFromOptions({
        clusters: [{
            name: 'aks-cluster',
            server: process.env.KUBE_API_SERVER,
            caData: process.env.KUBE_CA_CERT,
        }],
        users: [{
            name: 'vercel-sa',
            token: process.env.KUBE_TOKEN,
        }],
        contexts: [{
            name: 'vercel-context',
            user: 'vercel-sa',
            cluster: 'aks-cluster',
            namespace: process.env.KUBE_NAMESPACE,
        }],
        currentContext: 'vercel-context',
    });
} else {
    kubeconfig.loadFromDefault();
}

const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);
const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api);

// Updated utility function to handle multi-document YAML files with userId and projId
const readAndParseKubeYaml = (filePath: string, userId: string, projId: string): Array<any> => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const docs = yaml.parseAllDocuments(fileContent).map((doc) => {
        let docString = doc.toString();

        // Replace placeholders
        const serviceNameRegex = new RegExp(`service-name`, 'g');
        const userIdRegex = new RegExp(`userId`, 'g');
        const projectIdRegex = new RegExp(`projectId`, 'g');

        const replId = sanitizeK8sName(userId + "-" + projId);

        // Replace service-name with sanitized replId
        docString = docString.replace(serviceNameRegex, replId);

        // Replace userId
        const encodedUserId = (userId);
        docString = docString.replace(userIdRegex, encodedUserId);

        // Replace projectId
        docString = docString.replace(projectIdRegex, projId);
        return yaml.parse(docString);
    });
    return docs;
};

function sanitizeK8sName(input: string): string {
    return input
        .toLowerCase()
        .replace(/@/g, '-at-')
        .replace(/\./g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/^-+|-+$/g, '');
}

// Helper function to check if error is a 404
const is404Error = (error: any): boolean => {
    return error?.response?.statusCode === 404 ||
        error?.statusCode === 404 ||
        error?.code === 404;
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, projectId } = body;

        // Validate required parameters
        if (!userId || !projectId) {
            return NextResponse.json(
                { message: "Missing required parameters: userId and projectId are required" },
                { status: 400 }
            );
        }

        const namespace = "default";

        // Path to the YAML file
        const yamlPath = path.join(process.cwd(), "k8s", "service.yaml");

        // Check if file exists
        if (!fs.existsSync(yamlPath)) {
            return NextResponse.json(
                { message: `YAML file not found at ${yamlPath}` },
                { status: 404 }
            );
        }

        const kubeManifests = readAndParseKubeYaml(yamlPath, userId, projectId);

        // Create resources
        const createdResources = [];
        const errors = [];

        for (const manifest of kubeManifests) {
            try {
                switch (manifest.kind) {
                    case "Deployment":
                        try {
                            await appsV1Api.readNamespacedDeployment({ namespace, name: manifest.metadata.name });
                            console.log(`Deployment ${manifest.metadata.name} already exists, skipping creation.`);
                        } catch (err: any) {
                            if (is404Error(err)) {
                                await appsV1Api.createNamespacedDeployment({ namespace, body: manifest });
                                createdResources.push(`Deployment: ${manifest.metadata.name}`);
                                console.log(`Created Deployment: ${manifest.metadata.name}`);
                            } else {
                                console.error(`Error checking/creating Deployment ${manifest.metadata.name}:`, err.message);
                                errors.push(`Deployment ${manifest.metadata.name}: ${err.message}`);
                            }
                        }
                        break;

                    case "Service":
                        try {
                            await coreV1Api.readNamespacedService({ namespace, name: manifest.metadata.name });
                            console.log(`Service ${manifest.metadata.name} already exists, skipping creation.`);
                        } catch (err: any) {
                            if (is404Error(err)) {
                                await coreV1Api.createNamespacedService({ namespace, body: manifest });
                                createdResources.push(`Service: ${manifest.metadata.name}`);
                                console.log(`Created Service: ${manifest.metadata.name}`);
                            } else {
                                console.error(`Error checking/creating Service ${manifest.metadata.name}:`, err.message);
                                errors.push(`Service ${manifest.metadata.name}: ${err.message}`);
                            }
                        }
                        break;

                    case "Ingress":
                        try {
                            await networkingV1Api.readNamespacedIngress({ name: manifest.metadata.name, namespace });
                            console.log(`Ingress ${manifest.metadata.name} already exists, skipping creation.`);
                        } catch (err: any) {
                            if (is404Error(err)) {
                                await networkingV1Api.createNamespacedIngress({ namespace, body: manifest });
                                createdResources.push(`Ingress: ${manifest.metadata.name}`);
                                console.log(`Created Ingress: ${manifest.metadata.name}`);
                            } else {
                                console.error(`Error checking/creating Ingress ${manifest.metadata.name}:`, err.message);
                                errors.push(`Ingress ${manifest.metadata.name}: ${err.message}`);
                            }
                        }
                        break;

                    default:
                        console.log(`Unsupported kind: ${manifest.kind}`);
                        errors.push(`Unsupported resource kind: ${manifest.kind}`);
                }
            } catch (resourceError: any) {
                console.error(`Failed to process ${manifest.kind} ${manifest.metadata?.name}:`, resourceError.message);
                errors.push(`${manifest.kind} ${manifest.metadata?.name}: ${resourceError.message}`);
            }
        }

        // Return success even if some resources had errors, but include error details
        const response = {
            message: errors.length === 0 ? "All resources processed successfully" : "Resources processed with some errors",
            details: {
                userId,
                projectId,
                createdResources,
                totalResources: kubeManifests.length,
                errors: errors.length > 0 ? errors : undefined
            }
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Failed to create resources", error);

        // More detailed error handling
        let errorMessage = "Unknown error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json(
            {
                message: "Failed to create resources",
                error: errorMessage,
                details: error instanceof Error ? error.stack : null
            },
            { status: 500 }
        );
    }
}