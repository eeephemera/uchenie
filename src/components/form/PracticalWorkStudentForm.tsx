// src/components/form/PracticalWorkStudentForm.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { PracticalWork } from '@prisma/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CardBody } from '../ui/card';

interface PracticalWorkStudentFormProps {
  groupId: number | null;
  subjectId?: number;
}

const PracticalWorkStudentForm: React.FC<PracticalWorkStudentFormProps> = ({ groupId, subjectId }) => {
  const [practicalWorks, setPracticalWorks] = useState<PracticalWork[]>([]);
  const [showFullDescription, setShowFullDescription] = useState<boolean[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (groupId === null) {
      return;
    }

    const fetchPracticalWorks = async () => {
      try {
        const response = await fetch(`/api/practsList?groupId=${groupId}&subjectId=${subjectId}`);
        if (response.ok) {
          const data = await response.json();
          setPracticalWorks(data);
          setShowFullDescription(new Array(data.length).fill(false));
        } else {
          throw new Error("Не удалось получить практические работы для группы");
        }
      } catch (error) {
        console.error("Ошибка при получении практических работ:", error);
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при загрузке практических работ",
          variant: 'destructive',
        });
      }
    };

    fetchPracticalWorks();
  }, [groupId, subjectId, toast]);

  const toggleDescription = (index: number) => {
    const newShowFullDescription = [...showFullDescription];
    newShowFullDescription[index] = !newShowFullDescription[index];
    setShowFullDescription(newShowFullDescription);
  };

  return (
    <div>
      <div className="max-h-[400px] overflow-y-auto">
        {practicalWorks.length > 0 ? (
          <div className="grid gap-4 grid-cols-3">
            {practicalWorks.map((work, index) => (
              <div key={work.id}>
                <h4 className="text-lg font-semibold">{work.title}</h4>
                <p className="text-gray-700">
                  {showFullDescription[index]
                    ? work.description.replace(/<[^>]+>/g, '')
                    : `${work.description.replace(/<[^>]+>/g, '').slice(0, 100)}...`}
                </p>
                <Button
                  variant="outline"
                  onClick={() => toggleDescription(index)}
                >
                  {showFullDescription[index] ? "Свернуть" : "Развернуть"}
                </Button>
                <CardBody>
                  <Link href={`/practicalWorkDetails/${work.id}`}>
                    <Button variant="outline">Подробнее</Button>
                  </Link>
                </CardBody>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p>Нет практических работ для вашей группы</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticalWorkStudentForm;
