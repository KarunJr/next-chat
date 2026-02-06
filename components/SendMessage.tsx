"use client"

import { ImageIcon, Send, Smile, ThumbsUp } from "lucide-react";
import Picker, { EmojiClickData, Theme } from "emoji-picker-react"
import { CldUploadWidget } from "next-cloudinary"

import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/context/SocketProvider";
import { Socket } from "socket.io-client";

interface SendMessageProps {
    conversationId: string
}
export default function SendMessage({ conversationId }: SendMessageProps) {
    const [message, setMessage] = useState<string>("")
    const [emojiDialogue, setEmojiDialogue] = useState(false);
    const textRef = useRef<HTMLTextAreaElement>(null)
    const { socket } = useSocket()

    const socketRef = useRef(socket);

    useEffect(() => {
        socketRef.current = socket
    }, [socket])
    const handleSendMessage = async () => {
        if (!message.trim()) {
            return;
        }

        try {
            const response = await fetch("/api/message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: message, conversationId: conversationId, messageType: "text" })
            })

            const data = await response.json();

            if (data) {
                console.log("Sent Messsage:", data.newMessage);
                if (!socket) return;
                socket.emit("message:send", data.newMessage)
            }

        } catch (error) {
            console.error("Error in handleSendMessage(): ", error)
        } finally {
            console.log(message);
            setEmojiDialogue(false)
            setMessage("")
        }
        setMessage("")
        textRef.current?.focus()
    }


    const sendImage = async (imageUrl: string, sock: Socket) => {
        if (!imageUrl) return;

        try {
            const response = await fetch("/api/message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: imageUrl, conversationId: conversationId, messageType: "image" })
            })

            const data = await response.json();

            if (data) {
                console.log("Image length:");
                console.log("Sent Messsage from server:", data.newMessage);
                // if (!socket) return;
                // socket.emit("message:send", data.newMessage)
                // console.log("After socket");
                sock.emit("message:send", data.newMessage)
            }

        } catch (error) {
            console.error("Error in handleSendMessage(): ", error)
        } finally {
            console.log(message);
            setEmojiDialogue(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const onEmojiClick = (emojiObject: EmojiClickData) => {
        setMessage(message + emojiObject.emoji);
    };
    return (
        <div className="border rounded-2xl px-2 flex items-center relative gap-2 w-full">
            <div onClick={() => setEmojiDialogue(!emojiDialogue)} className="cursor-pointer">
                <Smile />
                {
                    emojiDialogue && (
                        <div className="absolute bottom-11" onClick={(e) => e.stopPropagation()}>
                            <Picker theme={Theme.DARK} onEmojiClick={onEmojiClick} />
                        </div>
                    )
                }
            </div>

            <div className="w-full">
                <textarea
                    name="sent_message"
                    id="sent_message"
                    placeholder="Message..."
                    rows={1}
                    className="text-base w-full py-2 px-1 outline-none resize-none overflow-hidden rounded-md"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    ref={textRef}
                />
            </div>

            <div>
                {
                    !message.trim() ? (
                        <div>
                            <ThumbsUp className="h-6 w-6 cursor-pointer" />
                        </div>

                    ) : (
                        <button
                            onClick={handleSendMessage}
                            className="cursor-pointer"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    )
                }
            </div>

            <div>
                <CldUploadWidget
                    signatureEndpoint={"/api/sign-cloudinary-params"}

                    onSuccess={(result, { widget }) => {
                        console.log("Upload success:", result.info);
                        const imageUrl = (result.info as any).secure_url;

                        const sock = socketRef.current;
                        if (!imageUrl || !sock) {
                            console.log("Error in CldUploadWidget");
                            return;
                        }

                        sendImage(imageUrl, sock);
                        widget.close();
                    }}
                >
                    {({ open }) => {
                        return (
                            <button onClick={() => open()} className="cursor-pointer">
                                <ImageIcon className="h-7 w-7" />
                            </button>
                        )
                    }}
                </CldUploadWidget>
            </div>
        </div >
    )
}