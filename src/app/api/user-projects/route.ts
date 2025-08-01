import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { NEXT_AUTH_CONFIG } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';

// fetch user projects
export async function GET() {
    try {
        const session = await getServerSession(NEXT_AUTH_CONFIG);
        const userId = session?.user?.id || "";
        console.log("userid " + userId)
        console.log('User ID:', userId);
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const userProjects = await prisma.project.findMany({
            where: {
                userId: userId
            }
        });
        if (!userProjects || userProjects.length === 0) {
            return NextResponse.json(
                { userProjects },
                { status: 200 }
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
