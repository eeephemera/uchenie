import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url); // Получаем URL из запроса
    const practicalWorkId = parseInt(url.searchParams.get("practicalWorkId") || '', 10); // Преобразуем в число

    if (isNaN(practicalWorkId)) {
      return NextResponse.json({ message: "Invalid practicalWorkId" }, { status: 400 }); // Если ID недействителен
    }

    const attachedFiles = await prisma.attachedFile.findMany({
      where: { practicalWorkId },
      select: {
        id: true,
        filename: true,
        filePath: true,
        uploadDate: true,
      },
    });

    if (attachedFiles.length === 0) {
      return NextResponse.json(
        { message: "No files found" },
        { status: 404 }
      ); // Если файлов нет, возвращаем статус 404
    }

    return NextResponse.json({ attachedFiles }, { status: 200 }); // Возвращаем список файлов
  } catch (error) {
    console.error("Error retrieving files for practical work:", error);
    return NextResponse.json({ message: "Error retrieving files" }, { status: 500 }); // Если есть ошибка, возвращаем 500
  }
}
