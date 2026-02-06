import getUserFromServer from "@/hooks/get-user-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getUserFromServer();
  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  try {
    const receiveRequest = await prisma.friendship.findMany({
      where: {
        receiverId: session.user.id,
        stats: "PENDING",
      },
      include: {
        sender: true,
      },
    });

    return NextResponse.json(
      { success: true, receiveRequest },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /api/friends/sent-request: ", error);
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong!" },
      { status: 500 }
    );
  }
}
