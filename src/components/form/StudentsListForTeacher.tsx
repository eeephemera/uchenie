import React, { ReactNode, useEffect, useState } from 'react';
import { User } from '@prisma/client';
import { useToast } from '@/components/ui/use-toast';

interface StudentsListForTeacherProps {
  groupId: number | null;
}

interface StudentWithGrades extends User {
  grades: number[];
}

const StudentsListForTeacher: React.FC<StudentsListForTeacherProps> = ({ groupId }) => {
  const [groupStudents, setGroupStudents] = useState<StudentWithGrades[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [groups, setGroups] = useState<{ groupNumber: ReactNode; id: number; name: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/groups');
        if (!response.ok) throw new Error('Failed to fetch groups');
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить список групп',
          variant: 'destructive',
        });
      }
    };

    fetchGroups();
  }, [toast]);

  useEffect(() => {
    if (!selectedGroup) return;

    const fetchGroupStudents = async () => {
      try {
        const response = await fetch(`/api/studentsList?groupId=${selectedGroup}`);
        if (!response.ok) throw new Error('Failed to fetch group students');
        const data = await response.json();
        const studentsWithGrades = data.map((student: any) => ({
          ...student,
          grades: student.attachedFiles.map((file: any) => file.grade).filter((grade: number) => grade !== null),
        }));
        setGroupStudents(studentsWithGrades);
      } catch (error) {
        console.error('Error fetching group students:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить список студентов группы',
          variant: 'destructive',
        });
      }
    };

    fetchGroupStudents();
  }, [selectedGroup, toast]);

  const handleGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGroupId = Number(event.target.value);
    setSelectedGroup(selectedGroupId);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Выберите группу для просмотра списка студентов:</h2>
      <div className="mb-4">
        <select
          value={selectedGroup || ''}
          onChange={handleGroupChange}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-700"
        >
          <option value="" disabled hidden>Выберите группу</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id} className="text-gray-900 bg-white">
              {group.groupNumber}
            </option>
          ))}
        </select>
      </div>

      {selectedGroup && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Студенты в выбранной группе:</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Оценки</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groupStudents.map((student, index) => (
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
      )}
    </div>
  );
};

export default StudentsListForTeacher;
