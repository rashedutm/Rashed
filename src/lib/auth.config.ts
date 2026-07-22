import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe half of the auth config.
 *
 * This file must not import Prisma or bcrypt — it is loaded by the middleware,
 * which runs on the Edge runtime where those modules are unavailable. The
 * Credentials provider that needs them lives in `auth.ts` instead.
 */
export const authConfig = {
  // v5 reads AUTH_SECRET; NEXTAUTH_SECRET is accepted too so either name works.
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/admin/login")) return true;
      if (pathname.startsWith("/admin")) return Boolean(auth?.user);
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id;
      if (token.username) session.user.username = token.username;
      return session;
    },
  },
} satisfies NextAuthConfig;
