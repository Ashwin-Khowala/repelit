import { BlobServiceClient } from "@azure/storage-blob";

class AzureStorageClient {
    private connectionString: string;
    private containerName: string;
    private blobServiceClient: BlobServiceClient;
    private containerClient: any;
    constructor() {
        this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
        this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'coding-platform';
        if (this.connectionString == "") {
            throw new Error("AZURE_STORAGE_CONNECTION_STRING is not set");
        }

        this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
        this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);

    }

    //it initializes container if it does not exist
    async initializeContainer() {
        try {
            await this.containerClient.createIfNotExists({
                access: 'private'
            });
        } catch (error) {
            console.error('Error initializing container:', error);
            throw error;
        }
    }

    //retrieves the base image for the specified language 
    async getBaseImage(language: string) {
        try {
            if (!language) {
                throw new Error("Language is required to get the base image");
            }
            const prefix = `base/${language}/`;

            const files: { [key: string]: string } = {};

            for await (const blob of this.containerClient.listBlobsFlat({ prefix })) {
                const blobClient = this.containerClient.getBlockBlobClient(blob.name);
                const response = await blobClient.download();

                const relativePath = blob.name.trim().substring(prefix.length);
                const chunks = [];

                for await (const chunk of response.readableStreamBody) {
                    chunks.push(chunk);
                }

                files[relativePath] = Buffer.concat(chunks).toString('utf-8');

            }
            return files;
        } catch (error) {
            console.error('Error getting base template:', error);
            throw error;
        }
    }

    // create new project in the specified language
    async createNewProject(username: string, projectName: string, language: string) {
        try {
            if (!language || !projectName || !username) {
                throw new Error("Language,  project name and username  are required to create a project");
            }

            const prefix = `code/${username}/${projectName}`;
            const baseTemplate: { [key: string]: string } = await this.getBaseImage(language) || {};

            for (const [fileName, content] of Object.entries(baseTemplate)) {
                await this.uploadFile(`${prefix}/${fileName}`, content);
            }

            const metadata = {
                username,
                projectName,
                language,
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };

            await this.uploadFile(
                `${prefix}/.project.json`,
                JSON.stringify(metadata, null, 2)
            );
            return {
                success: true,
                prefix,
                files: { ...baseTemplate }
            };
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }

    // upload a single file to the specified path
    async uploadFile(blobName: string, content: string, options = { metadata: {} }) {
        if (!blobName || !content) {
            throw new Error("Blob name and content are required to upload a file");
        }
        try {
            const blobBlockClient = this.containerClient.getBlockBlobClient(blobName);

            const uploadOptions = {
                blobHTTPHeaders: {
                    blobContentType: this.getMimeType(blobName)
                },
                metadata: {
                    createdAt: new Date().toISOString(),
                    ...options.metadata
                }
            };
            await blobBlockClient.upload(content, Buffer.byteLength(content), uploadOptions);
            return {
                success: true,
                blobName
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    async createFolderStructure(folderPath: string, folderName: string,username: string, projectName: string) {
    if (!folderPath) {
        throw new Error("Folder path is required");
    }

    if (!folderName) {
        throw new Error("Folder name is required");
    }

    try {
        const prefix = folderPath ? `code/${username}/${projectName}/${folderPath}/` : 'code/';
        
        // Create .gitkeep placeholder to maintain folder structure
        const placeholderPath = `${prefix}${folderName}/.gitkeep`;
        await this.uploadFile(placeholderPath, 'internal serever placeholder');
        
        console.log(`Folder structure created at: ${prefix}${folderName}/`);
        
        return {
            success: true,
            folderPath: `${prefix}${folderName}`
        };

    } catch (error) {
        console.error('Error creating folder structure:', error);
        throw error;
    }
}

    async downloadFile(blobName: string): Promise<string> {
        if (!blobName) {
            throw new Error("Blob name is required to download a file");
        }
        try {
            const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
            const response = await blockBlobClient.download();

            const chunks = [];
            for await (const chunk of response.readableStreamBody) {
                chunks.push(chunk);
            }

            return Buffer.concat(chunks).toString();
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }

    // get all the project files
    async getProjectFiles(username: string, projectName: string, language?: string): Promise<{ [key: string]: string }> {
        if (!username || !projectName) {
            throw new Error("Username, language and project name are required to get project files");
        }
        try {
            const prefix = `code/${username}/${projectName}/`;
            const files: { [key: string]: string } = {};

            for await (const blob of this.containerClient.listBlobsFlat({ prefix })) {
                if (blob.name.endsWith('.project.json')) {
                    continue; // Skip the project metadata file
                }

                const blobClient = this.containerClient.getBlockBlobClient(blob.name);
                const response = await blobClient.download();

                const relativePath = blob.name.substring(prefix.length);
                const chunks = [];

                for await (const chunk of response.readableStreamBody) {
                    chunks.push(chunk);
                }

                files[relativePath] = Buffer.concat(chunks).toString('utf-8');
            }
            return files;
        } catch (error) {
            console.error('Error getting project files:', error);
            throw error;
        }
    }

    // get the user project list
    async getUserProjects(username: string): Promise<{ [key: string]: any }> {
        if (!username) {
            throw new Error("Username is required to get user projects");
        }
        try {
            const prefix = `code/${username}/`;
            const projects = [];
            const projectFolders = new Set();

            for await (const blob of this.containerClient.listBlobsFlat({ prefix })) {
                const relativePath = blob.name.substring(prefix.length);
                const projectName = relativePath.split('/')[0];

                if (projectName && !projectFolders.has(projectName)) {
                    projectFolders.add(projectName);

                    // Try to get project metadata
                    try {
                        const metadata = await this.downloadFile(`${prefix}${projectName}/.project.json`);
                        projects.push(JSON.parse(metadata));
                    } catch (e) {
                        // If no metadata, create basic project info
                        projects.push({
                            username,
                            projectName,
                            language: 'unknown',
                            createdAt: blob.properties.createdOn?.toISOString() || new Date().toISOString()
                        });
                    }
                }
            }

            return projects;
        } catch (error) {
            console.error('Error getting user projects:', error);
            throw error;
        }
    }

    // Delete project
    async deleteProject(username: string, projectName: string) {
        if (!username || !projectName) {
            throw new Error("Username and project name are required to delete a project");
        }
        try {
            const prefix = `code/${username}/${projectName}/`;
            const deletedFiles = [];

            for await (const blob of this.containerClient.listBlobsFlat({ prefix })) {
                await this.containerClient.deleteBlob(blob.name);
                deletedFiles.push(blob.name);
            }

            return { success: true, deletedFiles };
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }

    // Update file in project
    async updateProjectFile(username: string, projectName: string, fileName: string, content: string) {
        if (!username || !projectName || !fileName || !content) {
            throw new Error("Username, project name, file name and content are required to update a project file");
        }
        try {
            const blobName = `code/${username}/${projectName}/${fileName}`;
            await this.uploadFile(blobName, content, {
                metadata: {
                    lastModified: new Date().toISOString(),
                    username,
                    projectName
                }
            });

            // Update project metadata
            try {
                const metadataPath = `code/${username}/${projectName}/.project.json`;
                const existingMetadata = JSON.parse(await this.downloadFile(metadataPath));
                existingMetadata.lastModified = new Date().toISOString();
                await this.uploadFile(metadataPath, JSON.stringify(existingMetadata, null, 2));
            } catch (e) {
                console.warn('Could not update project metadata:', e);
            }

            return { success: true, fileName };
        } catch (error) {
            console.error('Error updating project file:', error);
            throw error;
        }
    }

    // Get available languages from the base directory
    async getAvailableLanguages(): Promise<string[]> {
        try {
            const prefix = 'base/';
            const languages = new Set<string>();

            for await (const blob of this.containerClient.listBlobsFlat({ prefix })) {
                const relativePath = blob.name.substring(prefix.length);
                const language = relativePath.split('/')[0];
                if (language) {
                    languages.add(language);
                }
            }

            return Array.from(languages);
        } catch (error) {
            console.error('Error getting available languages:', error);
            throw error;
        }
    }

    getMimeType(fileName: string): string {
        const extension: string = fileName.split('.').pop()?.toLowerCase() || "";
        const mimeTypes: { [key: string]: string } = {
            'js': 'application/javascript',
            'jsx': 'application/javascript',
            'ts': 'application/typescript',
            'tsx': 'application/typescript',
            'py': 'text/x-python',
            'java': 'text/x-java-source',
            'cpp': 'text/x-c++src',
            'c': 'text/x-csrc',
            'html': 'text/html',
            'css': 'text/css',
            'json': 'application/json',
            'md': 'text/markdown',
            'txt': 'text/plain',
            'dockerfile': 'text/plain'
        };

        return mimeTypes[extension] || 'text/plain';
    }
}

export const azureStorage = new AzureStorageClient();
export default AzureStorageClient;

