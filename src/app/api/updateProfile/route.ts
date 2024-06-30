import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }

  const { username, email, studentAddress } = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.userId },
      data: {
        username,
        email,
        studentAddress,
      },
    });

    // Возвращаем обновленные данные пользователя
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    return NextResponse.json({ message: 'Ошибка при обновлении профиля' }, { status: 500 });
  }
}
