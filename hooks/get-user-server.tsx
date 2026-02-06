"use server"

import { auth } from "@/auth"

export default async function getUserFromServer() {
    const session = await auth()

    return session
}