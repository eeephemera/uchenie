import React, { useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@mui/material';

interface SubjectListProps {
  onSubjectClick: (subjectId: number) => void;
  teacherId?: number;
  groupId?: number;
}

interface Subject {
  id: number;
  name: string;
  description: string;
  bgColor: string;
  subjectGroups: Array<{
    group: {
      groupNumber: string;
      id: number;
    };
    teacher: {
      username: string;
    };
  }>;
}

const SubjectList: React.FC<SubjectListProps> = ({ onSubjectClick, teacherId, groupId }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        let response;
        if (teacherId) {
          response = await fetch(`/api/subjectsList?teacherId=${teacherId}`);
        } else if (groupId) {
          response = await fetch(`/api/subjectsList?groupId=${groupId}`);
        }

        if (response && response.ok) {
          const data = await response.json();
          console.log("Fetched subjects:", data); // Debugging log
          if (Array.isArray(data)) {
            setSubjects(data);
          } else {
            setSubjects([]);
            toast({
              title: "Ошибка",
              description: "Получены некорректные данные",
              variant: "destructive",
            });
          }
        } else {
          console.error("Response error:", response); // Debugging log
          setSubjects([]);
        }
      } catch (error) {
        console.error("Fetch error:", error); // Debugging log
        toast({
          title: "Ошибка",
          description: "Ошибка при загрузке предметных областей",
          variant: "destructive",
        });
      }
    };

    fetchSubjects();
  }, [teacherId, groupId, toast]);

  if (!Array.isArray(subjects) || subjects.length === 0) {
    return <div>Нет доступных предметных областей.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {subjects.map((subject) => {
          const relevantGroup = subject.subjectGroups.find(
            (sg) => sg.group.id === groupId
          );

          return (
            <Card
              key={subject.id}
              className="cursor-pointer p-6 shadow-lg w-full bg-card text-card-foreground"
              onClick={() => onSubjectClick(subject.id)}
              style={{ backgroundColor: subject.bgColor }}
            >
              <CardBody className="flex flex-col items-start space-y-4">
                <h3 className="text-black text-2xl font-bold">{subject.name}</h3>
                <p className="text-black text-sm">{subject.description}</p>
                {teacherId ? (
                  <div className="space-y-2">
                    {subject.subjectGroups.map((sg, index) => (
                      <p key={index} className="text-black text-sm">Группа: {sg.group.groupNumber}</p>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {relevantGroup ? (
                      <p className="text-black text-sm">Преподаватель: {relevantGroup.teacher.username}</p>
                    ) : (
                      <p className="text-black text-sm">Нет информации о преподавателе</p>
                    )}
                  </div>
                )}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSubjectClick(subject.id);
                  }}
                  variant="contained"
                  color="primary"
                >
                  Подробнее
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectList;
