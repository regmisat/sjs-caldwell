import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/scanner",
  "/schedule",
  "/speakers",
  "/sponsors",
  "/community-partners",
]);

const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Update Supabase session
  const { supabaseResponse, user: supabaseUser } = await updateSession(req);

  // For API routes, ensure Clerk auth is available but return supabase response
  if (isApiRoute(req)) {
    // Clerk auth context is automatically available in API routes
    // Just return the supabase response with cookies
    return supabaseResponse;
  }

  const { userId, sessionClaims } = await auth();

  // If user is not signed in and trying to access protected route, redirect to home
  if (!userId && !isPublicRoute(req)) {
    const signInUrl = new URL("/", req.url);
    // Copy Supabase cookies to the redirect response
    const redirectResponse = NextResponse.redirect(signInUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
