import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Make all routes public to avoid authentication
  publicRoutes: ["(.*)"],
  ignoredRoutes: ["/api/webhook"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"]
};