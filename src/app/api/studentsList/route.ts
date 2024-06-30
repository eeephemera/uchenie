import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const groupIdParam = url.searchParams.get("groupId");
  const practicalWorkIdParam = url.searchParams.get("practicalWorkId");
  const groupId = groupIdParam ? parseInt(groupIdParam, 10) : null;
  const practicalWorkId = practicalWorkIdParam ? parseInt(practicalWorkIdParam, 10) : null;

  if (!groupId || isNaN(groupId)) {
    return NextResponse.json({ message: 'Invalid groupId' }, { status: 400 });
  }

  try {
    const students = await prisma.user.findMany({
      where: {
        groupId: groupId,
        role: "USER",
      },
      select: {
        id: true,
        username: true,
        email: true,
        attachedFiles: {
          where: practicalWorkId ? { practicalWorkId } : {},
          select: {
            grade: true,
          },
        },
      },
    });

    const studentsWithGrades = students.map(student => ({
      ...student,
      grades: student.attachedFiles.map(file => file.grade).filter(grade => grade !== null)
    }));

    return NextResponse.json({ students: studentsWithGrades }, { status: 200 });
  } catch (error) {
    console.error('Ошибка при получении студентов:', error);
    return NextResponse.json({ message: 'Error fetching students' }, { status: 500 });
  }
}
