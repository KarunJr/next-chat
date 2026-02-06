import getUserFromServer from "@/hooks/get-user-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const session = await getUserFromServer();

  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const { friendId } = await request.json();
    console.log("Friend id:", friendId);
    if (!friendId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields!" },
        { status: 401 }
      );
    }
    const acceptFriend = await prisma.friendship.update({
      where: {
        id: friendId,
      },
      data: {
        stats: "ACCEPTED",
      },
    });
    return NextResponse.json({ success: true, acceptFriend });
  } catch (error: any) {
    console.error("Error in /api/friends/accept: ", error);
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong!" },
      { status: 500 }
    );
  }
}
