import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { NEXT_AUTH_CONFIG } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';

// fetch user projects
export async function GET() {
    try {
        const session = await getServerSession(NEXT_AUTH_CONFIG);
        const userId = session?.user.id || "";
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const userDetails = await prisma.user.findFirst({
            where: {
                id: userId
            },
            include: {
                projects: true
            }
        });

        if (!userDetails) {
            return NextResponse.json(
                { message: 'No user found ' },
                { status: 404 }
            );
        }

        return NextResponse.json(userDetails, { status: 200 });

    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}
