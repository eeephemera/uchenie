'use client';
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import PracticalWorkListForm from '@/components/form/PracticalWorkListForm';
import PracticalWorkListStudentForm from '@/components/form/PracticalWorkListStudentForm';
import { getSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const PracticalWorkList = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId');
  const subjectName = searchParams.get('subjectName') || "Предметная область";

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSession();
        if (session && session.user) {
          setSession(session);
          setIsAdmin(session.user.role === UserRole.TEACHER);
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
  }, [subjectId, subjectName]);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  const isTeacher = session?.user?.role === UserRole.TEACHER;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden p-6">
      {isTeacher ? (
        <div className="flex flex-col h-full w-full max-w-6xl mx-auto overflow-hidden">
          <PracticalWorkListForm
            subjectId={Number(subjectId)}
            subjectName={subjectName}
            teacherId={session.user.userId}  // Pass teacherId to PracticalWorkListForm
          />
        </div>
      ) : (
        <div className="flex flex-col h-full w-full max-w-6xl mx-auto overflow-hidden">
          <div className="flex-1">
            <div>Хорошей работы :)</div>
            {session?.user?.groupId ? (
              <PracticalWorkListStudentForm
                groupId={session.user.groupId}
                subjectId={Number(subjectId)}
              />
            ) : (
              <p>Группа не назначена</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PracticalWorkList;
