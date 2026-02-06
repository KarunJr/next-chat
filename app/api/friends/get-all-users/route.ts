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
        id: { not: session.user.id },
        AND: [
          {
            sentRequest: {
              none: {
                receiverId: session.user.id,
              },
            },
          },

          {
            receiveRequest: {
              none: {
                senderId: session.user.id,
              },
            },
          },
        ],
      },
      include: {
        sentRequest: true,
        receiveRequest: true,
      },
    });
    return NextResponse.json(friends);
  } catch (error: any) {
    console.error("Error in /api/friends/get-all-users: ", error);
    return NextResponse.json(
      { message: error.message || "Something went wrong!" },
      { status: 500 }
    );
  }
}
