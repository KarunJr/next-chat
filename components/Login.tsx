"use client";
import Image from "next/image";
import LoginUI from "@/public/login-ui.jpg";
import { GoogleSvg } from "@/public/google";
import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <div className="flex h-full">
      <div className="w-full mx-auto xl:w-1/2 p-2 bg-neutral-900 text-white flex items-center justify-center h-full">
        <div className="container max-w-[500px] rounded-md shadow-xl shadow-gray-800 text-white flex flex-col justify-center items-center py-6 gap-3 border border-neutral-700">
          <div className="flex flex-col items-center mb-3 gap-1">
            <h1 className="text-3xl font-bold text-gray-400 text-center">
              Welcome to Message Garum
            </h1>
            <p className="text-gray-500 text-center">
              Sign in to connect with your belonging
            </p>
          </div>

          <div>
            <button
              className="flex gap-3 items-center bg-neutral-900 border border-neutral-700 shadow-2xl rounded-md px-6 py-4 text-gray-300 font-medium text-xm cursor-pointer hover:bg-black/60 transition-colors duration-100 ease-out"
              onClick={() => signIn("google", { callbackUrl: "/chat" })}
            >
              <GoogleSvg />
              Continue with Google
            </button>
          </div>

          <div className="text-center text-sm mt-6 text-gray-500">
            By signing in, you agree to our
            <a href="#" className="text-white/50 hover:text-white">
              {" "}
              Terms of Service{" "}
            </a>
            and
            <a href="#" className="text-white/50 hover:text-white">
              {" "}
              Privacy Policy
            </a>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 hidden h-full lg:flex items-center justify-center bg-black relative">
        <Image
          src={LoginUI}
          alt="login"
          fill
          style={{ objectFit: "cover", opacity: 0.7 }}
          sizes="(max-width: 768px) 100vw, 50vw"
          loading="lazy"
        />
      </div>
    </div>
  );
}
