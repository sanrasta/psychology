import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes
const isPublicRoute = createRouteMatcher(['/', "/sign-in(.*)", "/book(.*)"])

// Define protected routes
const isProtectedRoute = createRouteMatcher(['/events(.*)']);

// Define admin-only routes that should be blocked from direct access
const isAdminRoute = createRouteMatcher(['/schedule(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();
  const path = new URL(req.url).pathname;

  // Block direct access to admin routes - redirect to events page
  if (isAdminRoute(req)) {
    return Response.redirect(new URL('/events', req.url));
  }

  if (isProtectedRoute(req) && !userId) {
    return redirectToSignIn();
  }
});

export const config = {
  matcher: [
    // Apply middleware to all routes except Next.js internals and static files
    '/((?!_next|.*\\..*|favicon.ico).*)',
  ],
};