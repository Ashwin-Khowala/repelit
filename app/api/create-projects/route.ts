import { NextRequest, NextResponse } from 'next/server';
import { azureStorage } from '@/lib/azure/client';
import { prisma } from '@/lib/prisma';

// create new project for the user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, projectName, language }: {
            userId: string,
            projectName: string,
            language: string
        } = body;

        if (!userId || !projectName || !language) {
            return NextResponse.json(
                { error: 'User ID, project name, and language are required' },
                { status: 400 }
            );
        }
        try {
            const updateDb = await prisma.project.create({
                data: {
                    projectName: projectName,
                    language: language,
                    createdAt: new Date(),
                    lastModified: new Date(),
                    userId: userId
                }
            });

            console.log(updateDb);

            if (!updateDb){
                console.log(updateDb+ "prisma creation failed");
                 throw new Error("prisma proj cration failed");
            }

            const result = await azureStorage.createNewProject(
                userId,
                projectName,
                language
            );

            console.log(result);

            if (!result) {
                console.log("cloud creation failed"+ result);
                return NextResponse.json(
                    { error: 'Failed to create project' },
                    { status: 500 }
                );
            }

            return NextResponse.json(result, { status: 201 });
        } catch (e) {
            return NextResponse.json(e, { status: 500 });
        }

    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        );
    }
}
