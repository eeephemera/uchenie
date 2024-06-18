"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import Spinner from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import FileList from "@/components/form/FileList";
import SubmittedWorksList from "@/components/form/SubmittedWorksList";
import { Card, CardContent, Typography, Box } from "@mui/material";
import UploadFileForm from "@/components/form/UploadFileForm";

interface PracticalWork {
  groupNumber: string;
  id: number;
  title: string;
  description: string;
}

const PracticalWorkDetails = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [practicalWorkId, setPracticalWorkId] = useState<number | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [practicalWork, setPracticalWork] = useState<PracticalWork | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthorization = async () => {
      const session = await getSession();
      if (!session) {
        router.push("/sign-in");
      } else {
        setIsAuthorized(true);
        setIsTeacher(session.user.role === "TEACHER");
      }
    };

    checkAuthorization();
  }, [router]);

  useEffect(() => {
    const fetchPracticalWork = async (id: number) => {
      try {
        const response = await fetch(`/api/practicalWorks/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPracticalWork(data);
        } else {
          console.error("Ошибка при получении практической работы:", response.statusText);
        }
      } catch (error) {
        console.error("Ошибка при получении практической работы:", error);
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при получении практической работы",
          variant: "destructive",
        });
      }
    };

    if (params.id) {
      const idNumber = parseInt(params.id, 10);
      if (isNaN(idNumber)) {
        toast({
          title: "Ошибка",
          description: "Неправильный идентификатор",
          variant: "destructive",
        });
        router.push("/error");
        return;
      }

      setPracticalWorkId(idNumber);
      fetchPracticalWork(idNumber);
    } else {
      setPracticalWorkId(null);
    }
    setIsLoading(false);
  }, [params.id, router, toast]);

  if (!isAuthorized || isLoading || !practicalWorkId || !practicalWork) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <Box className="p-4" display="flex" gap={2}>
      <Card className="bg-white shadow-md rounded-lg flex-grow">
        <CardContent>
          {isTeacher ? (
            <SubmittedWorksList practicalWorkId={practicalWorkId} practicalWork={practicalWork} />
          ) : (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="w-full md:w-auto flex-shrink-0 mb-4 md:mb-0">
                <UploadFileForm practicalWorkId={practicalWorkId} />
              </div>
              <div>
                <FileList practicalWorkId={practicalWorkId} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PracticalWorkDetails;
