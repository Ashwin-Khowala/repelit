import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";

export async function GET(req: NextRequest) {
    const headerList = await headers();
    const accessToken = headerList.get('accessToken');

    if (!accessToken) {
        return NextResponse.json({ msg: "Token not found" }, { status: 401 });
    }

    try {
        const octokit = new Octokit({
            auth: accessToken
        });

        // Get authenticated user's repositories
        const getRepos = await octokit.request('GET /user/repos', {
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            },
            sort: 'updated',
            per_page: 100, 
            type: 'all'
        });

        console.log(`Found ${getRepos.data.length} repositories`);
        
        return NextResponse.json({
            repositories: getRepos.data,
            total_count: getRepos.data.length
        });

    } catch (error) {
        console.error('GitHub API Error:', error);
        return NextResponse.json(
            { 
                msg: "Failed to fetch repositories",
                error: error instanceof Error ? error.message : 'Unknown error'
            }, 
            { status: 500 }
        );
    }
}

export async function getUserRepos(username: string, accessToken: string) {
    const octokit = new Octokit({
        auth: accessToken
    });

    const getRepos = await octokit.request('GET /users/{username}/repos', {
        username: username,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        },
        sort: 'updated',
        per_page: 100,
        type: 'all'
    });

    return getRepos.data;
}