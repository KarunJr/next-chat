import getUserFromServer from "@/hooks/get-user-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getUserFromServer();
  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const friends = await prisma.user.findMany({
      where: {
        OR: [
          {
            sentRequest: {
              some: {
                receiverId: session.user.id,
                stats: "ACCEPTED",
              },
            },
          },
          {
            receiveRequest: {
              some: {
                senderId: session.user.id,
                stats: "ACCEPTED",
              },
            },
          },
        ],
      },
      select: { id: true, name: true, image: true },
    });

    // I did this to include conversationId with friend details, without this I will get the friends details but i cant get the conversationId which is required for making the active path. Before I just pass friends in Response but it is not enough. So I come up with this solution.

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: { participants: true },
    });

    const friendsWithConversation: Record<string, string> = {};

    conversations
      .filter((conversation) => conversation.isGroup === false)
      .forEach((conversation) => {
        const isFriend = conversation.participants.find(
          (participation) => participation.userId !== session.user.id
        );

        if (isFriend) {
          friendsWithConversation[isFriend.userId] = conversation.id;
        }
      });

    const friendsWithConversationId = friends.map((friend) => ({
      ...friend,
      conversationId: friendsWithConversation[friend.id] || null,
    }));

    return NextResponse.json(friendsWithConversationId);
  } catch (error: any) {
    console.error("Error in /api/friends/get-friends: ", error);
    return NextResponse.json(
      { message: error.message || "Something went wrong!" },
      { status: 500 }
    );
  }
}
