import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    username?: string;
  }

  interface Session {
    user: {
      id: string;
      username?: string;
    } & DefaultSession["user"];
  }
}

// `next-auth/jwt` only re-exports these types, and a re-export can't be
// augmented — the JWT interface has to be widened where it is declared.
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    username?: string;
  }
}
