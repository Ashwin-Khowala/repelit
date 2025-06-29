import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import fs from "fs";
import path from "path";

const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING ?? ""
);
const containerClient = blobServiceClient.getContainerClient(
    process.env.AZURE_CONTAINER_NAME ?? ""
);

export const fetchAzureFolder = async (prefix: string, localPath: string): Promise<void> => {
    try {
        for await (const blob of containerClient.listBlobsFlat({ prefix })) {
            const blobName = blob.name;
            const blobClient = containerClient.getBlobClient(blobName);
            
            const downloadResponse = await blobClient.download();
            if (downloadResponse.readableStreamBody) {
                const chunks: Buffer[] = [];
                
                for await (const chunk of downloadResponse.readableStreamBody) {
                    chunks.push(Buffer.from(chunk));
                }
                
                const fileData = Buffer.concat(chunks);
                const filePath = `${localPath}/${blobName.replace(prefix, "")}`;
                await writeFile(filePath, fileData);
            }
        }
    } catch (error) {
        console.error('Error fetching Azure folder:', error);
        throw error;
    }
};

export async function copyAzureFolder(sourcePrefix: string, destinationPrefix: string): Promise<void> {
    try {
        // List all blobs with the source prefix
        for await (const blob of containerClient.listBlobsFlat({ prefix: sourcePrefix })) {
            if (!blob.name) continue;
            
            const destinationBlobName = blob.name.replace(sourcePrefix, destinationPrefix);
            const sourceBlobClient = containerClient.getBlobClient(blob.name);
            const destinationBlobClient = containerClient.getBlobClient(destinationBlobName);
            
            // Copy the blob
            const copyOperation = await destinationBlobClient.beginCopyFromURL(sourceBlobClient.url);
            await copyOperation.pollUntilDone();
            
            console.log(`Copied ${blob.name} to ${destinationBlobName}`);
        }
    } catch (error) {
        console.error('Error copying folder:', error);
        throw error;
    }
}

function writeFile(filePath: string, fileData: Buffer): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            await createFolder(path.dirname(filePath));
            fs.writeFile(filePath, fileData, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

function createFolder(dirName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.mkdir(dirName, { recursive: true }, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

export const saveToAzure = async (prefix: string, filePath: string, content: string): Promise<void> => {
    try {
        const blobName = `${prefix}/${filePath}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        await blockBlobClient.upload(content, content.length);
        console.log(`Uploaded ${blobName} to Azure Blob Storage`);
    } catch (error) {
        console.error('Error saving to Azure:', error);
        throw error;
    }
};