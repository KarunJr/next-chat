import ChatBar from "@/components/ChatBar";
import ChatList from "@/components/chatlist/chatlist";
import EmptySection from "@/components/EmptySection";

export default function ChatPage() {
    return (
        <>
            {/* Mobile */}
            <div className="sm:hidden flex h-screen bg-black text-white w-full py-3 relative ">
                <div className="w-full ">
                        <ChatList />
                </div>

                <div className="px-3 py-2 fixed bottom-0 border-t w-full flex items-center justify-center mx-auto">
                    <ChatBar />
                </div>
            </div>

            {/* Desktop */}
            <div className="sm:flex hidden w-full h-full">
                <EmptySection />
            </div>
        </>
    )
}