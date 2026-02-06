import MessageDisplay from "@/components/MessageDisplay";
import SendMessage from "@/components/SendMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { prisma } from "@/lib/prisma";

export default async function GroupChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const groupDetails = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      participants: { include: { user: true } },
    },
  });
  console.log("GroupDetails:", groupDetails);

  return (
    <div className="w-full h-full rounded-md bg-neutral-800 flex flex-col">
      <div className="bg-neutral-700 h-15 rounded-tr-md rounded-tl-md flex items-center justify-between px-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div>
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={groupDetails?.imageUrl || "U"}
                className="object-fill"
              />
              <AvatarFallback className="flex items-center justify-center mx-auto bg-gray-500 w-full text-xl font-bold object-cover">
                {groupDetails!.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col">
            <span className="font-bold">{groupDetails!.name}</span>
            <span className="text-xs text-gray-400">
              {groupDetails!.participants
                .map((participant) => participant.user.name)
                .join(", ")}
            </span>
          </div>
        </div>

        <div className="">
          <span>Action</span>
        </div>
      </div>

      <div className="flex-1 h-full flex flex-col overflow-y-auto">
        {/* Message Section */}
        <MessageDisplay
          conversationId={conversationId}
          groupDetails={groupDetails}
          isGroup={true}
        />

        {/* Input Section */}
        <div className="px-4 py-4 w-full">
          <SendMessage conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
}
