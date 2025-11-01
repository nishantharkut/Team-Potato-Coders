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
    const { userId } = await auth();

    // Always allow access to public pages
    const pathname = req.nextUrl.pathname;
    const publicPaths = [
      "/sign-in",
      "/sign-up",
      "/api",
      "/_next",
      "/subscription",
      "/pricing",
      "/contact-us",
      "/resume/public", // Public resume sharing
    ];
    
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path)) || pathname === "/";
    
    if (isPublicPath) {
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
    console.error("Middleware error:", error);
    // On error, allow the request to proceed to avoid blocking the app
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)",
  ],
};
