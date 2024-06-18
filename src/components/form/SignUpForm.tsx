'use client';
import { useForm } from 'react-hook-form';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel, 
  FormMessage,
}
 from '../ui/form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components//ui/use-toast';


const FormSchema = z
  .object({
    username: z.string().min(1, 'Требуется имя пользователя').max(100),
    email: z.string().min(1, 'Требуется адрес электронной почты').email('Неверный адрес электронной почты'),
    password: z
      .string()
      .min(1, 'Требуется пароль')
      .min(8, 'Пароль должен содержать не менее 8 символов'),
    confirmPassword: z.string().min(1, 'Требуется подтверждение пароля'),
    role: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Пароли не совпадают',
  });

  
const SignUpForm = () => {
    const router = useRouter();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER',
      },
    });

    const onSubmit = async (values: z.infer<typeof FormSchema>) => {
      const response = await fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: values.username,
                email: values.email,
                password: values.password,
                role: values.role,
              })
        })
        
        if(response.ok) {
            router.push('/sign-in')
        } else {
          toast({
            title: "error",
            description: "Ой-йой-йой, что-то пошло не так",
            variant: 'destructive',
          });        }
    };

    return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
            <div className='space-y-2'>
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя пользователя</FormLabel>
                    <FormControl>
                      <Input placeholder='Сатоши' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Электронная почта</FormLabel>
                    <FormControl>
                      <Input placeholder='mail@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='Введите пароль'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Повторите пароль</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Повторите пароль'
                        type='password'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button className='w-full mt-6' type='submit'>
              Зарегистрироваться
            </Button>
          </form>

          <p className='text-center text-sm text-gray-600 mt-2'>
            Если у вас нет учетной записи, пожалуйста,&nbsp;
            <Link className='text-blue-500 hover:underline' href='/sign-in'>
              Войдите
            </Link>
          </p>
        </Form>
      );
    };
    
    export default SignUpForm; 