"use client";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Conversation, Message, User } from "@/lib/generated/prisma/client";
import Loader from "./Loader";
import getUserFromClient from "@/hooks/get-user-client";
import Image from "next/image";
import { useSocket } from "@/context/SocketProvider";

interface MessageDisplayProps {
  conversationId: string;
  friendImage?: string;
  groupDetails?: GroupDetails | null;
  isGroup?: boolean;
}
interface Participants {
  id: string;
  joinedAt: Date;
  conversationId: string;
  userId: string;
  user: User;
}
interface GroupDetails {
  createdAt: Date;
  hashId: string;
  id: string;
  imageUrl: string | null;
  isGroup: boolean;
  name: string | null;
  participants: Participants[];
}
export default function MessageDisplay({
  conversationId,
  friendImage,
  groupDetails,
  isGroup,
}: MessageDisplayProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const session = getUserFromClient();
  const userId = session.session?.user.id;
  const { socket } = useSocket();

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  useEffect(() => {
    const container = containerRef.current;
    if (messages.length > 0 && firstLoad) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
      setFirstLoad(false);
    }

    if (!container) return;

    const handleScroll = () => {
      if (
        container.scrollHeight - container.scrollTop - container.clientHeight <
        50
      ) {
        isAtBottomRef.current = true;
      } else {
        isAtBottomRef.current = false;
      }

      if (container.scrollTop === 0) {
        console.log("Fetching new message");

        if (messages.length === 0) {
          console.log("Initial messages not loaded yet");
          return;
        }
        if (!hasMore) {
          console.log("No more messages!");
          return;
        }
        loadOlderMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [messages]);

  const getAllMessages = async () => {
    if (!conversationId || !userId) {
      return "Unauthorized!";
    }

    try {
      const response = await fetch(
        `/api/message?conversationId=${conversationId}&limit=${20}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
      } else {
        return <Loader loading={true} />;
      }
    } catch (error) {
      console.error("Error in getAllMessages(): ", error);
    }
  };

  const loadOlderMessages = async () => {
    if (!conversationId || !userId) {
      return "Unauthorized!";
    }

    const container = containerRef.current;

    if (!container) return;

    const prevScrollHeight = container.scrollHeight;
    if (!messages || messages.length === 0) {
      console.log("No messages loaded yet.");
      return;
    }

    try {
      const olderMessageId = messages[0].id;
      const response = await fetch(
        `/api/message?conversationId=${conversationId}&limit=${100}&before=${olderMessageId}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [...data.messages, ...prev]);
        setHasMore(data.hasMore);
      }

      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight;

        const heightDiff = newScrollHeight - prevScrollHeight;

        container.scrollTo({ top: heightDiff, behavior: "instant" });
      });
    } catch (error) {
      console.error("Error in loadOlderMessages(): ", error);
    }
  };

  useEffect(() => {
    if (userId && conversationId) {
      getAllMessages();
    }
  }, [conversationId]);

  //socket.io-client Connection....
  useEffect(() => {
    if (!conversationId || !socket) return;

    socket.emit("conversation:join", conversationId);

    return () => {
      socket.emit("conversation:leave", conversationId);
    };
  }, [conversationId, socket]);

  //Get message from the socket
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg: Message) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;

          return [...prev, msg];
        });

        if (isAtBottomRef.current) {
          const container = containerRef.current;
          if (!container) return;
          requestAnimationFrame(() => {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: "instant",
            });
          });
        }
      }
    };
    socket.on("message:receive", handleReceive);

    return () => {
      socket.off("message:receive", handleReceive);
    };
  }, [conversationId, socket]);

  return (
    <div
      className="flex-1 px-8 h-full w-full overflow-y-auto"
      ref={containerRef}
    >
      {messages.map((message, index) => {
        const senderForGroup = groupDetails?.participants.find(
          (participant) => participant.userId === message.senderId
        );
        return (
          <div
            key={index}
            className={`flex flex-col mt-3 ${
              message.senderId === userId ? "items-end" : "items-start"
            }`}
          >
            <div className="flex gap-2 items-center max-w-[50%]">
              {message.senderId !== userId && (
                <div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={isGroup ? senderForGroup?.user.image! : friendImage}
                      // src={friendImage}
                      className="object-fill"
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="flex items-center justify-center mx-auto bg-gray-500 w-full text-xl font-bold object-cover">
                      "U"
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div>
                {message.messageType === "text" ? (
                  <p
                    className={`text-xm ${
                      message.senderId === userId
                        ? "bg-blue-500 px-3 py-2 rounded-2xl"
                        : "bg-neutral-500 px-3 py-2 rounded-2xl"
                    }`}
                  >
                    {message.text}
                  </p>
                ) : (
                  <Image
                    src={message.text}
                    alt="messageImage"
                    width={300}
                    height={300}
                    className="object-cover w-full h-auto max-h-52 max-w-xs md:max-h-80 md:max-w-md rounded-md"
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
