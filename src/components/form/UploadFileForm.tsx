import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface UploadFileFormProps {
  practicalWorkId: number;
}

const UploadFileForm: React.FC<UploadFileFormProps> = ({ practicalWorkId }) => {
  const { data: session, status } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Ошибка",
        description: "Файл не выбран",
        variant: "destructive",
      });
      return;
    }

    const userId = session?.user?.userId;
    if (!userId) {
      console.error("User ID не найден");
      toast({
        title: "Ошибка",
        description: "User ID не найден. Пожалуйста, войдите в систему.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("practicalWorkId", practicalWorkId.toString());
    formData.append("userId", userId.toString());

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Файл успешно загружен",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Ошибка",
          description: errorData.message || "Не удалось загрузить файл",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ошибка при загрузке файла:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке файла",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    setSelectedFile(file || null);
  };

  return (
    <div className="flex justify-center w-full mx-auto sm:max-w-lg">
      <div className="flex flex-col items-center justify-center w-full h-auto my-10 bg-white sm:w-2/3 sm:rounded-lg sm:shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-2">Загрузка файлов</h2>
        <p className="text-sm text-gray-500">Файл должен быть в формате .mp4, .avi, .mov или .mkv</p>
        <div className="relative w-full h-20 max-w-xs my-4 bg-white rounded-lg shadow-inner"
             onDragOver={handleDragOver}
             onDrop={handleDrop}>
          <input id="file-upload" className="hidden" type="file" onChange={handleFileChange} />
          <label htmlFor="file-upload" className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
            <p className="text-xs font-light text-center text-gray-500">{selectedFile ? selectedFile.name : "Перетащите файл сюда или выберите его"}</p>
            <svg className="w-8 h-8 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
            </svg>
          </label>
        </div>
        <Button onClick={handleUpload} disabled={!selectedFile}>
          Загрузить
        </Button>
      </div>
    </div>
  );
};

export default UploadFileForm;
