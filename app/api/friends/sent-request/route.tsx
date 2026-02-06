import getUserFromServer from "@/hooks/get-user-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await getUserFromServer();
    if (!session || !session.user) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    try {
        const sentRequest = await prisma.friendship.findMany({
            where: {
                senderId: session.user.id,
                stats: "PENDING"
            },
            include: {
                receiver: true
            },
        })
        return NextResponse.json({ success: true, sentRequest }, { status: 200 })
    } catch (error: any) {
        console.error("Error in /api/friends/sent-request: ", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong!" },
            { status: 500 }
        );
    }
}