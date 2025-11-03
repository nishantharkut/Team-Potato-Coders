import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/interview(.*)",
  "/ai-cover-letter(.*)",
  "/onboarding(.*)",
  "/settings(.*)",
  "/resume(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Don't return early - let Clerk process all routes for handshake/session management
  // Only apply protection logic to protected routes
  
  // Exclude public resume routes from protection
  const pathname = req.nextUrl.pathname;
  const isPublicResume = pathname.startsWith("/resume/public");
  
  // Protect routes that match the pattern, but skip public resume routes
  if (isProtectedRoute(req) && !isPublicResume) {
    await auth.protect();
  }
  // Public routes (including /resume/public) are allowed through without protection
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - Next.js internals (_next/static, _next/image)
     * - Static files (images, fonts, etc.)
     * - Clerk's internal API routes (handled automatically by clerkMiddleware)
     * - Favicon and logo files
     */
    '/(?!_next|favicon|logo.*\\.(?:ico|webp)|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|css|js|woff|woff2|ttf|eot)$).*',
    '/api/:path*',
  ],
};
