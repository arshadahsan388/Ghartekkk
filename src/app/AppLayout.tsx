
'use client';

import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import GlobalAlert from '@/components/layout/GlobalAlert';
import { useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, set up listeners.
        
        // Listener for banned status.
        const userDbRef = ref(db, `users/${user.uid}`);
        const unsubscribeDb = onValue(userDbRef, (snapshot) => {
          if (snapshot.exists() && snapshot.val().isBanned) {
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

        // Presence system logic
        const presenceRef = ref(db, `/status/${user.uid}`);
        set(presenceRef, { isOnline: true, last_changed: serverTimestamp() });
        onDisconnect(presenceRef).set({ isOnline: false, last_changed: serverTimestamp() });

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
            <Header />
            <main className="flex-grow pb-16">{children}</main>
            <Footer />
            <Toaster />
            <GlobalAlert />
        </ThemeProvider>
    </>
  );
}
