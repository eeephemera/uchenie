import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import * as z from "zod";
import { UserRole } from "@prisma/client";

// Схема валидации данных пользователя
const userSchema = z.object({
  username: z.string().min(1, "Имя пользователя требуется").max(100),
  email: z.string().email("Неверный формат электронной почты").max(100),
  password: z.string().min(8, "Пароль должен содержать не менее 8 символов"),
  role: z.nativeEnum(UserRole, { required_error: "Роль требуется" }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Получен запрос:", body); // Логирование входного запроса

    // Валидация входных данных
    const { email, username, password, role } = userSchema.parse(body);

    console.log("Валидация пройдена успешно"); // Успешная валидация

    // Проверка уникальности по электронной почте
    const existingUserByEmail = await db.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      console.warn(`Пользователь с электронной почтой ${email} уже существует`);
      return NextResponse.json(
        { message: `Пользователь с электронной почтой ${email} уже существует` },
        { status: 409 }
      );
    }

    // Проверка уникальности по имени пользователя
    const existingUserByUsername = await db.user.findUnique({
      where: { username },
    });

    if (existingUserByUsername) {
      console.warn(`Пользователь с именем ${username} уже существует`);
      return NextResponse.json(
        { message: `Пользователь с именем ${username} уже существует` },
        { status: 409 }
      );
    }

    // Хеширование пароля
    const hashedPassword = await hash(password, 10);
    console.log("Пароль успешно хеширован"); // Успешное хеширование пароля

    // Создание нового пользователя
    const newUser = await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
    });

    console.log(`Пользователь ${username} успешно создан`);

    // Возвращение созданного пользователя (без пароля)
    const { password: _, ...rest } = newUser;

    return NextResponse.json(
      { message: "Пользователь успешно создан", user: rest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ошибка при создании пользователя:", error); // Логирование ошибок

    let errorMessage = "Что-то пошло не так";
    let statusCode = 500;

    // Проверка на ошибки валидации
    if (error instanceof z.ZodError) {
      errorMessage = `Неверные входные данные: ${error.issues.map(issue => issue.message).join(", ")}`;
      statusCode = 400;
    }

    return NextResponse.json(
      { message: errorMessage },
      { status: statusCode }
    );
  }
}
