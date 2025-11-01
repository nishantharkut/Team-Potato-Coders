import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/resume(.*)",
  "/interview(.*)",
  "/ai-cover-letter(.*)",
  "/onboarding(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    // Safely get authentication state - this can throw if Clerk service is unavailable
    const { userId } = await auth();

    // Always allow access to auth pages and home page
    const pathname = req.nextUrl.pathname;
    if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") || pathname === "/") {
      return NextResponse.next();
    }

    // Redirect to sign-in for protected routes
    if (!userId && isProtectedRoute(req)) {
      const signInUrl = new URL("/sign-in", req.url);
      // Clerk uses after_sign_in_url for redirects
      signInUrl.searchParams.set("after_sign_in_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  } catch (error) {
    // Log error for debugging (in production, this goes to Vercel logs)
    console.error("Middleware error:", error);
    
    // For auth pages and home, allow through even on error
    const pathname = req.nextUrl.pathname;
    if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") || pathname === "/") {
      return NextResponse.next();
    }
    
    // For protected routes, redirect to sign-in on error (safe fallback)
    // This prevents exposing protected content when auth fails
    if (isProtectedRoute(req)) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("after_sign_in_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // For all other routes, allow through (graceful degradation)
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};