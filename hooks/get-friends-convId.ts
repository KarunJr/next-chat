"use server"
import { prisma } from "@/lib/prisma";
import getUserFromServer from "./get-user-server";

export async function getFriendsFromConvId(conversationId: string) {
  try {
    if (!conversationId) return null;
    const session = await getUserFromServer();
    const userId = session?.user.id;
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        participants: {
          include: { user: true },
        },
        messages: true,
      },
    });

    if (!conversation) return null;

    const friends = conversation?.participants
      .filter((participant) => participant.userId !== userId)
      .map((participant) => participant.user);

    return friends;
  } catch (error) {
    console.error("Error in getFriendsFromConvId(): ", error);
    return null;
  }
}
