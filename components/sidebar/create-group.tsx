"use client"

import { Users, X } from "lucide-react"
import {
    Dialog,
    DialogHeader,
    DialogContent,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "../ui/dialog"

import { Friends, useSocket } from "@/context/SocketProvider"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useState } from "react";

export default function CreateGroup() {
    const [groupName, setGroupName] = useState("");
    const [groupFriends, setGroupFriends] = useState<Friends[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false)
    const { friends } = useSocket();

    const createGroup = async () => {
        if (!groupName || groupFriends.length < 2) {
            return alert("Group creation requires a name and at least 2 members.")
        }
        const memberIds: string[] = [];

        groupFriends.map((friend) => {
            memberIds.push(friend.id)
        })
        if (memberIds.length === 0) {
            return
        }
        try {
            const response = await fetch("/api/conversation/group-start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ groupName: groupName, memberIds: memberIds, imageUrl: "https://media.istockphoto.com/id/814423752/photo/eye-of-model-with-colorful-art-make-up-close-up.jpg?s=612x612&w=0&k=20&c=l15OdMWjgCKycMMShP8UK94ELVlEGvt7GmB_esHWPYE=" })
            })
            const data = await response.json();
            if (data.success) {
                alert("Group Created")
                console.log("Successfull Data are:", data);
            } else {
                alert(data.message)
                console.log("Error in:", data.message);
            }
        } catch (error) {
            console.log("Error while creating group:", error);
        } finally {
            setGroupName("");
            setGroupFriends([]);
            setDialogOpen(false)
        }
    }
    return (
        <div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Users />
                </DialogTrigger>
                <DialogContent className="bg-black text-white shadow-xl shadow-gray-800 w-full">
                    <div className="w-72 sm:max-w-md sm:w-full space-y-3">
                        <DialogHeader>
                            <div className="text-center space-y-2">
                                <DialogTitle className="font-medium text-xl">Create Group</DialogTitle>
                                <DialogDescription>Select the user to add on group</DialogDescription>
                            </div>
                        </DialogHeader>

                        <div className="w-full space-y-3">
                            <div className="">
                                <input
                                    type="text"
                                    name="grp_name"
                                    id="grp_name"
                                    placeholder="Group Name"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="border w-full px-3 py-2 rounded-xl"
                                />
                            </div>

                            <div className="w-full">
                                <h1 className="text-xl font-medium text-gray-600 mb-3">Added Members</h1>

                                <div className="w-full">
                                    {
                                        groupFriends.length > 0 ? (
                                            <div className="flex gap-3 w-full overflow-y-auto shrink-0 p-2  [&::-webkit-scrollbar]:w-2
[&::-webkit-scrollbar-track]:rounded-full
[&::-webkit-scrollbar-track]:bg-neutral-800
[&::-webkit-scrollbar-thumb]:rounded-full
[&::-webkit-scrollbar-thumb]:bg-neutral-700">
                                                {
                                                    groupFriends.map((friend, index) => (
                                                        <div key={index} className="relative">
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

                                                            <X
                                                                className="h-4 w-4 cursor-pointer absolute -top-0.5 bg-red-600 rounded-full right-0"
                                                                onClick={() => setGroupFriends((prev) =>
                                                                    prev.filter(f => f.id !== friend.id)
                                                                )}
                                                            />
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        ) : (
                                            <div>
                                                <h1 className="text-xm font-normal text-gray-700">Not added yet!</h1>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>


                            <div className="overflow-y-auto h-40 [&::-webkit-scrollbar]:w-2
[&::-webkit-scrollbar-track]:rounded-full
[&::-webkit-scrollbar-track]:bg-neutral-800
[&::-webkit-scrollbar-thumb]:rounded-full
[&::-webkit-scrollbar-thumb]:bg-neutral-700">
                                {friends.map((friend, index) => (
                                    <div
                                        key={index}
                                        className={`flex gap-3 mb-2 py-3 px-2 w-full transition-colors duration-200 ease-out hover:bg-gray-800 cursor-pointer rounded-md`}
                                        onClick={() => setGroupFriends((prev) => {
                                            if (prev.some(f => f.id === friend.id)) {
                                                return prev
                                            }
                                            return [...prev, friend]
                                        })}
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
                                        <span className="font-medium">
                                            {friend.name}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <button
                                    className="w-full text-center bg-black rounded-md border border-neutral-600 cursor-pointer py-4 hover:bg-gray-800 font-medium text-xm"
                                    onClick={createGroup}
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog >
        </div >
    )

}

{/* <div className="w-full">
    <h1 className="text-xl font-medium text-gray-600 mb-3">Added Members</h1>
    <div className="w-full overflow-x-auto pb-2">
        {
            groupFriends.length > 0 ? (
                <div className="flex gap-3 min-w-max border p-2">
                    <div className="flex gap-3 border overflow-x-auto">
                        {
                            groupFriends.map((friend, index) => (
                                <div key={index}>
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
                            ))
                        }
                    </div>
                </div>
            ) : (
                <div>
                    <h1 className="text-xm font-normal text-gray-700">Not added yet!</h1>
                </div>
            )
        }
    </div>
</div> */}