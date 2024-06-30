"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SubjectList from '@/components/form/SubjectList';
import { getSession } from 'next-auth/react';

const Page = () => {
  const router = useRouter();
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      if (session?.user) {
        setRole(session.user.role);
        if (session.user.role === 'TEACHER') {
          setTeacherId(session.user.userId);
        } else if (session.user.role === 'USER' && session.user.groupId) {
          setGroupId(session.user.groupId);
        }
      }
    };

    fetchSession();
  }, []);

  const handleSubjectClick = (subjectId: number) => {
    router.push(`/practicalWorkList?subjectId=${subjectId}`);
  };

  if (role === null) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="p-6">
      <SubjectList 
        onSubjectClick={handleSubjectClick} 
        teacherId={role === 'TEACHER' ? teacherId ?? undefined : undefined}
        groupId={role === 'USER' ? groupId ?? undefined : undefined}
      />
    </div>
  );
};

export default Page;
