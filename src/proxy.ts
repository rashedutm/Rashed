import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Next 16 renamed the `middleware` convention to `proxy`; the behaviour and the
// `config.matcher` below are unchanged. The `authorized` callback in authConfig
// decides who gets through.
export default NextAuth(authConfig).auth;

export const config = {
  // Guard the whole admin area. Static assets and the public site are untouched.
  matcher: ["/admin/:path*"],
};
