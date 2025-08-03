// import { getServerSession } from "next-auth";
// import { NEXT_AUTH_CONFIG } from "@/src/lib/auth";
// import { azureStorage } from "@/src/lib/azure/client";

// export async function GET(
//   request: Request,
//   { params }: { params: Promise<{ userId: string; projectName: string }> }
// ) {
//     try {
//         const session = await getServerSession(NEXT_AUTH_CONFIG);
//         const userId = session?.user?.email || "";

//         if (userId === "") {
//             return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400 });
//         }

//         // Await params before destructuring
//         const resolvedParams = await params;
//         const { projectName } = resolvedParams;
        
//         // console.log("Project Name:", projectName);
        
//         if (!projectName) {
//             return new Response(JSON.stringify({ error: "Project name is required" }), { status: 400 });
//         }

//         const project: { [key: string]: string } = await azureStorage.getProjectFiles(userId, projectName);

//         // console.log("Fetched Project:", Object.keys(project));
        
//         if (!project) {
//             return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });
//         }
//         return new Response(JSON.stringify(project), { status: 200 });

//     } catch (error) {
//         console.error("Error fetching project files:", error);
//         return new Response(JSON.stringify({ error: "Failed to fetch project files" }), { status: 500 });
//     }
// }