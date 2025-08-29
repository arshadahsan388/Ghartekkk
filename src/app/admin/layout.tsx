
'use client';

import { Inter } from 'next/font/google';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';
import { Toaster } from '@/components/ui/toaster';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { get, ref, child } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);
      const userRef = ref(db);
      try {
        const snapshot = await get(child(userRef, `users/${currentUser.uid}`));
        if (snapshot.exists() && snapshot.val().role === 'admin') {
          setIsAdmin(true);
        } else {
          router.push('/'); // Redirect non-admins to the home page
        }
      } catch (error) {
        console.error("Permission check failed", error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);
  
  useEffect(() => {
    // Add a class to the body to hide the main footer
    document.body.classList.add('admin-active');
    return () => {
      document.body.classList.remove('admin-active');
    };
  }, []);

  if (isLoading) {
    return (
        <div className="flex h-screen w-full bg-muted/40">
            <div className="w-64 border-r p-4 hidden md:block">
                 <Skeleton className="h-8 w-3/4 mb-8" />
                 <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                 </div>
            </div>
            <div className="flex-1 p-8">
                <Skeleton className="h-12 w-1/4 mb-8" />
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
  }

  if (!isAdmin) {
    return null; // Render nothing while redirecting
  }

  return (
    <div className={`flex min-h-screen w-full flex-col bg-muted/40 ${inter.className} antialiased`}>
      <AdminSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        {children}
      </div>
      <Toaster />
    </div>
  );
}
