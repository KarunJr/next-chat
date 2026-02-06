
/*"use client"

import { useSocket } from "@/context/SocketProvider"
import ChatBar from "./ChatBar";
import ChatList from "./chatlist/chatlist";

export default function ChatUI({ children }: { children: React.ReactNode }) {
    const { isMobile } = useSocket();
    return (
        <div>
            {
                isMobile ? (
                    <div className="h-screen bg-black text-white w-full py-3 relative">
                        {children}
                    </div>
                ) : (
                    <div className="h-screen bg-black text-white w-full sm:flex gap-3 py-3 relative">
                        <div className="py-2 px-3 shadow-xl rounded-md fixed bottom-0 sm:flex sm:relative">
                            <ChatBar />
                        </div>

                        <div className="sm:flex-1 px-3 py-2 bg-neutral-900 rounded-md shadow-xl h-full">
                            <ChatList />
                        </div>

                        <div className="sm:flex-3 px-3 sm:block">
                            {children}
                        </div>
                    </div>
                )
            }
        </div>
    )
}*/

"use client"

import ChatBar from "./ChatBar";
import ChatList from "./chatlist/chatlist";

export default function ChatUI({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-black text-white w-full py-3 relative">

      {/* Mobile layout */}
      <div className="sm:hidden h-full w-full px-3">
        {children}
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:flex gap-3 h-full">

        <div className="py-2 px-3 shadow-xl rounded-md relative">
          <ChatBar />
        </div>

        <div className="flex-1 px-3 py-2 bg-neutral-900 rounded-md shadow-xl">
          <ChatList />
        </div>

        <div className="flex-3 px-3">
          {children}
        </div>

      </div>
    </div>
  );
}
