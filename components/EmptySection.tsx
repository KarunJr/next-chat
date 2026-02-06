import { MessageCircle } from "lucide-react";

export default function EmptySection() {
    return (
        <div className="flex justify-center items-center w-full">
            <div className="flex items-center justify-center h-full flex-col gap-3">
                <MessageCircle className="h-20 w-20" />
                <p className="text-2xl font-bold">Select the chat to start </p>
            </div>

        </div>
    )
}