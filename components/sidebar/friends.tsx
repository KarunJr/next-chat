"use client"

import { motion } from "motion/react"
import { useEffect, useState, useTransition } from "react"
import Loader from "../Loader";
import { User } from "@/lib/generated/prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Search } from "lucide-react";
import getUserFromClient from "@/hooks/get-user-client";



export default function Friends() {
    const [friends, setFriends] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const user = getUserFromClient();
    const getAllFriends = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/friends/get-all-users")
            const data = await response.json();
            console.log("Data is:", data);

            if (data) {
                setFriends(data)
            }
        } catch (error) {
            console.error("Error in getAllFriends(): ", error)
        } finally {
            setLoading(false)
        }
    }

    const addFriend = async (senderId: string | undefined, receiverId: string | undefined) => {

        if (!senderId || !receiverId) {
            return "Missing values!"
        };

        try {
            const response = await fetch("/api/friends/add-friend", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ senderId, receiverId })
            })

            const data = await response.json();

            if (data) {
                setFriends((prev) => prev.filter(p => p.id !== receiverId))
            }
        } catch (error) {
            console.error("Error in addFriend(): ", error)
        }
    }

    useEffect(() => {
        getAllFriends();
    }, [])

    return (
        <motion.div className="text-white relative h-full">
            <Loader loading={loading} />
            <div className="w-full">
                <h1 className="text-xl font-medium mb-4">Add Friends</h1>
                <div>
                    <form>
                        <div className="flex gap-3 items-center border w-full py-1 rounded-2xl px-3">
                            <Search className="h-5 w-5" />
                            <input type="text" name="search" id="search" placeholder="Search Friends" className="outline-none w-full" />
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-4">
                {
                    friends.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {
                                friends.map((friend, index) => (
                                    <div
                                        key={index}
                                        className="bg-neutral-950 flex justify-between items-center py-4 px-3 rounded-md shadow-xl w-full"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage
                                                        src={friend.image!}
                                                        alt="User.png"
                                                        referrerPolicy="no-referrer"
                                                        className="object-cover"
                                                    />
                                                    <AvatarFallback>
                                                        {friend.name ? friend.name[0] : "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <span className="text-base">{friend.name}</span>
                                        </div>

                                        <div className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md shadow-xl cursor-pointer group transition-colors duration-200 ease-in">
                                            <button
                                                className="cursor-pointer"
                                                onClick={() => addFriend(user.session?.user.id, friend.id)}
                                            >
                                                Add Friend
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </div>
        </motion.div>
    )
}