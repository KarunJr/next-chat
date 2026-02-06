"use client";
import { Search } from "lucide-react";
import { User } from "next-auth";
import { useEffect, useState } from "react";
import Loader from "../Loader";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketProvider";
import getUserFromClient from "@/hooks/get-user-client";

export default function SearchBar() {
  const [loading, setLoading] = useState(false);
  const [searchFriends, setSearchFriends] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();
  const user = getUserFromClient();
  const userId = user.session?.user.id
  const { socket } = useSocket();
  const startConversation = async (friendId: string | undefined) => {
    if (!friendId) {
      return;
    }
    try {
      const response = await fetch("/api/conversation/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/chat/${data.conversationId}`);
        if (!userId) return;
        socket?.emit("conversation:start", ({
          conversation: data.conversation,
          startedBy: userId
        }))
      }
    } catch (error) {
      console.error("Error in startChat(): ", error);
    }
  };

  const getSearchFriends = async () => {
    setLoading(true);
    try {
      console.log("I was hit");

      const response = await fetch(
        `/api/conversation/search-friends?query=${search}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();

      if (data.success) {
        setSearchFriends(data.friends);
      } else {
        setSearchFriends([]);
        setNotice(data.message);
      }
    } catch (error) {
      console.error("Error in getSearchFriends(): ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search.trim()) {
      setSearchFriends([]);
      return;
    }
    const timeout = setTimeout(() => {
      getSearchFriends();
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  return (
    <div className="relative">
      <div className=" flex gap-3 items-center border w-full py-1 rounded-2xl px-3">
        <Search className="h-5 w-5" />
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search Friends"
          className="outline-none w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {search && (
        <div className="bg-neutral-800 z-10 text-gray-400 absolute top-10 w-full rounded-md py-2">
          <div>
            {loading ? (
              <Loader loading={loading} />
            ) : (
              <div>
                {searchFriends.length > 0 ? (
                  <div>
                    {searchFriends.map((friend, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 mb-2 py-3 px-2 w-full transition-colors duration-200 ease-out hover:bg-gray-800 cursor-pointer rounded-md`}
                        onClick={() => {
                          startConversation(friend.id);
                          setSearchFriends([]);
                          setSearch("");
                        }}
                      >
                        <div>
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={friend.image || ""}
                              className="object-fill"
                              referrerPolicy="no-referrer"
                            />
                            <AvatarFallback className="flex items-center justify-center mx-auto bg-gray-500 w-full text-xl font-bold object-cover">
                              {friend.name ? friend.name[0] : "U"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <span className="font-medium">{friend.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center">{notice}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
