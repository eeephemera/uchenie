// src/app/(dashboard)/practicalWorkList/page.tsx
"use client";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import PracticalWorkListForm from '@/components/form/PracticalWorkListForm';
import PracticalWorkStudentForm from '@/components/form/PracticalWorkStudentForm';
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import { getSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const PracticalWorkList = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSession();
        if (session && session.user) {
          setSession(session);
          if (session.user.role === "TEACHER") {
            setIsAdmin(true);
            setGroupId(session.user.groupId ?? null);
          } else {
            setGroupId(session.user.groupId ?? null);
          }
        } else {
          setError('Session not found');
        }
      } catch (err) {
        console.error('Failed to fetch session:', err);
        setError('Failed to fetch session');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, []);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  const isTeacher = session.user?.role === UserRole.TEACHER;

  return (
    <div className="p-6">
      {isTeacher ? (
        <div>
          <Card>
            <CardHeader>
              <h2>Практические работы</h2>
            </CardHeader>
            <CardBody>
              <PracticalWorkListForm subjectId={Number(subjectId)} />
            </CardBody>
            <CardFooter className="mt-4">
              <Link className={buttonVariants()} href={`/practicalCreate?subjectId=${subjectId}`}>
                Создать практическую работу
              </Link>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div>
          <Card>
            <CardHeader>
              <h2>Список практических работ для группы {session?.user?.groupNumber}</h2>
            </CardHeader>
            <CardBody>
              {session?.user?.groupId ? (
                <PracticalWorkStudentForm groupId={session.user.groupId} subjectId={Number(subjectId)} />
              ) : (
                <p>Группа не назначена</p>
              )}
              <p>Email: {session.user.email || 'Не указано'}</p>
              <p>Имя пользователя: {session.user.username || 'Не указано'}</p>
              <p>Роль: {session.user.role}</p>
              <p>Номер группы: {session.user.groupNumber || 'Не указано'}</p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

export default PracticalWorkList;
