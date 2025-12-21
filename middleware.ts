// TODO: Migrate to clerkMiddleware when upgrading to @clerk/nextjs v5+
// See: https://clerk.com/docs/references/nextjs/clerk-middleware
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/api/webhooks/clerk', '/api/webhooks/stripe'],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
