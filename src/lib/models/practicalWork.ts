// models/practicalWork.ts

import { Prisma } from '@prisma/client';
import prisma from '../db';

export interface PracticalWorkInput {
  title: string;
  description: string;
}

export async function createPracticalWork(data: PracticalWorkInput): Promise<void> {
  // Сохранение данных в базу данных с использованием Prisma
  await prisma.practicalWork.create({
    data: {
      title: data.title,
      description: data.description,
    },
  });
}
