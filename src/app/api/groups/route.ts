import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient(); // Создаем экземпляр PrismaClient

export async function GET() {
  try {
    const groups = await prisma.group.findMany(); // Получаем все группы
    return NextResponse.json(groups, { status: 200 }); // Возвращаем данные
  } catch (error) {
    console.error('Ошибка при получении групп:', error); // Логируем ошибку
    return NextResponse.json({ message: 'Error fetching data' }, { status: 500 });
  }
}
