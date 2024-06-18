// src/app/(dashboard)/practicalCreate/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import PracticalWorkCreateForm from '@/components/form/PracticalCreateForm';
import { getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

const Page = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      if (session && session.user && session.user.role === "TEACHER") {
        setIsAdmin(true);
        // Получаем subjectId из параметров URL
        const subjectIdParam = searchParams.get('subjectId');
        if (subjectIdParam) {
          setSubjectId(Number(subjectIdParam));
        }
      }
    };

    fetchSession();
  }, [searchParams]);

  if (!isAdmin) {
    return <div>У вас нет прав для доступа к этой странице</div>;
  }

  return (
    <div>
      <h2 className='text-2xl'>Создание новой практической работы</h2>
      {subjectId && <PracticalWorkCreateForm subjectId={subjectId} />}
    </div>
  );
};

export default Page;
