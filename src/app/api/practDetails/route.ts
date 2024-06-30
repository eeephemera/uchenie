import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions); // Получаем сессию
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 }); // Возвращаем статус 401, если сессия не найдена
    }

    const url = new URL(req.url);
    const practicalWorkId = parseInt(url.searchParams.get("practicalWorkId") || '', 10);
    const userId = session.user.userId; // Получаем ID пользователя из сессии

    if (isNaN(practicalWorkId)) {
      return NextResponse.json({ message: "Invalid practicalWorkId" }, { status: 400 });
    }

    const attachedFiles = await prisma.attachedFile.findMany({
      where: {
        practicalWorkId,
        userId: userId // Фильтруем файлы по ID практической работы и ID пользователя
      },
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
      );
    }

    return NextResponse.json({ attachedFiles }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving files for practical work:", error);
    return NextResponse.json({ message: "Error retrieving files" }, { status: 500 });
  }
}
