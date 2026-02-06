import getUserFromServer from "@/hooks/get-user-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const session = await getUserFromServer();

  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const { friendId } = await request.json();
    if (!friendId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields!" },
        { status: 401 }
      );
    }
    const rejectFriend = await prisma.friendship.delete({
      where: {
        id: friendId,
      },
    });
    console.log("This is executed", rejectFriend);
    return NextResponse.json({ success: true, rejectFriend });
  } catch (error: any) {
    console.error("Error in /api/friends/reject: ", error);
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong!" },
      { status: 500 }
    );
  }
}
