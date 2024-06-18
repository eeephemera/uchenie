import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Typography, Avatar, List, ListItem, CircularProgress, TextField, Button, Box, IconButton } from "@mui/material";
import { useToast } from "@/components/ui/use-toast";
import { ethers } from "ethers";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DescriptionIcon from '@mui/icons-material/Description';

interface SubmittedWork {
  id: number;
  studentName: string;
  fileName: string;
  filePath: string;
  grade: number | null;
  canGrade: boolean;
  studentAddress: string;
}

interface Student {
  id: number;
  username: string;
  email: string;
  attachedFiles: Array<{ grade: number | null }>;
}

interface PracticalWork {
  id: number;
  title: string;
  description: string;
  groupId: number;
}

interface SubmittedWorksListProps {
  practicalWorkId: number;
  practicalWork: PracticalWork;
}

const SubmittedWorksList: React.FC<SubmittedWorksListProps> = ({ practicalWorkId, practicalWork }) => {
  const [submittedWorks, setSubmittedWorks] = useState<SubmittedWork[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsWithoutFiles, setStudentsWithoutFiles] = useState<Student[]>([]);
  const [inputGrade, setInputGrade] = useState<{ [key: number]: string }>({});
  const [loadingWorkId, setLoadingWorkId] = useState<number | null>(null);
  const [grading, setGrading] = useState<{ [key: number]: boolean }>({});
  const [showUngraded, setShowUngraded] = useState(true);
  const [showGraded, setShowGraded] = useState(true);
  const [showNotSubmitted, setShowNotSubmitted] = useState(true);
  const { toast } = useToast();

  const checkAccount = useCallback(async () => {
    if (!window.ethereum) {
      toast({
        title: "Ошибка",
        description: "MetaMask не найден",
        variant: "destructive",
      });
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      const contractAddress = "0x5A08acBBBf67f35edeDe606cd536621F197a7aE2"; // Замените на адрес вашего контракта
      const abi = [
        // ABI вашего контракта
        "function owner() public view returns (address)"
      ];
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const owner = await contract.owner();

      if (address.toLowerCase() !== owner.toLowerCase()) {
        toast({
          title: "Предупреждение",
          description: "Ваш аккаунт не имеет прав для выполнения этой операции.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      if (error.code === "UNSUPPORTED_OPERATION") {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, войдите в MetaMask и выберите аккаунт.",
          variant: "destructive",
        });
      } else {
        console.error("Ошибка при проверке аккаунта:", error);
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при проверке аккаунта",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  useEffect(() => {
    const fetchSubmittedWorks = async () => {
      try {
        const response = await fetch(`/api/submittedWorks?practicalWorkId=${practicalWorkId}`);
        if (response.ok) {
          const data = await response.json();
          console.log("Submitted works data:", data); // Логирование данных
          if (Array.isArray(data.submittedWorks)) {
            setSubmittedWorks(data.submittedWorks);
          } else {
            throw new Error("Некорректный формат данных");
          }
        } else {
          throw new Error("Не удалось загрузить список сданных работ");
        }
      } catch (error) {
        console.error("Ошибка при загрузке сданных работ:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список сданных работ",
          variant: "destructive",
        });
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await fetch(`/api/studentsList?practicalWorkId=${practicalWorkId}&groupId=${practicalWork.groupId}`);
        if (response.ok) {
          const data = await response.json();
          console.log("Students data:", data); // Логирование данных
          if (Array.isArray(data.students)) {
            setStudents(data.students);
            setStudentsWithoutFiles(data.students.filter((student: Student) => student.attachedFiles.length === 0));
          } else {
            throw new Error("Некорректный формат данных");
          }
        } else {
          throw new Error("Не удалось загрузить список студентов");
        }
      } catch (error) {
        console.error("Ошибка при загрузке списка студентов:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список студентов",
          variant: "destructive",
        });
      }
    };

    fetchSubmittedWorks();
    fetchStudents();
    checkAccount();
  }, [practicalWorkId, practicalWork.groupId, checkAccount, toast]);

  const handleGrade = async (workId: number, studentAddress: string) => {
    try {
      const grade = parseInt(inputGrade[workId], 10);

      if (isNaN(grade) || grade < 1 || grade > 5) {
        toast({
          title: "Ошибка",
          description: "Оценка должна быть от 1 до 5",
          variant: "destructive",
        });
        return;
      }

      setGrading({ ...grading, [workId]: true });
      const response = await fetch(`/api/gradeWork`, {
        method: "POST",
        body: JSON.stringify({ workId, grade, studentAddress }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const updatedWorks = submittedWorks.map((work) =>
          work.id === workId ? { ...work, grade } : work
        );
        setSubmittedWorks(updatedWorks);
        setInputGrade((prevInputGrade) => {
          const updatedInputGrade = { ...prevInputGrade };
          updatedInputGrade[workId] = "";
          return updatedInputGrade;
        });
        toast({
          title: "Успешно",
          description: "Оценка успешно отправлена",
          variant: "default",
        });

        // Reward the student after grading
        await rewardStudent(workId, studentAddress, grade);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка при обновлении оценки");
      }
    } catch (error: any) {
      console.error("Ошибка при установке оценки:", error);
      toast({
        title: "Ошибка",
        description: `Не удалось обновить оценку: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setGrading({ ...grading, [workId]: false });
    }
  };

  const rewardStudent = async (workId: number, studentAddress: string, grade: number) => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask не найден");
      }

      await window.ethereum.request?.({ method: 'eth_requestAccounts' });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractAddress = "0x5A08acBBBf67f35edeDe606cd536621F197a7aE2"; // Замените на адрес вашего контракта
      const abi = [
        // ABI вашего контракта
        "function rewardStudent(address student, uint8 grade) public"
      ];
      const contract = new ethers.Contract(contractAddress, abi, signer);

      // Вызов функции rewardStudent
      const tx = await contract.rewardStudent(studentAddress, grade);
      await tx.wait();

      toast({
        title: 'Успешно',
        description: 'Студент вознагражден',
        variant: 'default',
      });
    } catch (error: any) {
      if (error.code === 'TRANSACTION_REPLACED') {
        if (error.replacement) {
          console.log('Transaction replaced with:', error.replacement);
          toast({
            title: 'Успешно',
            description: 'Транзакция была заменена новой. Студент вознагражден.',
            variant: 'default',
          });
        } else {
          console.error('Transaction was replaced and failed:', error.cancelled);
          toast({
            title: 'Ошибка',
            description: `Транзакция была заменена и не удалась: ${error.message}`,
            variant: 'destructive',
          });
        }
      } else {
        console.error('Ошибка при вознаграждении студента:', error);
        toast({
          title: 'Ошибка',
          description: `Не удалось вознаградить студента: ${error.message}`,
          variant: 'destructive',
        });
      }
    }
  };

  const ungradedWorks = submittedWorks.filter(work => work.grade === null);
  const gradedWorks = submittedWorks.filter(work => work.grade !== null);

  return (
    <Box display="flex" gap={2}>
      <Card sx={{ flex: 0.5, maxHeight: '80vh', overflowY: 'auto', boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" component="h2" gutterBottom>
            {practicalWork.title}
          </Typography>
          <Typography variant="body1">
            {practicalWork.description}
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1, maxHeight: '80vh', overflowY: 'auto', boxShadow: 3 }}>
        <CardContent>
          <Box mb={4}>
            <Typography variant="h5" component="h3" gutterBottom>
              Работы без оценки
              <IconButton onClick={() => setShowUngraded(!showUngraded)}>
                {showUngraded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Typography>
            {showUngraded && (
              ungradedWorks.length > 0 ? (
                <List>
                  {ungradedWorks.map((work) => (
                    <ListItem key={work.id} className="p-4 bg-gray-100 rounded-md shadow-sm mb-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar>{work.studentName[0]}</Avatar>
                        <div className="ml-4">
                          <Typography variant="h6">{work.studentName}</Typography>
                          <Typography variant="body2">
                            Файл: 
                            <a 
                              href={encodeURI(work.filePath)} 
                              download={work.fileName} 
                              className="text-blue-500 underline ml-2"
                            >
                              {work.fileName}
                            </a>
                          </Typography>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <TextField
                          className="mr-2 w-20"
                          placeholder="Оценка"
                          value={inputGrade[work.id] || ""}
                          onChange={(e) => {
                            const updatedInputGrade = { ...inputGrade };
                            updatedInputGrade[work.id] = e.target.value;
                            setInputGrade(updatedInputGrade);
                          }}
                          variant="outlined"
                          size="small"
                          disabled={grading[work.id]}
                        />
                        <Button 
                          onClick={() => handleGrade(work.id, work.studentAddress)} 
                          disabled={grading[work.id]}
                          startIcon={grading[work.id] ? <CircularProgress size={20} /> : <CheckCircleOutlineIcon />}
                          variant="contained"
                          color="primary"
                        >
                          Поставить оценку
                        </Button>
                      </div>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <DescriptionIcon sx={{ fontSize: 80, color: 'gray' }} />
                  <Typography variant="body1" ml={2}>Нет работ без оценки.</Typography>
                </Box>
              )
            )}
          </Box>
          <Box mb={4}>
            <Typography variant="h5" component="h3" gutterBottom>
              Оцененные работы
              <IconButton onClick={() => setShowGraded(!showGraded)}>
                {showGraded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Typography>
            {showGraded && (
              gradedWorks.length > 0 ? (
                <List>
                  {gradedWorks.map((work) => (
                    <ListItem key={work.id} className="p-4 bg-gray-100 rounded-md shadow-sm mb-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar>{work.studentName[0]}</Avatar>
                        <div className="ml-4">
                          <Typography variant="h6">{work.studentName}</Typography>
                          <Typography variant="body2">
                            Файл: 
                            <a 
                              href={encodeURI(work.filePath)} 
                              download={work.fileName} 
                              className="text-blue-500 underline ml-2"
                            >
                              {work.fileName}
                            </a>
                          </Typography>
                          <Typography variant="body2" className="mt-2">Оценка: {work.grade}</Typography>
                        </div>
                      </div>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <DescriptionIcon sx={{ fontSize: 80, color: 'gray' }} />
                  <Typography variant="body1" ml={2}>Оцененных работ пока нет.</Typography>
                </Box>
              )
            )}
          </Box>
          <Box>
            <Typography variant="h5" component="h3" gutterBottom>
              Студенты без прикрепленных файлов
              <IconButton onClick={() => setShowNotSubmitted(!showNotSubmitted)}>
                {showNotSubmitted ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Typography>
            {showNotSubmitted && (
              studentsWithoutFiles.length > 0 ? (
                <List>
                  {studentsWithoutFiles.map((student) => (
                    <ListItem key={student.id} className="p-4 bg-gray-100 rounded-md shadow-sm mb-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar>{student.username[0]}</Avatar>
                        <div className="ml-4">
                          <Typography variant="h6">{student.username}</Typography>
                          <Typography variant="body2">Email: {student.email}</Typography>
                        </div>
                      </div>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <DescriptionIcon sx={{ fontSize: 80, color: 'gray' }} />
                  <Typography variant="body1" ml={2}>Все студенты прикрепили файлы.</Typography>
                </Box>
              )
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SubmittedWorksList;
