// src/app/api/practs/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import * as z from 'zod';
import logger from '@/logger';

const PracticalWorkSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен").max(100),
  description: z.string().min(1, "Требуется описание").max(2000),
  groupId: z.number(),
  subjectId: z.number(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, groupId, subjectId } = PracticalWorkSchema.parse(body);

    const newPract = await db.practicalWork.create({
      data: {
        title,
        description,
        groupId,
        subjectId,
      },
    });

    return NextResponse.json({ newPract, message: "Практическая работа успешно создана" }, { status: 201 });
  } catch (error) {
    logger.error("Error occurred during creating practical work:", error);

    let errorMessage = "Что-то пошло не так";
    let statusCode = 500;

    if (error instanceof z.ZodError) {
      errorMessage = "Неверные входные данные";
      statusCode = 400;
    }

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
