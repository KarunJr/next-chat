import BackButton from "@/components/BackButton";
import Loader from "@/components/Loader";
import MessageDisplay from "@/components/MessageDisplay";
import SendMessage from "@/components/SendMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFriendsFromConvId } from "@/hooks/get-friends-convId";
export default async function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const friend = await getFriendsFromConvId(conversationId);
  if (!friend) {
    return <Loader loading={true} />;
  }
  return (
    <div className="w-full h-full rounded-md bg-neutral-800 flex flex-col">
      <div className="bg-neutral-700 h-15 rounded-tr-md rounded-tl-md flex items-center justify-between px-3 shadow-xl">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={friend[0].image || "U"}
                className="object-fill"
              />
              <AvatarFallback className="flex items-center justify-center mx-auto bg-gray-500 w-full text-xl font-bold object-cover">
                {friend[0].name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <span className="font-medium">{friend[0].name}</span>
        </div>

        <div className="">
          <span>Action</span>
        </div>
      </div>

      <div className="flex-1 h-full flex flex-col overflow-y-auto">
        {/* Message Section */}
        <MessageDisplay
          conversationId={conversationId}
          friendImage={friend[0].image || "U"}
        />

        {/* Input Section */}
        <div className="px-4 py-4 w-full">
          <SendMessage conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
}
