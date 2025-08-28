
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get, child } from 'firebase/database';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import GoogleSignInButton from './GoogleSignInButton';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Check user role and ban status
      const userRef = ref(db);
      const snapshot = await get(child(userRef, `users/${user.uid}`));
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.isBanned) {
            toast({
                variant: 'destructive',
                title: 'Account Banned',
                description: 'Your account has been banned. Please contact support.',
            });
            await auth.signOut();
            return;
        }
        
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        
        if (userData.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
        return;
      }
      
      // Fallback for users that might not have a DB entry for some reason
      toast({
        title: 'Login Successful',
        description: 'Welcome back! Redirecting you to the dashboard.',
      });
      router.push('/');
      router.refresh();

    } catch (error: any) {
       console.error("Login error:", error);
       if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Incorrect email or password. Please try again.',
            });
       } else {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: error.message || 'An unexpected error occurred.',
            });
       }
    }
  }

  return (
    <div className="grid gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </Form>
      <div className="relative">
        <Separator />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="bg-card px-2 text-sm text-muted-foreground">
            OR
          </span>
        </div>
      </div>
      <GoogleSignInButton />
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
