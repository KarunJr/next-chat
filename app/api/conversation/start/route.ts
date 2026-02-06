import getUserFromServer from "@/hooks/get-user-server";
import { generateHashForConversation } from "@/lib/generate-hash-id";
import { Conversation } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Route to start 1:1 conversation

export async function POST(request: Request) {
  const session = await getUserFromServer();

  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/", request.url), { status: 401 });
  }

  try {
    const { friendId } = await request.json();
    if (!friendId) {
      return NextResponse.json(
        { success: false, message: "Missing require fields!" },
        { status: 400 }
      );
    }

    const friend = await prisma.user.findUnique({
      where: {
        id: friendId,
      },
    });

    if (!friend) {
      return NextResponse.json(
        { success: false, message: "Friend not found!" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    const hashId = generateHashForConversation([userId, friendId]);

    let conversation = await prisma.conversation.findUnique({
      where: {
        hashId: hashId,
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

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          isGroup: false,
          hashId: hashId,
          participants: {
            create: [{ userId: userId }, { userId: friendId }],
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
    }
    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      conversation,
    });
  } catch (error: any) {
    console.error("Error in /api/conversation/start: ", error);
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong!" },
      { status: 500 }
    );
  }
}

/*
// This is old one works perfectly fine, new method uses Hash 
let conversation = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          {
            participants: {
              some: {userId: userId}
            }
          },
          {
            participants: {
              some: {userId: friendId}
            }
          }
        ]
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          isGroup: false,
          participants: {
            create: [{ userId: userId }, { userId: friendId }],
          },
          hashId: "kamala"
        },
      });
    }
*/
