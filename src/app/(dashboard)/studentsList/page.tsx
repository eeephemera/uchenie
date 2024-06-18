"use client";
import React, { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import StudentsListForStudent from '@/components/form/StudentsListForStudent';
import StudentsListForTeacher from '@/components/form/StudentsListForTeacher';

const StudentsListPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSession();
        if (session && session.user) {
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

  return (
    <div>
      {isAdmin ? (
        <StudentsListForTeacher groupId={groupId} />
      ) : (
        <StudentsListForStudent groupId={groupId} />
      )}
    </div>


  );
};

export default StudentsListPage;
