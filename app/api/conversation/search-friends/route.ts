import getUserFromServer from "@/hooks/get-user-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getUserFromServer();
  if (!session || !session.user)
    return NextResponse.redirect(new URL("/", request.url), { status: 400 });
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const friends = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                name: {
                  startsWith: query,
                  mode: "insensitive",
                },
              },
              {
                name: {
                  contains: " " + query,
                  mode: "insensitive",
                },
              },
            ],
          },

          {
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
        ],
      },
    });
    if (friends.length > 0) {
      return NextResponse.json({ success: true, friends });
    } else {
      return NextResponse.json({
        success: false,
        message: "No friends found!",
      });
    }
  } catch (error: any) {
    console.error("Error in /api/conversation/search-friends: ", error);
    return NextResponse.json(
      { message: error.message || "Something went wrong!" },
      { status: 500 }
    );
  }
}
