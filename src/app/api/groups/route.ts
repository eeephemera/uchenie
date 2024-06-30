import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const subjectIdParam = url.searchParams.get("subjectId");
    const teacherIdParam = url.searchParams.get("teacherId");
    const subjectId = subjectIdParam ? parseInt(subjectIdParam, 10) : null;
    const teacherId = teacherIdParam ? parseInt(teacherIdParam, 10) : null;

    if (subjectId === null || teacherId === null) {
      return NextResponse.json({ message: 'Subject ID and Teacher ID are required' }, { status: 400 });
    }

    const groups = await prisma.group.findMany({
      where: {
        subjects: {
          some: {
            subjectId: subjectId,
            teacherId: teacherId,
          },
        },
      },
      select: {
        id: true,
        groupNumber: true,
      },
    });

    console.log('Fetched groups:', groups); // Log the fetched groups for debugging

    return NextResponse.json(groups, { status: 200 });
  } catch (error) {
    console.error('Ошибка при получении групп:', error);
    return NextResponse.json({ message: 'Error fetching groups' }, { status: 500 });
  }
}
