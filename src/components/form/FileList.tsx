"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast"; // Компонент для уведомлений
import { Card, CardHeader, CardBody } from "@/components/ui/card"; // Компоненты карточек
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
  const { toast } = useToast(); // Уведомления об ошибках или успехах

  // Загрузка списка файлов
  useEffect(() => {
    const fetchFileList = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/practDetails?practicalWorkId=${practicalWorkId}`);
        if (!response.ok) {
          throw new Error("Не удалось загрузить список файлов");
        }

        const data = await response.json();
        if (Array.isArray(data.attachedFiles)) {
          setFileList(data.attachedFiles);
        } else {
          setFileList([]);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileList();
  }, [practicalWorkId, toast]);

  // Обработчиeк скачивания файлов
  const handleDownload = async (filePath: string) => {
    try {
      const response = await fetch(`/api/download?filePath=${encodeURIComponent(filePath)}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob); // Создаем URL для скачивания
        const link = document.createElement("a");
        link.href = url;
        link.download = fileList.find((file) => file.filePath === filePath)?.filename || "downloaded_file";
        link.click();
        window.URL.revokeObjectURL(url); // Освобождаем временный URL после использования
      } else {
        throw new Error("Не удалось скачать файл");
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
      <CardHeader>
        <h3 className="text-lg font-bold">Список файлов</h3>
      </CardHeader>
      <CardBody className="overflow-y-auto max-h-60 "> {/* Ограничиваем высоту и добавляем прокрутку */}
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
      </CardBody>
    </Card>
  );
};

export default FileList;
