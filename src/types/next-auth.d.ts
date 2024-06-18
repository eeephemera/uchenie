    import NextAuth from "next-auth/next";
    import { UserRole } from "@prisma/client";

    declare module "next-auth" {
        interface User {
            username: string;
            role: UserRole; // Corrected the typo here
            studentAddress: string;
            groupId?: number; // Используем число, если это ожидается в Prisma
            groupNumber?: string; 
            userId: number; // Убедитесь, что это число

        }
        interface Session {
            user: User & {
                username: string;
                role: UserRole;
                studentAddress: string;
                groupNumber?: string;
                userId: number;
                groupId?: number; // Убедитесь, что это число
            };

            token: {
                username: string;
                role: UserRole;
                studentAddress: string;
                groupNumber?: string; 
                userId: number;
                groupId?: number; // Используем правильный тип
            };  

        }
    }
