'use client';

import React, { useEffect, useState } from 'react';
import { Select, MenuItem, TextField, InputLabel, FormControl, Button, Box, Typography, Paper } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { Group } from '@prisma/client';

const FormSchema = z.object({
  title: z.string().min(1, 'Требуется заголовок').max(100),
  description: z.string().min(1, 'Требуется описание').max(2000),
  link: z.string().url('Некорректный формат ссылки').optional(),
  groupId: z.number().positive('Выберите группу'),
  subjectId: z.number().positive('Выберите предметную область'),
});

interface PracticalWorkCreateFormProps {
  subjectId: number;
  teacherId: number;
  onSuccess: (newPracticalWorkId: number) => void;
}

const PracticalWorkCreateForm: React.FC<PracticalWorkCreateFormProps> = ({ subjectId, teacherId, onSuccess }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
      link: '',
      groupId: 0,
      subjectId: subjectId,
    },
  });

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`/api/groups?subjectId=${subjectId}&teacherId=${teacherId}`);
        const data = await response.json();
        console.log('Fetched groups:', data); // Log the fetched groups for debugging
        setGroups(data);
      } catch (error) {
        console.error('Ошибка загрузки групп:', error);
      }
    };

    fetchGroups();
  }, [subjectId, teacherId]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      const response = await fetch('/api/practicalworkCreate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const { newPracticalWork } = await response.json();
        toast({
          title: "Успех",
          description: "Вы успешно создали практическую работу",
        });
        form.reset();
        onSuccess(newPracticalWork.id); // Call onSuccess with the new practical work ID
      } else {
        toast({
          title: "Ошибка",
          description: "Что-то пошло не так",
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating practical work:', error);
      toast({
        title: "Ошибка",
        description: "Что-то пошло не так",
        variant: 'destructive',
      });
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: '24px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', color: '#000' }}>
      <Typography variant="h4" gutterBottom>
        Создание новой практической работы
      </Typography>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column" gap="16px">
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Заголовок"
                variant="outlined"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Описание"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="link"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Ссылка"
                variant="outlined"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="groupId"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormControl variant="outlined" fullWidth error={!!fieldState.error}>
                <InputLabel id="group-label">Список групп</InputLabel>
                <Select
                  labelId="group-label"
                  {...field}
                  label="Список групп"
                  onChange={(e) => field.onChange(Number(e.target.value))}
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
                {fieldState.error && <Typography color="error">{fieldState.error.message}</Typography>}
              </FormControl>
            )}
          />

          <Button variant="contained" color="primary" type="submit" size="large" sx={{ backgroundColor: '#000', color: '#fff' }}>
            Подтвердить
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default PracticalWorkCreateForm;
