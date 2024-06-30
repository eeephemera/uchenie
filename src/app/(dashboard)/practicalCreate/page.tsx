"use client";

import React, { useEffect, useState } from 'react';
import PracticalWorkCreateForm from '@/components/form/PracticalCreateForm';
import { getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

const Page = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const router = useRouter(); 
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      if (session && session.user && session.user.role === "TEACHER") {
        setIsAdmin(true);
        setTeacherId(session.user.userId); // Extract teacherId from session

        // Получаем subjectId из параметров URL
        const subjectIdParam = searchParams.get('subjectId');
        if (subjectIdParam) {
          setSubjectId(Number(subjectIdParam));
        }
      }
    };

    fetchSession();
  }, [searchParams]);

  return (
    <div>
      <h2 className='text-2xl'>Предметная область</h2>
      {subjectId && teacherId && (
        <PracticalWorkCreateForm
          subjectId={subjectId}
          teacherId={teacherId}
          onSuccess={(newPracticalWorkId: number) => {
            // handle success, e.g., navigate to the new practical work details page
            router.push(`/practicalWorkDetails/${newPracticalWorkId}`);
          }}
        />
      )}
    </div>
  );
};

export default Page;
