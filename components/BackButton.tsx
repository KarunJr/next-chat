"use client"
import { MoveLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function BackButton() {
    const router = useRouter();
    return (
        <button className="sm:hidden" onClick={() => router.push("/")}>
            <MoveLeft />
        </button>
    )
}