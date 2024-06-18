import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const practicalWorkIdStr = searchParams.get("practicalWorkId");

    if (!practicalWorkIdStr) {
      return NextResponse.json(
        { message: "PracticalWorkId is required" },
        { status: 400 }
      );
    }

    const practicalWorkId = parseInt(practicalWorkIdStr, 10);
    if (isNaN(practicalWorkId) || practicalWorkId <= 0) {
      return NextResponse.json(
        { message: "Invalid practicalWorkId" },
        { status: 400 }
      );
    }

    const submittedWorks = await prisma.attachedFile.findMany({
      where: {
        practicalWorkId: practicalWorkId,
      },
      select: {
        id: true,
        filename: true,
        uploadDate: true,
        user: {
          select: {
            username: true,
            studentAddress: true, // Добавляем адрес кошелька студента
          },
        },
        grade: true, // Включаем информацию об оценке
      },
    });

    return NextResponse.json(
      {
        submittedWorks: submittedWorks.map((file) => ({
          id: file.id,
          studentName: file.user?.username || "Неизвестно",
          fileName: file.filename,
          filePath: `/uploads/${file.filename}`, // Убедитесь, что путь к файлу правильный
          grade: file.grade, // Добавляем информацию об оценке
          canGrade: file.grade === null || file.grade === undefined, // Добавляем информацию, может ли преподаватель поставить оценку
          studentAddress: file.user?.studentAddress || "", // Добавляем адрес кошелька студента
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка при получении сданных работ:", error);
    return NextResponse.json(
      { message: "Ошибка при получении сданных работ" },
      { status: 500 }
    );
  }
}
