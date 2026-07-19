// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

interface DecodedToken {
  sub: string;
  role: string;
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

function decodeJwtPayload(token: string): DecodedToken {
  const [, payload] = token.split(".");

  if (!payload) {
    throw new Error("Invalid access token");
  }

  return JSON.parse(
    Buffer.from(payload, "base64url").toString("utf8")
  ) as DecodedToken;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
    };
    accessToken: string;
  }

  interface User {
    id: string;
    email: string;
    role: string;
    token: string; 
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: string;
    accessToken: string;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const res = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();
          // console.log("API Login Response:", data);

          if (!res.ok) {
            throw new Error(data.message || "Login failed");
          }

          const token = data.data?.accessToken || data.data?.token;
          if (!token) {
            throw new Error("No access token received");
          }

          const decoded = decodeJwtPayload(token);

          return {
            id: decoded.sub || "unknown",
            email: decoded.email || credentials.email,
            role: decoded.role || "",
            token, // accessToken from backend
          };
        } catch (error) {
          console.error("Authorize error:", error);
          throw new Error("Invalid email or password");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user?.role as string;
        token.accessToken = user?.token as string;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          role: token.role as string,
        };
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
