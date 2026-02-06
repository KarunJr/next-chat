import getUserFromServer from "@/hooks/get-user-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getUserFromServer();
  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  try {
    const { message, conversationId, messageType } = await request.json();

    if (!message || !conversationId || !messageType) {
      return NextResponse.json(
        { message: "Missing required fields!" },
        { status: 400 }
      );
    }
    
    const [newMessage] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: conversationId,
          text: message,
          messageType: messageType,
          senderId: session.user.id,
        },
      }),
      prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          updatedAt: new Date(),
        },
      }),
    ]);
    return NextResponse.json({ newMessage });
  } catch (error: any) {
    console.error("Error in /api/message: ", error);
    return NextResponse.json(
      { message: error.message || "Something went wrong!" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await getUserFromServer();
  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const { searchParams } = new URL(request.url);

    const conversationId = searchParams.get("conversationId");
    const limit = Number(searchParams.get("limit") || 50);
    const before = searchParams.get("before");
    if (!conversationId) {
      return NextResponse.json(
        { message: "Missing required fields!" },
        { status: 400 }
      );
    }

    let cursor = undefined;

    if (before) {
      cursor = {
        id: before,
      };
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      take: -limit,
      ...(cursor && { cursor }),
      skip: cursor ? 1 : 0,
      include: {
        sender: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      messages,
      hasMore: messages.length === limit,
    });
  } catch (error: any) {
    console.error("Error in /api/message: ", error);
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong!" },
      { status: 500 }
    );
  }
  // try {
  //   const { searchParams } = new URL(request.url);

  //   const conversationId = searchParams.get("conversationId");

  //   if (!conversationId) {
  //     return NextResponse.json(
  //       { message: "Missing required fields!" },
  //       { status: 400 }
  //     );
  //   }

  //   const messages = await prisma.message.findMany({
  //     where: {
  //       conversationId: conversationId,
  //     },
  //     include: {
  //       sender: true,
  //     },
  //     orderBy: { createdAt: "asc" },
  //   });

  //   return NextResponse.json({ success: true, messages });
  // } catch (error: any) {
  //   console.error("Error in /api/message: ", error);
  //   return NextResponse.json(
  //     { success: false, message: error.message || "Something went wrong!" },
  //     { status: 500 }
  //   );
  // }
}
