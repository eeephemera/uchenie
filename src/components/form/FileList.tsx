"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // Импортируйте хук для работы с сессиями
import { useToast } from "@/components/ui/use-toast"; // Компонент для уведомлений
import { Card, CardBody } from "@/components/ui/card"; // Компоненты карточек
import { Button } from "@/components/ui/button"; // Кнопки
import Spinner from "@/components/ui/spinner"; // Индикатор загрузки

interface FileDetails {
  id: number;
  filename: string;
  filePath: string;
}

interface FileListProps {
  practicalWorkId: number; // Идентификатор практической работы
}

const FileList: React.FC<FileListProps> = ({ practicalWorkId }) => {
  const [fileList, setFileList] = useState<FileDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession(); // Получаем данные сессии
  const { toast } = useToast(); // Уведомления об ошибках или успехах

  useEffect(() => {
    const fetchFileList = async () => {
      setIsLoading(true);
      try {
        if (!session?.user?.userId) {
          throw new Error("Не удалось получить ID пользователя");
        }

        const response = await fetch(`/api/practDetails?practicalWorkId=${practicalWorkId}&userId=${session.user.userId}`);
        if (!response.ok) {
          throw new Error("Не удалось загрузить список файлов");
        }

        const data = await response.json();
        if (Array.isArray(data.attachedFiles)) {
          setFileList(data.attachedFiles);
          if (data.attachedFiles.length === 0) {
            toast({
              title: "Информация",
              description: "Вы ещё не сдали практическую работу",
              variant: "default",
            });
          }
        } else {
          setFileList([]);
        }
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при загрузке списка файлов",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileList();
  }, [practicalWorkId, session?.user?.userId, toast]);

  // Обработчик скачивания файлов
  const handleDownload = async (filePath: string) => {
    try {
      const response = await fetch(`/api/download?filePath=${encodeURIComponent(filePath)}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileList.find((file) => file.filePath === filePath)?.filename || "downloaded_file";
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Не удалось скачать файл");
      }
    } catch (error) {
      console.error("Ошибка при скачивании файла:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при скачивании файла",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <Spinner />; // Индикатор загрузки
  }

  return (
    <Card className="bg-white shadow-md rounded-lg">
      <CardBody>
        <h3 className="text-lg font-bold mb-4">Список файлов</h3>
        <div className="overflow-y-auto max-h-60"> {/* Ограничиваем высоту и добавляем прокрутку */}
          {fileList.length > 0 ? (
            <ul>
              {fileList.map((file) => (
                <li key={file.id} className="flex justify-between items-center mb-2"> {/* Выравниваем содержимое */}
                  <span>{file.filename}</span> {/* Название файла */}
                  <Button
                    onClick={() => handleDownload(file.filePath)}
                    variant="outline"
                    size="sm"
                  >
                    Скачать
                  </Button> {/* Кнопка скачивания */}
                </li>
              ))}
            </ul>
          ) : (
            <div>Файлы не найдены.</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default FileList;
