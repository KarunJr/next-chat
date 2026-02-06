import getUserFromServer from "@/hooks/get-user-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getUserFromServer();
  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  try {
    const { senderId, receiverId } = await request.json();
    if (!senderId || !receiverId) {
      return new NextResponse("Something is missing!");
    }

    const existingFriends = await prisma.friendship.findFirst({
        where: {
            OR: [
                {senderId: senderId, receiverId: receiverId},
                {senderId: receiverId, receiverId: senderId}
            ]
        }
    });

    if(existingFriends){
        return  NextResponse.json({message: "You are already friends"}, {status: 400})
    };

    const sentRequest = await prisma.friendship.create({
      data: {
        senderId: senderId,
        receiverId: receiverId,
      },
    });

    return NextResponse.json(sentRequest);
  } catch (error: any) {
    console.error("Error in /api/friends/add-friend: ", error);
    return  NextResponse.json({message: error.message || "Something went wrong!"}, {status: 500});
  }
}
