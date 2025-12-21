// TODO: Migrate to clerkMiddleware when upgrading to @clerk/nextjs v5+
// See: https://clerk.com/docs/references/nextjs/clerk-middleware
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/api/webhooks/clerk', '/api/webhooks/stripe'],
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files (reduces edge invocations by 80-90%)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
