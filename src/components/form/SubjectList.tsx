// src/components/form/SubjectList.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, Button } from '@mui/material';

interface SubjectListProps {
  onSubjectClick: (subjectId: number) => void;
  teacherId?: number;
  groupId?: number;
}

interface Subject {
  id: number;
  name: string;
  bgColor: string;
  subjectGroups: Array<{
    group: {
      groupNumber: string;
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
        const response = await fetch(
          teacherId
            ? `/api/subjectsList?teacherId=${teacherId}`
            : `/api/subjectsList?groupId=${groupId}`
        );
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Ошибка при загрузке предметных областей",
          variant: "destructive",
        });
      }
    };

    fetchSubjects();
  }, [teacherId, groupId, toast]);

  if (subjects.length === 0) {
    return <div>Нет доступных предметных областей.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {subjects.map((subject) => (
        <Card
          key={subject.id}
          className="cursor-pointer"
          style={{ backgroundColor: subject.bgColor }}
          onClick={() => onSubjectClick(subject.id)}
        >
          <CardBody className="flex flex-col items-start">
            <Avatar>{subject.name.charAt(0)}</Avatar>
            <h3 className="text-black text-lg font-semibold">{subject.name}</h3>
            {subject.subjectGroups.map((sg, index) => (
              <div key={index}>
                <p className="text-black">{sg.group.groupNumber}</p>
                <p className="text-black">{sg.teacher.username}</p>
              </div>
            ))}
            <Button onClick={() => onSubjectClick(subject.id)} variant="outlined" color="primary">
              Подробнее
            </Button>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default SubjectList;
