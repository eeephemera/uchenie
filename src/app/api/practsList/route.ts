import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const groupIdParam = url.searchParams.get("groupId");
  const subjectIdParam = url.searchParams.get("subjectId");
  const groupId = groupIdParam ? parseInt(groupIdParam, 10) : null;
  const subjectId = subjectIdParam ? parseInt(subjectIdParam, 10) : null;

  try {
    const practicalWorks = await prisma.practicalWork.findMany({
      where: {
        groupId: groupId !== null ? groupId : undefined,
        subjectId: subjectId !== null ? subjectId : undefined,
      },
      orderBy: {
        createAt: 'desc', // Order by creation time in descending order
      },
      include: {
        group: true,
      },
    });

    return NextResponse.json(practicalWorks, { status: 200 });
  } catch (error) {
    console.error("Ошибка при получении практических работ:", error);
    return NextResponse.json(
      { message: "Ошибка при получении данных" },
      { status: 500 }
    );
  }
}
