import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import { compare } from "bcrypt";
import logger from "@/logger"; // Логирование для отладки

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/sign-in',
    error: '/auth/error', // Страница для отображения ошибок аутентификации
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@mail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logger.warn("Missing credentials");
          return null;
        }

        const existingUser = await db.user.findUnique({
          where: { email: credentials.email },
          include: { group: true }, // Убедитесь, что включаете группу
        });

        if (!existingUser) {
          logger.warn(`User with email ${credentials.email} not found`);
          return null;
        }

        const passwordMatch = await compare(credentials.password, existingUser.password);

        if (!passwordMatch) {
          logger.warn(`Password mismatch for user ${credentials.email}`);
          return null;
        }

        const groupNumber = existingUser.group?.groupNumber ?? ''; // Убедитесь, что группа включена

        return {
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
          role: existingUser.role,
          groupId: existingUser.groupId ?? 0, // Исправьте возможность `null`
          groupNumber,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.username = user.username;
        token.role = user.role;
        token.groupId = user.groupId ?? 0; // Обработка возможного `null`
        token.groupNumber = user.groupNumber ?? ''; // Убедитесь, что группа существует

        console.log(`JWT callback: User ID = ${user.id}, Group ID = ${token.groupId}, Group Number = ${token.groupNumber}`);
      }
      return token;
    },
    
    async session({ session, token }) {
      if (!token.userId) {
        logger.error("Session is invalid - User ID is undefined");
        throw new Error("Session data is incomplete");
      }

      console.log(`Session callback: User ID = ${token.userId}, Group ID = ${token.groupId}, Group Number = ${token.groupNumber}`);

      return {
        ...session,
        user: {
          ...session.user,
          userId: token.userId,
          username: token.username,
          role: token.role,
          groupId: token.groupId ?? 0,
          groupNumber: token.groupNumber ?? '',
          studentAddress: token.studentAddress,
        },
      };
    },
  },
};
