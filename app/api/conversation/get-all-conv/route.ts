import getUserFromServer from "@/hooks/get-user-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getUserFromServer();
  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/", request.url), { status: 401 });
  }
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        isGroup: false,
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      select: {
        id: true,
        updatedAt: true,
        isGroup: true,
        participants: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (conversations.length > 0) {
      return NextResponse.json({ success: true, conversations });
    } else {
      return NextResponse.json({
        success: false,
        message: "No conversation started yet!",
      });
    }
  } catch (error: any) {
    console.error("Error in /api/conversation/get-all-conv: ", error);
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong!" },
      { status: 500 }
    );
  }
}
