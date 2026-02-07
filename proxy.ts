import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { publicRoutes, apiHandlers, apiAuthPrefix } from "./routes";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { nextUrl } = req;
  const isLoggedIn = !!token;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isApiHandler = nextUrl.pathname.startsWith(apiHandlers);
  console.log("Next URL is: ", nextUrl);
  if (isApiHandler) {
    return NextResponse.next();
  }
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isLoggedIn && nextUrl.pathname === "/") {
    console.log("I am runnig isLoggedIn");
    console.log("NextAUTH_URL: ", process.env.NEXTAUTH_URL);
    return NextResponse.redirect(new URL("/chat", req.nextUrl));
    // return NextResponse.redirect(new URL("/chat", nextUrl));
  }

  if (!isLoggedIn && !isPublicRoute) {
    console.log("I am runnig !isLoggedIn");
    console.log("NextAUTH_URL: ", process.env.NEXTAUTH_URL);
    return NextResponse.redirect(new URL("/", req.nextUrl));
    // return NextResponse.redirect(new URL("/", nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  //This is copied from Clerk for better middleware matcher. https://clerk.com/docs/references/nextjs/clerk-middleware
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
