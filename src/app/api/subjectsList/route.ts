
// src/app/api/subjectsList/route.ts
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");
  const groupId = searchParams.get("groupId");

  try {
    let subjects: any[] = [];

    if (teacherId) {
      subjects = await prisma.subject.findMany({
        where: {
          subjectGroups: {
            some: {
              teacherId: parseInt(teacherId, 10),
            },
          },
        },
        orderBy: {
          createAt: 'asc',
        },
        include: {
          subjectGroups: {
            include: {
              group: true,
              teacher: true,
            },
          },
        },
      });
    } else if (groupId) {
      subjects = await prisma.subject.findMany({
        where: {
          subjectGroups: {
            some: {
              groupId: parseInt(groupId, 10),
            },
          },
        },
        orderBy: {
          createAt: 'asc',
        },
        include: {
          subjectGroups: {
            include: {
              group: true,
              teacher: true,
            },
          },
        },
      });
    }

    return NextResponse.json(subjects, { status: 200 });
  } catch (error) {
    console.error("Ошибка при получении списка предметов:", error);
    return NextResponse.json(
      { message: "Ошибка при получении данных" },
      { status: 500 }
    );
  }
}