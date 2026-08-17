import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { ApiError, apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const data = await apiFetch<LoginResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          return {
            id: String(data.user.id),
            email: data.user.email,
            name: data.user.full_name,
            role: data.user.role,
            accessToken: data.access_token,
          };
        } catch (err) {
          if (err instanceof ApiError) return null;
          throw err;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role;
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "customer" | "admin";
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};
