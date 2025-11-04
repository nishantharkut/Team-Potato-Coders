import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const isLoggedIn = !!req.auth;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/sign-in",
    "/sign-up",
    "/pricing",
    "/contact-us",
    "/forgot-password",
    "/reset-password",
  ];

  // Check if current path starts with any public route
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));
  
  // Check if it's a public resume route
  const isPublicResume = pathname.startsWith("/resume/public");

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/resume",
    "/interview",
    "/ai-cover-letter",
    "/onboarding",
    "/settings",
  ];

  // Check if current path requires authentication (excluding public resume routes)
  const requiresAuth = protectedRoutes.some(route => pathname.startsWith(route)) && !isPublicResume;

  // If route requires auth and user is not logged in, redirect to sign-in
  if (requiresAuth && !isLoggedIn) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Allow the request to continue
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - Next.js internals (_next/static, _next/image)
     * - Static files (images, fonts, etc.)
     * - API auth routes (handled by NextAuth)
     */
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes except NextAuth
    '/(api|trpc)(.*)',
  ],
};
