import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from 'bcrypt';
import * as z from 'zod';
//Define a sche,e for input validation
const userScheme = z 
  .object({
    username: z.string().min(1, "Username is required").max(100),
    email: z.string().min(1, "Username is required").max(100),
    password: z
    .string() 
     .min(1, "Password is required")
     .min(8, "Password может иметь не меньше 8 символов"),  })


export async function POST(req: Request){
    try {
        const body = await req.json();
        const { email, username, password } = userScheme.parse(body);
        //check if email already exist 
        const existingUserByEmail = await db.user.findUnique({
            where: { email: email }
        });

        if(existingUserByEmail) {
            return NextResponse.json({user: null, message: 
            "Пользователь с таким мейлом уже существует"}, {status: 409})
        }

        //check if username already exist 
        const existingUserByUsername = await db.user.findUnique({
            where: { username: username }
        });

        if(existingUserByUsername) {
            return NextResponse.json({user: null, message: 
            "Пользоователь с таким именем уже существует"}, {status: 409})
        }
        const hashedPassword = await hash(password, 10);
        const newUser = await db.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });
        const { password: newUserPassword, ...rest } = newUser;


    return NextResponse.json({ user: rest, message: "Пользователь успешно создан" }, {status: 201}); 
    } catch (error) {
        return NextResponse.json({message: "Что-то пошло не так" }, {status: 500}); 

    }
}