'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';

const ProfileSchema = z.object({
  username: z.string().min(1, 'Имя пользователя обязательно'),
  email: z.string().email('Неверный формат email'),
  studentAddress: z.string().optional(),
});

interface ProfileFormData {
  username: string;
  email: string;
  studentAddress?: string;
}

const ProfilePage = () => {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      username: '',
      email: '',
      studentAddress: '',
    }
  });

  useEffect(() => {
    if (session) {
      reset({
        username: session.user?.username || '',
        email: session.user?.email || '',
        studentAddress: session.user?.studentAddress || '',
      });
    }
  }, [session, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!session) return;

    setLoading(true);
    try {
      const response = await fetch('/api/updateProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Профиль успешно обновлен. Пожалуйста, перезайдите в аккаунт.",
          variant: "default",
        });
        setIsEditing(false);
        setIsBlocked(true);
      } else {
        const errorData = await response.json();
        toast({
          title: "Ошибка",
          description: errorData.message || "Ошибка при обновлении профиля",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      toast({
        title: "Ошибка",
        description: "Ошибка при обновлении профиля",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Профиль</h1>
      {session ? (
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Имя пользователя</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              disabled={!isEditing || isBlocked}
              {...register('username')}
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              disabled={!isEditing || isBlocked}
              {...register('email')}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Адрес криптокошелька</label>
            {isEditing ? (
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                disabled={isBlocked}
                {...register('studentAddress')}
              />
            ) : (
              <p className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                {session.user?.studentAddress || 'Криптокошелек не прикреплен'}
              </p>
            )}
            {errors.studentAddress && <p className="text-red-500 text-sm mt-1">{errors.studentAddress.message}</p>}
          </div>
          <div className="flex space-x-4">
            {isEditing ? (
              <>
                <Button type="button" onClick={handleSubmit(onSubmit)} disabled={loading || isBlocked}>
                  {loading ? "Сохранение..." : "Сохранить"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={loading || isBlocked}>Отмена</Button>
              </>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)} disabled={isBlocked}>Редактировать</Button>
            )}
          </div>
          {isBlocked && (
            <p className="text-red-500 text-sm mt-4">
              Пожалуйста, перезайдите в аккаунт, чтобы увидеть изменения.
            </p>
          )}
        </form>
      ) : (
        <p>Вы не авторизованы. Пожалуйста, войдите в систему.</p>
      )}
    </div>
  );
};

export default ProfilePage;
