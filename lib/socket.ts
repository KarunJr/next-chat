"use client";
import { io, Socket } from "socket.io-client";

let socket: Socket | null;

export const connectSocket = (userId: string) => {
  if (!userId) return;

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      auth: {
        userId: userId,
      },
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
