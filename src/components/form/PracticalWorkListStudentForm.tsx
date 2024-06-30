"use client";
import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { PracticalWork } from '@prisma/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Spinner from "@/components/ui/spinner";
import { Card, CardBody } from '@/components/ui/card';
import { getSession } from 'next-auth/react';
import Tooltip from "@mui/material/Tooltip";

interface PracticalWorkListStudentFormProps {
  groupId: number | null;
  subjectId?: number;
}

const PracticalWorkListStudentForm: React.FC<PracticalWorkListStudentFormProps> = ({ groupId, subjectId }) => {
  const [practicalWorks, setPracticalWorks] = useState<PracticalWork[]>([]);
  const [showFullDescription, setShowFullDescription] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSession();
        if (session && session.user) {
          setSession(session);
        } else {
          throw new Error('Session not found');
        }
      } catch (err) {
        console.error('Failed to fetch session:', err);
        toast({
          title: 'Ошибка',
          description: 'Произошла ошибка при получении сессии',
          variant: 'destructive',
        });
      }
    };

    fetchSession();
  }, [toast]);

  useEffect(() => {
    if (groupId === null) return;

    const fetchPracticalWorks = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchPracticalWorks();
  }, [groupId, subjectId, toast]);

  const toggleDescription = (index: number) => {
    const newShowFullDescription = [...showFullDescription];
    newShowFullDescription[index] = !newShowFullDescription[index];
    setShowFullDescription(newShowFullDescription);
  };

  const getDisplayLink = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return url;
    }
  };

  return (
    <Card className="bg-white shadow-md rounded-lg p-6 w-full h-full overflow-y-auto">
      <CardBody className="max-h-[400px] ">
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-full">
            {practicalWorks.length > 0 ? (
              practicalWorks.map((work, index) => {
                const isLongDescription = work.description.length > 100;
                return (
                  <Card key={work.id} className="border rounded shadow-sm p-4 w-full">
                    <CardBody>
                      <h4 className="text-lg font-semibold mb-2">{work.title}</h4>
                      <p className="text-sm mb-4">
                        {showFullDescription[index] || !isLongDescription
                          ? work.description
                          : `${work.description.slice(0, 100)}...`}
                      </p>
                      <div className="text-sm mb-4">
                        <Tooltip title={work.Link ?? ''} arrow>
                          <a href={work.Link ?? ''} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline break-words">
                            {getDisplayLink(work.Link ?? '')}
                          </a>
                        </Tooltip>
                      </div>
                      {isLongDescription && (
                        <Button
                          variant="outline"
                          onClick={() => toggleDescription(index)}
                          className="mb-2"
                        >
                          {showFullDescription[index] ? "Свернуть" : "Развернуть текст"}
                        </Button>
                      )}
                      <Link href={`/practicalWorkDetails/${work.id}`}>
                        <Button variant="outline" className="text-black-500 border-black-500 hover:bg-green-500 hover:text-white mt-2">
                          Подробнее
                        </Button>
                      </Link>
                    </CardBody>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center">
                Нет практических работ для вашей группы
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default PracticalWorkListStudentForm;
