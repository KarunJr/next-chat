import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { auth } from "@/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Msg Garum — Real-Time Messaging Made Simple",
  description: "Chat instantly with friends using fast real-time messaging, group chats, and image sharing.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  console.log("Session:", session)
  return (
    <html lang="en">
      <SessionWrapper session={session}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <main className="h-screen bg-black text-white w-full">
            {children}
          </main>
        </body>
      </SessionWrapper>
    </html>
  );
}

