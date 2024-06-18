// src/components/form/PracticalWorkListForm.tsx
"use client"
import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Group, PracticalWork } from "@prisma/client";
import { Select, MenuItem } from "@mui/material";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Spinner from "@/components/ui/spinner";
import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui/card";

interface PracticalWorkListFormProps {
  subjectId: number;
}

const PracticalWorkListForm: React.FC<PracticalWorkListFormProps> = ({ subjectId }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [practicalWorks, setPracticalWorks] = useState<PracticalWork[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("/api/groups");
        if (response.ok) {
          const data = await response.json();
          setGroups(data);
        } else {
          throw new Error("Не удалось получить список групп");
        }
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Ошибка при загрузке групп",
          variant: "destructive",
        });
      }
    };

    fetchGroups();
  }, [toast]);

  useEffect(() => {
    if (selectedGroupId === null) return;

    const fetchPracticalWorksForGroup = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/practsList?groupId=${selectedGroupId}&subjectId=${subjectId}`);
        if (response.ok) {
          const data = await response.json();
          setPracticalWorks(data);
        } else {
          throw new Error("Не удалось получить практические работы");
        }
      } catch (error) {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-screen-lg mx-auto p-4 overflow-hidden"
    >
      <Card className="bg-white shadow-md rounded-lg p-4">
        <CardBody className="max-h-[400px] overflow-y-auto">
          <div className="mb-4">
            <Select
              value={selectedGroupId ?? ""}
              onChange={(e) => setSelectedGroupId(Number(e.target.value))}
              displayEmpty
              fullWidth
            >
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
          </div>

          {isLoading ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {practicalWorks.length > 0 ? (
                practicalWorks.map((work) => (
                  <Card key={work.id} className="border rounded shadow-sm">
                    <CardBody>
                      <h4 className="text-lg font-semibold">{work.title}</h4>
                      <p>{work.description}</p>
                      <Link href={`/practicalWorkDetails/${work.id}`}>
                        <Button variant="outline">Подробнее</Button>
                      </Link>
                    </CardBody>
                  </Card>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center">
                  Нет практических работ для выбранной группы
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default PracticalWorkListForm;
