import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface StudentsListForStudentProps {
  groupId: number | null;
}

interface StudentWithGrades {
  id: number;
  username: string;
  email: string;
  grades: number[];
}

const StudentsListForStudent: React.FC<StudentsListForStudentProps> = ({ groupId }) => {
  const [students, setStudents] = useState<StudentWithGrades[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!groupId) return;

    const fetchStudents = async () => {
      try {
        const response = await fetch(`/api/studentsList?groupId=${groupId}`);
        if (!response.ok) throw new Error('Failed to fetch students');
        const data = await response.json();
        const studentsWithGrades = data.map((student: any) => ({
          ...student,
          grades: student.attachedFiles.map((file: any) => file.grade).filter((grade: number) => grade !== null),
        }));
        setStudents(studentsWithGrades);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить список студентов',
          variant: 'destructive',
        });
      }
    };

    fetchStudents();
  }, [groupId, toast]);

  return (
    <div className="p-4">
      <h2 className="text-2xl">Список студентов</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя пользователя</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Оценки</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student, index) => (
              <tr key={student.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.grades.join(', ') || 'Нет оценок'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsListForStudent;
