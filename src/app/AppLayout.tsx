
'use client';

import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import GlobalAlert from '@/components/layout/GlobalAlert';
import { useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import AnnouncementBar from '@/components/layout/AnnouncementBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, set up a listener for their banned status.
        const userRef = ref(db, `users/${user.uid}`);
        const unsubscribeDb = onValue(userRef, (snapshot) => {
          if (snapshot.exists() && snapshot.val().isBanned) {
            // User is banned, sign them out immediately.
            signOut(auth).then(() => {
              toast({
                variant: 'destructive',
                title: 'Account Banned',
                description: 'Your account has been banned. Please contact support.',
              });
              router.push('/login');
            });
          }
        });

        // Cleanup the database listener when the component unmounts or user changes
        return () => unsubscribeDb();
      }
    });

    // Cleanup the auth listener when the component unmounts
    return () => unsubscribeAuth();
  }, [toast, router]);

  return (
    <>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AnnouncementBar />
            <Header />
            <main className="flex-grow pb-16">{children}</main>
            <Footer />
            <Toaster />
            <GlobalAlert />
        </ThemeProvider>
    </>
  );
}
