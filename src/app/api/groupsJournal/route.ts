import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const teacherIdParam = url.searchParams.get("teacherId");
    const teacherId = teacherIdParam ? parseInt(teacherIdParam, 10) : null;

    if (teacherId === null) {
      return NextResponse.json({ message: 'Teacher ID is required' }, { status: 400 });
    }

    const groups = await prisma.group.findMany({
      where: {
        subjects: {
          some: {
            teacherId: teacherId,
          },
        },
      },
      select: {
        id: true,
        groupNumber: true,
      },
    });

    return NextResponse.json(groups, { status: 200 });
  } catch (error) {
    console.error('Ошибка при получении групп:', error);
    return NextResponse.json({ message: 'Error fetching groups' }, { status: 500 });
  }
}
