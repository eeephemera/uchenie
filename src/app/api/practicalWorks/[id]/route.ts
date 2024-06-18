import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // Преобразуем параметр id в число
  const practicalWorkId = parseInt(id, 10);

  if (isNaN(practicalWorkId)) {
    return NextResponse.json(
      { message: "Invalid practicalWorkId" },
      { status: 400 }
    );
  }

  try {
    const practicalWork = await prisma.practicalWork.findUnique({
      where: { id: practicalWorkId },
    });

    if (!practicalWork) {
      return NextResponse.json(
        { message: "Practical work not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(practicalWork, { status: 200 });
  } catch (error) {
    console.error("Ошибка при получении практической работы:", error);
    return NextResponse.json(
      { message: "Ошибка при получении практической работы" },
      { status: 500 }
    );
  }
}
