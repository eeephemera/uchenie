// src/components/SubjectCard.tsx
import React from 'react';
import { Card, CardContent, Typography, Avatar, IconButton, Box } from '@mui/material';
import { FolderOpen } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface SubjectCardProps {
  id: number;
  title: string;
  teacher: string;
  group: string;
  teacherImage: string;
  bgColor: string;
  description: string;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ id, title, teacher, group, teacherImage, bgColor, description }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/subjects/${id}`);
  };

  return (
    <Card sx={{ width: 350, height: 250, margin: 2, cursor: 'pointer', backgroundColor: bgColor }} onClick={handleCardClick}>
      <CardContent>
        <Typography variant="h5" noWrap>
          {title}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" noWrap>
          {group}
        </Typography>
        <Typography variant="body2" mt={2} noWrap>
          {description}
        </Typography>
        <Box display="flex" alignItems="center" mt={2}>
          <Avatar src={teacherImage} alt={teacher} />
          <Typography variant="body2" ml={2} noWrap>
            {teacher}
          </Typography>
        </Box>
      </CardContent>
      <Box display="flex" justifyContent="flex-end" mt={-6} mr={-2}>
        <IconButton>
          <FolderOpen />
        </IconButton>
      </Box>
    </Card>
  );
};

export default SubjectCard;
