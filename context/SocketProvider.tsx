"use client";

import { User } from "@/lib/generated/prisma/client";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useEffect, useState, createContext, useContext } from "react";
import { Socket } from "socket.io-client";

export interface Friends {
  id: string;
  name: string | null;
  image: string | null;
  conversationId: string | null;
}

interface DefaultContext {
  socket: Socket | null;
  friends: Friends[];
  isMobile: Boolean
}
const SocketContext = createContext<DefaultContext>({
  socket: null,
  friends: [],
  isMobile: false
});

export const SocketProvider = ({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string | undefined;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [friends, setFriends] = useState<Friends[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)

    checkMobile();

    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])
  const getFriends = async () => {
    try {
      const response = await fetch("/api/friends/get-friends");
      const data = await response.json();

      if (data) {
        setFriends(data);
      }
    } catch (error) {
      console.error("Error in getFriends(): ", error);
    }
  };

  useEffect(() => {
    if (userId) {
      getFriends();
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const s = connectSocket(userId);
    if (s) {
      setSocket(s);
    }

    return () => {
      disconnectSocket();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, friends, isMobile }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
