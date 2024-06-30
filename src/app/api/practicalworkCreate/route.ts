import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { title, description, link, groupId, subjectId } = await req.json();

    if (!title || !description || !groupId || !subjectId) {
      return NextResponse.json(
        { message: "Все поля обязательны" },
        { status: 400 }
      );
    }

    const newPracticalWork = await prisma.practicalWork.create({
      data: {
        title,
        description,
        Link: link || '', // Assuming link is optional, defaulting to an empty string
        groupId: parseInt(groupId, 10),
        subjectId: parseInt(subjectId, 10),
      },
    });

    return NextResponse.json({ message: "Практическая работа создана", newPracticalWork }, { status: 201 });
  } catch (error) {
    console.error("Ошибка при создании практической работы:", error);
    return NextResponse.json({ message: "Ошибка при создании практической работы", error: error }, { status: 500 });
  }
}
