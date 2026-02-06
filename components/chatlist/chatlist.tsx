"use client";

import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketProvider";
import getUserFromClient from "@/hooks/get-user-client";
import SearchBar from "./searchbar";
import { Conversation, Message } from "@/lib/generated/prisma/client";

interface User {
  id: string;
  name: string;
  image: string;
}
interface SingleConversation {
  id: string;
  updatedAt: Date;
  isGroup: boolean;
  participants: { user: User }[];
}
export default function ChatList() {
  const path = usePathname();
  const router = useRouter();
  const [groupFriends, setGroupFriends] = useState<Conversation[]>([]);
  const [conversations, setConversations] = useState<SingleConversation[]>([]);
  const user = getUserFromClient();
  const userId = user.session?.user.id;
  const { socket } = useSocket();

  const getSingleConversations = async () => {
    try {
      const response = await fetch("/api/conversation/get-all-conv");
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations);
        console.log("Data", data);
      } else {
        alert("No conversation yet!");
      }
    } catch (error) {
      console.error("Error in getSingleConversation(): ", error);
    }
  };
  const getGroupChat = async () => {
    try {
      const response = await fetch("/api/group");
      const data = await response.json();

      if (data.success) {
        setGroupFriends(data.conversation);
      }
    } catch (error) {
      console.error("Error in getGroupChat(): ", error);
    }
  };

  useEffect(() => {
    if (userId) {
      getGroupChat();
      getSingleConversations();
    }
  }, [userId]);

  useEffect(() => {
    if (!socket) return;
    socket?.on("message:receive", (message: Message) => {
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === message.conversationId ? { ...c, updatedAt: new Date() } : c,
        );
        return updated.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      });
    });

    return () => {
      socket?.off("message:receive");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket?.on("conversation:started", (conversation: SingleConversation) => {
      setConversations((prev) => {
        const exist = prev.find((c) => c.id === conversation.id);
        if (exist) {
          const filtered = prev.filter((c) => c.id !== conversation.id);
          return [conversation, ...filtered];
        }
        return [...prev, conversation];
      });
    });

    return () => {
      socket?.off("conversation:started");
    };
  }, [socket]);

  return (
    <div className="h-full flex flex-col w-full px-3 sm:px-0">
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-4">Chats</h1>
        <SearchBar />
      </div>

      <div
        className="flex-1 mt-3 space-y-4 h-full overflow-y-auto [&::-webkit-scrollbar]:w-2
[&::-webkit-scrollbar-track]:rounded-full
[&::-webkit-scrollbar-track]:bg-neutral-800
[&::-webkit-scrollbar-thumb]:rounded-full
[&::-webkit-scrollbar-thumb]:bg-neutral-700"
      >
        <div>
          {conversations && conversations.length > 0 ? (
            <div>
              {conversations
                .sort(
                  (a, b) =>
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime(),
                )
                .map((conversation, index) => {
                  const isActive = path.includes(conversation.id);
                  const friend = conversation.participants.find(
                    (participant) => participant.user.id !== userId,
                  )?.user;
                  return (
                    <div
                      key={index}
                      className={`flex gap-3 mb-2 py-3 px-2 w-full transition-colors duration-200 ease-out hover:bg-gray-800 cursor-pointer rounded-md ${
                        isActive ? "bg-white/30 shadow-2xl" : ""
                      }`}
                      onClick={() => {
                        router.push(`/chat/${conversation.id}`);
                      }}
                    >
                      <div>
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={friend?.image || ""}
                            className="object-fill"
                            referrerPolicy="no-referrer"
                          />
                          <AvatarFallback className="flex items-center justify-center mx-auto bg-gray-500 w-full text-xl font-bold object-cover">
                            {friend?.name[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <span className="font-medium">{friend?.name}</span>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              {groupFriends.length < 0 && conversations.length < 0 && (
                <p className="text-xs font-medium text-gray-600">
                  No conversations yet!
                </p>
              )}
            </div>
          )}

          <div>
            {groupFriends.map((group, index) => {
              const isActive = path.includes(group.id);
              return (
                <div
                  key={index}
                  className={`flex gap-3 mb-2 py-3 px-2 w-full transition-colors duration-200 ease-out hover:bg-gray-800 cursor-pointer rounded-md ${
                    isActive ? "bg-white/30 shadow-2xl" : ""
                  }`}
                  onClick={() => {
                    router.push(`/chat/gc/${group.id}`);
                  }}
                >
                  <div>
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={group.imageUrl || ""}
                        className="object-fill"
                        referrerPolicy="no-referrer"
                      />
                      <AvatarFallback className="flex items-center justify-center mx-auto bg-gray-500 w-full text-xl font-bold object-cover">
                        {group.name ? group.name[0] : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="font-medium">{group.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
