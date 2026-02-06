"use client";
import { Contact, LogOut, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Friends from "./sidebar/friends";
import { motion, AnimatePresence } from "motion/react";
import Profile from "./sidebar/profile";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { signOut } from "next-auth/react";
import getUserFromClient from "@/hooks/get-user-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import CreateGroup from "./sidebar/create-group";
import { useSocket } from "@/context/SocketProvider";

export default function ChatBar() {
  const [showFriends, setShowFriends] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { isMobile } = useSocket();
  const user = getUserFromClient();
  const path = usePathname();
  return (
    <div className="relative flex h-full w-full justify-center sm:justify-start">
      <div className="flex sm:flex-col sm:gap-3 gap-8">
        <Link
          className={`h-10 w-10 hover:bg-gray-500 transition-colors duration-300 ease-in flex items-center justify-center rounded-md cursor-pointer ${path === "/chat" ? "bg-gray-500" : ""}`}
          href={`/chat`}
          onClick={() => {
            setShowFriends(false);
            setShowProfile(false);
          }}
        >
          <Tooltip>
            <TooltipTrigger>
              <MessageCircle className="h-7 w-7" />
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
              className="text-xs font-bold"
            >
              <p>Chats</p>
            </TooltipContent>
          </Tooltip>
        </Link>

        <div
          className={`h-10 w-10 hover:bg-gray-500 transition-colors duration-300 ease-in flex items-center justify-center rounded-md cursor-pointer ${showFriends ? "bg-gray-500" : ""}`}
          onClick={() => {
            if (showProfile) {
              setShowProfile(false);
              setShowFriends(true);
            } else {
              setShowFriends(!showFriends);
            }
          }}
        >
          <Tooltip>
            <TooltipTrigger>
              <Contact className="h-7 w-7" />
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
              className="text-xs font-bold"
            >
              <p>Add Friends</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="h-10 w-10 hover:bg-gray-500 transition-colors duration-300 ease-in flex items-center justify-center rounded-md cursor-pointer">
          <Tooltip>
            {/* <TooltipTrigger><Users/></TooltipTrigger> */}
            <TooltipTrigger>
              <CreateGroup />
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
              className="text-xs font-bold"
            >
              <h1>Create Group</h1>
            </TooltipContent>
          </Tooltip>
        </div>

        <div
          className={`h-10 w-10 hover:bg-gray-500 transition-colors duration-300 ease-in flex items-center justify-center rounded-md cursor-pointer ${showProfile ? "bg-gray-500" : ""}`}
          onClick={() => {
            if (showFriends) {
              setShowFriends(false);
              setShowProfile(true);
            } else {
              setShowProfile(!showProfile);
            }
          }}
        >
          <Tooltip>
            <TooltipTrigger>
              <div>
                <Avatar className="h-12 w-12">
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
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
              className="text-xs font-bold"
            >
              <p>Profile</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div
          className="h-10 w-10 hover:bg-gray-500 transition-colors duration-300 ease-in flex items-center justify-center rounded-md cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <Tooltip>
            <TooltipTrigger>
              <LogOut className="h-7 w-7" />
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
              className="text-xs font-bold"
            >
              <button>Logout</button>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <AnimatePresence>
        {showFriends && (
          <motion.div
            initial={ isMobile ? { y: 300, opacity: 0 } : { x: -400, opacity: 0 }}
            animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: 300, opacity: 0 } : { x: -400, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute sm:left-12 sm:top-0 sm:bottom-0 bottom-10 left-0 right-0 sm:w-[400px] h-[90vh] sm:h-auto bg-neutral-800 shadow-xl rounded-md z-10 py-6 px-4"
          >
            <Friends />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={ isMobile ? { y: 300, opacity: 0 } : { x: -400, opacity: 0 }}
            animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: 300, opacity: 0 } : { x: -400, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute sm:left-12 sm:top-0 sm:bottom-0 bottom-10 left-0 right-0 sm:w-[400px] h-[70vh]sm:h-auto bg-neutral-800 shadow-xl rounded-md z-10 py-6 px-4"
          >
            <Profile />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
