import getUserFromServer from "@/hooks/get-user-server";
import {
  generateHashForGroupConversation,
} from "@/lib/generate-hash-id";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RequestBody {
  groupName: string;
  memberIds: string[];
  imageUrl: string;
}

export async function POST(request: Request) {
  const session = await getUserFromServer();
  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/", request.url), { status: 401 });
  }
  try {
    const { groupName, memberIds, imageUrl }: RequestBody =
      await request.json();

    if (!groupName || memberIds.length < 2) {
      return NextResponse.json(
        { success: false, message: "Missing required fields!" },
        { status: 400 }
      );
    }

    const validMembers = await prisma.user.findMany({
      where: {
        id: { in: memberIds },
      },
    });

    if (validMembers.length !== memberIds.length) {
      return NextResponse.json(
        { success: false, message: "No valid members!" },
        { status: 400 }
      );
    }
    if (!memberIds.includes(session.user.id)) {
      memberIds.push(session.user.id);
    }
    const hashId = generateHashForGroupConversation(memberIds, groupName);
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        hashId: hashId,
        isGroup: true,
        name: groupName.trim(),
      },
    });

    if (existingConversation) {
      return NextResponse.json(
        {
          success: false,
          message: "Group already exist with same name"
        },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.create({
      data: {
        hashId: hashId,
        name: groupName.trim(),
        isGroup: true,
        imageUrl: imageUrl || "/group_chat_profile.jpg",
        participants: {
          create: memberIds.map((id) => ({ userId: id })),
        },
      },
    });
    return NextResponse.json(
      {
        success: true,
        conversation,
        conversationId: conversation.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /api/conversation/group-start: ", error);
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong!" },
      { status: 500 }
    );
  }
}
