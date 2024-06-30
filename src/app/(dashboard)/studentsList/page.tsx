"use client";
import React, { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import StudentsListForStudent from '@/components/form/StudentsListForStudent';
import StudentsListForTeacher from '@/components/form/StudentsListForTeacher';

const StudentsListPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSession();
        if (session && session.user) {
          if (session.user.role === "TEACHER") {
            setIsAdmin(true);
            setTeacherId(session.user.userId ?? null);
          } else {
            setGroupId(session.user.groupId ?? null);
          }
        } else {
          setError('Вы не авторизованы. Пожалуйста, войдите в систему.');
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

  return (
    <div>
      {isAdmin ? (
        <StudentsListForTeacher teacherId={teacherId} />
      ) : (
        <StudentsListForStudent groupId={groupId} />
      )}
    </div>
  );
};

export default StudentsListPage;
