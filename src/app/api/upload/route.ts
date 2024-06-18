import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const practicalWorkIdStr = formData.get("practicalWorkId");
    const userIdStr = formData.get("userId");

    if (practicalWorkIdStr === null || userIdStr === null) {
      return NextResponse.json(
        { message: "PracticalWorkId и UserId обязательны" },
        { status: 400 }
      );
    }

    const practicalWorkId = parseInt(practicalWorkIdStr.toString(), 10);
    const userId = parseInt(userIdStr.toString(), 10);

    if (isNaN(practicalWorkId) || isNaN(userId) || practicalWorkId <= 0 || userId <= 0) {
      return NextResponse.json(
        { message: "Invalid practicalWorkId или userId" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Файл не предоставлен или неверного типа" },
        { status: 400 }
      );
    }

    const practicalWork = await prisma.practicalWork.findUnique({
      where: { id: practicalWorkId },
    });

    if (!practicalWork) {
      return NextResponse.json(
        { message: "Практическая работа не найдена" },
        { status: 404 }
      );
    }

    const filename = `${Date.now()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Проверка и создание директории, если она не существует
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    const newFileRecord = await prisma.attachedFile.create({
      data: {
        filename,
        filePath: `/uploads/${filename}`,
        practicalWorkId,
        userId,
        uploadDate: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Файл успешно загружен", fileRecord: newFileRecord },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка при загрузке файла:", error);
    return NextResponse.json(
      { message: "Ошибка при загрузке файла" },
      { status: 500 }
    );
  }
}
