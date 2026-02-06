"use client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { motion } from "motion/react";
import getUserFromClient from "@/hooks/get-user-client";
import { User } from "@/lib/generated/prisma/client";
import { formatDistance } from "date-fns";
import { useSocket } from "@/context/SocketProvider";

interface SentRequest {
  id: string;
  senderId: string;
  receiverId: string;
  stats: string;
  createdAt: number;
  receiver: User;
  sender: User;
}
export default function Profile() {
  const user = getUserFromClient();
  const [toggle, setToggle] = useState("sent_request");
  const [sentFriends, setSentFriends] = useState<SentRequest[]>([]);
  const [receiveFriends, setReceiveFriends] = useState<SentRequest[]>([]);
  const { socket } = useSocket();
  const getSentRequest = async () => {
    if (!user || !user.session?.user) return;

    try {
      const response = await fetch("/api/friends/sent-request");
      const data = await response.json();

      if (data.success) {
        setSentFriends(data.sentRequest);
      }
    } catch (error) {
      console.error("Error in getSentRequest(): ", error);
    }
  };
  const getReceiveRequest = async () => {
    if (!user || !user.session?.user) return;

    try {
      const response = await fetch("/api/friends/receive-request");
      const data = await response.json();

      if (data.success) {
        setReceiveFriends(data.receiveRequest);
      }
    } catch (error) {
      console.error("Error in getReceiveRequest(): ", error);
    }
  };

  const cancelRequest = async (
    friendId: string,
    type: "send" | "receive",
    senderId: string
  ) => {
    if (!friendId) return;

    if (type === "send") {
      setSentFriends((prev) => prev.filter((id) => id.id !== friendId));
    } else {
      setReceiveFriends((prev) => prev.filter((id) => id.id !== friendId));
    }
    try {
      const response = await fetch("/api/friends/reject", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId: friendId }),
      });
      const data = await response.json();

      if(data.success && socket){
        socket.emit("request:reject", {
            rejectedBy: user.session?.user.id,
            rejectedTo: senderId
        })
      }
    } catch (error) {
      console.error("Error in cancelRequest(): ", error);
    }
  };

  const acceptRequest = async (friendId: string, senderId: string) => {
    if (!friendId) return;

    setReceiveFriends((prev) => prev.filter((id) => id.id !== friendId));
    try {
      const response = await fetch("/api/friends/accept", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId: friendId }),
      });
      const data = await response.json();

      if (data.success && socket) {
        socket.emit("request:accept", {
          acceptedBy: user.session?.user.id,
          requestedBy: senderId,
        });
      }
    } catch (error) {
      console.error("Error in acceptRequest():", error);
    }
  };

  useEffect(() => {
    getSentRequest();
    getReceiveRequest();
  }, []);

  useEffect(() => {
    socket?.on("friend-request-accepted", ({ acceptedBy }) => {
      console.log("Friend requested accepted by:", acceptedBy);

      setSentFriends((prev) => prev.filter((p) => p.receiverId !== acceptedBy));
    });
  }, []);

  useEffect(()=>{
    socket?.on("friend-request-rejected",({rejectedTo})=>{
      console.log("Friend requested rejected by:", rejectedTo);

      setSentFriends((prev)=> prev.filter((p)=> p.senderId !== rejectedTo))
    })
  }, [])
  return (
    <div>
      <div className="px-3">
        <h1 className="text-xl font-medium mb-6">Profile</h1>
      </div>

      <div className="flex flex-col justify-center items-center gap-3">
        <div>
          <Avatar className="h-14 w-14">
            <AvatarImage
              src={user?.session?.user.image || ""}
              className="object-fill"
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="flex items-center justify-center mx-auto bg-gray-500 w-full text-xl font-bold object-cover">
              {user?.session?.user.name.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <span className="text-xl font-medium">{user.session?.user.name}</span>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <h1 className="text-xl font-medium px-3">Friend Zone</h1>
        <div className="flex bg-black w-full shadow-xl mb-4">
          <button
            className={`w-1/2 text-center cursor-pointer py-1 ${
              toggle === "sent_request"
                ? "bg-white text-black transition-colors ease-in duration-200"
                : ""
            }`}
            onClick={() => setToggle("sent_request")}
          >
            Sent Request
          </button>
          <button
            className={`w-1/2 text-center cursor-pointer ${
              toggle === "received_request"
                ? "bg-white text-black transition-colors ease-in duration-200"
                : ""
            }`}
            onClick={() => setToggle("received_request")}
          >
            Received Request
          </button>
        </div>
      </div>

      <div>
        {toggle === "sent_request" && (
          <div className="space-y-2">
            {sentFriends.length > 0 ? (
              sentFriends.map((sentFriend, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.9, ease: "easeIn" }}
                  className="px-3 py-2 bg-black"
                  key={index}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <div>
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={sentFriend.receiver.image || ""}
                            className="object-fill"
                            referrerPolicy="no-referrer"
                          />
                          <AvatarFallback className="flex items-center justify-center mx-auto bg-gray-500 w-full text-xl font-bold object-cover">
                            {sentFriend.receiver.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span>{sentFriend.receiver.name}</span>
                        <span className="text-xs text-gray-300">
                          {formatDistance(
                            new Date(sentFriend.createdAt),
                            new Date(),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      className="bg-red-500 px-3 py-2 cursor-pointer hover:bg-red-700 shadow-2xl transition-colors duration-300 ease-in rounded-md text-xs font-medium"
                      onClick={() =>
                        cancelRequest(
                          sentFriend.id,
                          "send",
                          sentFriend.senderId
                        )
                      }
                    >
                      Withdraw
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="mx-auto text-center flex justify-center items-center h-80 text-gray-500 text-xm">
                No friend request sent
              </p>
            )}
          </div>
        )}
      </div>
      <div>
        {toggle === "received_request" && (
          <div className="space-y-2">
            {receiveFriends.length > 0 ? (
              receiveFriends.map((receiveFriend, index) => (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.9, ease: "easeIn" }}
                  className="px-3 py-2 bg-black"
                  key={index}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <div>
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={receiveFriend.sender.image || ""}
                            className="object-fill"
                            referrerPolicy="no-referrer"
                          />
                          <AvatarFallback className="flex items-center justify-center mx-auto bg-gray-500 w-full text-xl font-bold object-cover">
                            {receiveFriend.sender.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span>{receiveFriend.sender.name}</span>
                        <span className="text-xs text-gray-300">
                          {formatDistance(
                            new Date(receiveFriend.createdAt),
                            new Date(),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="bg-blue-500 px-2 cursor-pointer hover:bg-blue-700 shadow-2xl transition-colors duration-300 ease-in rounded-md text-xm"
                        onClick={() =>
                          acceptRequest(
                            receiveFriend.id,
                            receiveFriend.senderId
                          )
                        }
                      >
                        Accept
                      </button>

                      <button
                        className="bg-red-500 px-3 py-2 cursor-pointer hover:bg-red-700 shadow-2xl transition-colors duration-300 ease-in rounded-md"
                        onClick={() =>
                          cancelRequest(
                            receiveFriend.id,
                            "receive",
                            receiveFriend.senderId
                          )
                        }
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="mx-auto text-center flex justify-center items-center h-80 text-gray-500 text-xm">
                No friend requests receive!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
