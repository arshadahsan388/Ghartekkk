
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get, child } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const userRef = ref(db);
      try {
        const snapshot = await get(child(userRef, `users/${currentUser.uid}`));
        if (snapshot.exists() && snapshot.val().role === 'admin') {
          setIsVerifiedAdmin(true);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error("Failed to verify admin status:", error);
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!isVerifiedAdmin) {
    return (
      <div className="flex min-h-screen">
        <div className="w-64 border-r p-4 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>
        <main className="flex-1 p-8">
            <Skeleton className="h-screen w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/40">
        {children}
      </main>
    </div>
  );
}
