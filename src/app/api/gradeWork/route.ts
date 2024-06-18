import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { workId, grade } = await req.json();

    if (typeof workId !== "number" || typeof grade !== "number" || grade < 1 || grade > 10) {
      return NextResponse.json({ message: "Некорректные данные" }, { status: 400 });
    }

    const updatedFile = await prisma.attachedFile.update({
      where: { id: workId },
      data: { grade },
    });

    return NextResponse.json({ message: "Оценка успешно обновлена", updatedFile }, { status: 200 });
  } catch (error) {
    console.error("Ошибка при обновлении оценки:", error);
    return NextResponse.json({ message: "Ошибка при обновлении оценки" }, { status: 500 });
  }
}