import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: NextRequest, res: NextResponse) {
    const body = await req.json();
    const { userId } = body;

    const result = await prisma.account.findFirst({
        where: {
            userId
        }
    });

    if (result?.provider != "github") {
        return NextResponse.json({ error: "Invalid provider" }, { status: 402 });
    }

    return NextResponse.json({ msg: "success" }, { status: 200 });
}