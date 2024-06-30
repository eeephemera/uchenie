'use client';
import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Group, PracticalWork } from "@prisma/client";
import { Select, MenuItem, FormControl } from "@mui/material";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import Spinner from "@/components/ui/spinner";
import { Card, CardBody } from "@/components/ui/card";
import Tooltip from "@mui/material/Tooltip";

interface PracticalWorkListFormProps {
  subjectId: number;
  subjectName: string;
  teacherId: number;
}

const PracticalWorkListForm: React.FC<PracticalWorkListFormProps> = ({ subjectId, subjectName, teacherId }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(undefined);
  const [practicalWorks, setPracticalWorks] = useState<PracticalWork[]>([]);
  const [showFullDescription, setShowFullDescription] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGroups = async () => {
      if (!teacherId) return;
      try {
        const response = await fetch(`/api/groups?subjectId=${subjectId}&teacherId=${teacherId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched groups:', data); // Log the fetched groups for debugging
          setGroups(data);
        } else {
          throw new Error("Не удалось получить список групп");
        }
      } catch (error) {
        console.error('Ошибка при загрузке групп:', error);
        toast({
          title: "Ошибка",
          description: "Ошибка при загрузке групп",
          variant: "destructive",
        });
      }
    };

    fetchGroups();
  }, [subjectId, teacherId, toast]);

  useEffect(() => {
    if (selectedGroupId === undefined) return;

    const fetchPracticalWorksForGroup = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/practsList?groupId=${selectedGroupId}&subjectId=${subjectId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched practical works:', data); // Log the fetched practical works
          setPracticalWorks(data);
          setShowFullDescription(new Array(data.length).fill(false));
        } else {
          throw new Error("Не удалось получить практические работы");
        }
      } catch (error) {
        console.error('Ошибка при загрузке практических работ:', error);
        toast({
          title: "Ошибка",
          description: "Ошибка при загрузке практических работ",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPracticalWorksForGroup();
  }, [selectedGroupId, subjectId, toast]);

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
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Предметная область: {subjectName}</h1>
      <div className="flex-1 overflow-hidden border rounded-lg p-4">
        <div className="mb-4">
          <FormControl fullWidth variant="outlined" className="mt-8 mb-4 z-10 bg-white">
            <Select
              value={selectedGroupId ?? ""}
              onChange={(e) => setSelectedGroupId(e.target.value === "" ? undefined : Number(e.target.value))}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Выберите группу
              </MenuItem>
              {groups.length > 0 ? (
                groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.groupNumber}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">Группы не найдены</MenuItem>
              )}
            </Select>
          </FormControl>
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="h-full overflow-y-auto pb-32">
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
                  Нет практических работ для выбранной группы
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="mt-4">
        <Link className={buttonVariants()} href={`/practicalCreate?subjectId=${subjectId}`}>
          Создать практическую работу
        </Link>
      </div>
    </div>
  );
};

export default PracticalWorkListForm;
