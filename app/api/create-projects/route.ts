import { NextRequest, NextResponse } from 'next/server';
import { azureStorage } from '@/lib/azure/client';
import { getServerSession } from 'next-auth/next';
import { NEXT_AUTH_CONFIG } from '@/lib/auth';

// fetch user projects
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(NEXT_AUTH_CONFIG); 
        const userId = session?.user?.email || "";
        console.log('User ID:', userId);
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const userProjects = await azureStorage.getUserProjects(userId);
        if (!userProjects || userProjects.length === 0) {
            return NextResponse.json(
                { message: 'No projects found for this user' },
                { status: 404 }
            );
        }

        return NextResponse.json(userProjects, { status: 200 });

    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}

// create new project for the user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, projectName, language } = body;

        if (!userId || !projectName || !language) {
            return NextResponse.json(
                { error: 'User ID, project name, and language are required' },
                { status: 400 }
            );
        }

        const result = await azureStorage.createNewProject(
            userId,
            projectName,
            language
        );

        if (!result) {
            return NextResponse.json(
                { error: 'Failed to create project' },
                { status: 500 }
            );
        }

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        );
    }
}
