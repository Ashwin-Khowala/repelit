import fs from "fs";
import yaml from "yaml";
import path from "path";
import { KubeConfig, AppsV1Api, CoreV1Api, NetworkingV1Api, AppsV1ApiCreateNamespacedDeploymentRequest } from "@kubernetes/client-node";
import { NextRequest, NextResponse } from "next/server";

// Initialize Kubernetes clients
const kubeconfig = new KubeConfig();
kubeconfig.loadFromDefault();
const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);
const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api);

// Updated utility function to handle multi-document YAML files
const readAndParseKubeYaml = (filePath: string, replId: string): Array<any> => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const docs = yaml.parseAllDocuments(fileContent).map((doc) => {
        let docString = doc.toString();
        const regex = new RegExp(`service_name`, 'g');
        docString = docString.replace(regex, replId);
        console.log(docString);
        return yaml.parse(docString);
    });
    return docs;
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, replId } = body;
        const namespace:any= "default"; // Assuming a default namespace, adjust as needed

        // Adjust the path for Next.js - files are typically in the project root or public folder
        const yamlPath = path.join(process.cwd(), "service.yaml");
        
        const kubeManifests = readAndParseKubeYaml(yamlPath, replId);
        
        for (const manifest of kubeManifests) {
            switch (manifest.kind) {
                case "Deployment":
                    await appsV1Api.createNamespacedDeployment(namespace, manifest);
                    break;
                case "Service":
                    await coreV1Api.createNamespacedService(namespace, manifest);
                    break;
                case "Ingress":
                    await networkingV1Api.createNamespacedIngress(namespace, manifest);
                    break;
                default:
                    console.log(`Unsupported kind: ${manifest.kind}`);
            }
        }

        return NextResponse.json(
            { message: "Resources created successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Failed to create resources", error);
        return NextResponse.json(
            { message: "Failed to create resources" },
            { status: 500 }
        );
    }
}