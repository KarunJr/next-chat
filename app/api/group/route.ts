import getUserFromServer from "@/hooks/get-user-server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

//Route to get all the group joined/created by the user
export async function GET(request: Request) {
  const session = await getUserFromServer();

  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/", request.url), { status: 401 });
  }

  try {
    const conversation = await prisma.conversation.findMany({
      where: {
        isGroup: true,
        participants: {
          some: { userId: session.user.id },
        },
      },
    });

    return NextResponse.json({ success: true, conversation });
  } catch (error: any) {
    console.error("Error in /api/group: ", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
}
