import { azureStorage } from '@/lib/azure/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { NEXT_AUTH_CONFIG } from '@/lib/auth';

// 
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; projectName: string }> }
) {
  try {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized: User session not found' },
        { status: 401 }
      );
    }

    const userId = session.user.email;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Await params before destructuring
    const resolvedParams = await params;
    const { projectName } = resolvedParams;
    if (!projectName || typeof projectName !== 'string') {
      return NextResponse.json(
        { error: 'Project name is required and must be a string' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { path, folderName } = body;

    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { error: 'Path is required and must be a string' },
        { status: 400 }
      );
    }

    if (!folderName || typeof folderName !== 'string') {
      return NextResponse.json(
        { error: 'Folder name is required and must be a string' },
        { status: 400 }
      );
    }

    await azureStorage.createFolderStructure(path, folderName, userId, projectName);
    
    return NextResponse.json(
      { success: true, message: `Folder '${folderName}' created at '${path}'.` },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error creating folder:', err);
    return NextResponse.json(
      { 
        error: 'Failed to create folder', 
        detail: err instanceof Error ? err.message : String(err) 
      },
      { status: 500 }
    );
  }
}