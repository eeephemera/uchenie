import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const groupIdParam = url.searchParams.get("groupId");
  const practicalWorkIdParam = url.searchParams.get("practicalWorkId");
  const groupId = groupIdParam ? parseInt(groupIdParam, 10) : null;
  const practicalWorkId = practicalWorkIdParam ? parseInt(practicalWorkIdParam, 10) : null;

  try {
    const students = await prisma.user.findMany({
      where: {
        groupId: groupId !== null ? groupId : undefined,
        role: "USER",
      },
      select: {
        id: true,
        username: true,
        email: true,
        attachedFiles: {
          where: {
            practicalWorkId: practicalWorkId !== null ? practicalWorkId : undefined,
          },
          select: {
            grade: true,
          },
        },
      },
    });

    const studentsWithoutFiles = students.filter(student => student.attachedFiles.length === 0);

    return NextResponse.json({ students, studentsWithoutFiles }, { status: 200 });
  } catch (error) {
    console.error('Ошибка при получении студентов:', error);
    return NextResponse.json({ message: 'Error fetching students' }, { status: 500 });
  }
}
