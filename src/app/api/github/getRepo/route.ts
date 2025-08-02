import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";
import { NEXT_AUTH_CONFIG } from "@/src/lib/auth";
import axios from "axios";
import { azureStorage } from "@/src/lib/azure/client";
import { prisma } from "@/src/lib/prisma";

interface FileUploadResult {
    path: string;
    success: boolean;
    error?: string;
    size?: number;
}

// const TEXT_FILE_EXTENSIONS = /\.(txt|js|ts|jsx|tsx|json|md|yml|yaml|xml|html|css|py|java|cpp|c|h|sql|sh|bat|gitignore|dockerfile)$/i;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
const CONCURRENCY_LIMIT = 5;

export async function POST(req: NextRequest) {
    const session = await getServerSession(NEXT_AUTH_CONFIG);

    try {
        const body = await req.json();
        const { githubRepo } = body;

        // Input validation
        if (!githubRepo || typeof githubRepo !== 'string') {
            return NextResponse.json({ msg: "Invalid repository name" }, { status: 400 });
        }

        const accessToken = session?.user.accessToken;
        const githubUser = session?.user.login;
        const userId = session?.user.id;

        if (!accessToken || !githubUser || !userId) {
            return NextResponse.json({ msg: "Authentication required" }, { status: 401 });
        }

        // Sanitize repo name
        const sanitizedRepo = githubRepo.replace(/[^a-zA-Z0-9-_.]/g, '');

        const octokit = new Octokit({
            auth: accessToken
        });

        // Get repository info to get default branch
        const repoInfo = await octokit.rest.repos.get({
            owner: githubUser,
            repo: sanitizedRepo
        });

        const defaultBranch = repoInfo.data.default_branch;

        // Get repository tree
        const repoTree = await octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
            owner: githubUser,
            repo: sanitizedRepo,
            tree_sha: defaultBranch,
            recursive: "true"
        });

        const files = repoTree.data.tree.filter(item =>
            item.type === 'blob' &&
            item.size &&
            item.size <= MAX_FILE_SIZE
        );

        if (files.length === 0) {
            return NextResponse.json({ msg: "No files found or all files exceed size limit" }, { status: 400 });
        }

        console.log(`Processing ${files.length} files from ${sanitizedRepo}`);

        // Process files with concurrency control
        const results: FileUploadResult[] = [];
        const uploadedFiles: string[] = [];

        // Split files into chunks for batch processing
        const chunks = [];
        for (let i = 0; i < files.length; i += CONCURRENCY_LIMIT) {
            chunks.push(files.slice(i, i + CONCURRENCY_LIMIT)); 
        }

        let processedCount = 0;

        try {
            for (const chunk of chunks) {
                const chunkPromises = chunk.map(async (file) => {
                    const result: FileUploadResult = {
                        path: file.path || 'unknown',
                        success: false
                    };

                    try {
                        if (!file.url || !file.path) {
                            result.error = 'Missing file URL or path';
                            return result;
                        }

                        // Fetch file content from GitHub
                        const response = await axios.get(file.url, {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Accept': 'application/vnd.github.v3+json',
                                'X-GitHub-Api-Version': '2022-11-28'
                            },
                            timeout: 30000 // 30 second timeout
                        });

                        if (!response.data.content) {
                            result.error = 'No content received from GitHub';
                            return result;
                        }

                        // Handle different file types
                        // const isTextFile = TEXT_FILE_EXTENSIONS.test(file.path);

                        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');

                        // Create Azure storage path
                        const azureStoragePath = `code/${userId}/${sanitizedRepo}/${file.path}`;

                        // Upload to Azure
                        await azureStorage.uploadFile(azureStoragePath, content);

                        uploadedFiles.push(azureStoragePath);
                        result.success = true;
                        result.size = file.size;

                        processedCount++;
                        console.log(`Progress: ${processedCount}/${files.length} files processed`);

                    } catch (error) {
                        console.error(`Failed to process ${file.path}:`, error);
                        result.error = error instanceof Error ? error.message : 'Unknown error';
                    }

                    return result;
                });

                // Wait for current chunk to complete
                const chunkResults = await Promise.all(chunkPromises);
                results.push(...chunkResults);

                // Small delay between chunks to avoid rate limiting
                if (chunks.indexOf(chunk) < chunks.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            const successCount = results.filter(r => r.success).length;
            const failureCount = results.length - successCount;

            // If more than 50% failed, consider it a failure and rollback
            if (failureCount > successCount) {
                console.log('Too many failures, rolling back uploads...');
                await rollbackUploads(uploadedFiles);

                return NextResponse.json({
                    msg: "Upload failed - too many file errors",
                    results: results.filter(r => !r.success),
                    rollback: true
                }, { status: 500 });
            }

            const response = await prisma.project.create({
                data:{
                    projectName: githubRepo,
                    userId: userId,
                    language: "",
                    githubRepo: true
                }
            })

            if(!response) {
                await rollbackUploads(uploadedFiles);

                return NextResponse.json({
                    msg: "DataBase error",
                    results: results.filter(r => !r.success),
                    rollback: true
                }, { status: 500 });
            }

            return NextResponse.json({
                msg: `Successfully processed ${successCount} files`,
                repository: sanitizedRepo,
                branch: defaultBranch,
                totalFiles: files.length,
                successCount,
                failureCount,
                results: failureCount > 0 ? results.filter(r => !r.success) : undefined
            });

        } catch (batchError) {
            console.error('Batch processing error:', batchError);

            // Rollback any uploaded files
            await rollbackUploads(uploadedFiles);

            throw batchError;
        }

    } catch (error) {
        console.error('GitHub to Azure sync error:', error);

        return NextResponse.json({
            msg: "Failed to sync repository",
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// Helper function to rollback uploads
async function rollbackUploads(uploadedFiles: string[]) {
    console.log(`Rolling back ${uploadedFiles.length} uploaded files...`);

    const rollbackPromises = uploadedFiles.map(async (filePath) => {
        try {
            //@ts-ignore
            await azureStorage.deleteFile(filePath);
        } catch (error) {
            console.error(`Failed to rollback ${filePath}:`, error);
        }
    });

    await Promise.allSettled(rollbackPromises);
    console.log('Rollback completed');
}