import ChatBar from "@/components/ChatBar";
import ChatList from "@/components/chatlist/chatlist";
import { SocketProvider } from "@/context/SocketProvider";
import getUserFromServer from "@/hooks/get-user-server";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
    const session = await getUserFromServer();
    return (
        <>
            <SocketProvider userId={session?.user.id}>
                <div className="h-screen bg-black text-white w-full py-3 relative">

                    {/* Mobile layout */}
                    <div className="sm:hidden h-full w-full">
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
            </SocketProvider>
        </>
        // <>
        //     <SocketProvider userId={session?.user.id}>
        //         <ChatUI>
        //             {children}
        //         </ChatUI>
        //     </SocketProvider>
        // </>
        // <>
        //     <SocketProvider userId={session?.user.id}>
        //         <div className="h-screen bg-black text-white w-full sm:flex gap-3 py-3 relative">
        //             <div className="py-2 px-3 shadow-xl rounded-md fixed bottom-0 sm:flex sm:relative">
        //                 <ChatBar />
        //             </div>

        //             <div className="sm:flex-1 px-3 py-2 bg-neutral-900 rounded-md shadow-xl h-full">
        //                 <ChatList />
        //             </div>

        //             <div className="sm:flex-3 px-3  sm:block">
        //                 {children}
        //             </div>
        //         </div>
        //     </SocketProvider>
        // </>
    )
}
