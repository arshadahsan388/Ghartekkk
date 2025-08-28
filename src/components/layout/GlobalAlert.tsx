
'use client';
import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Siren } from 'lucide-react';

export default function GlobalAlert() {
  const [globalAlert, setGlobalAlert] = useState<string | null>(null);
  const [userAlert, setUserAlert] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const alertToShow = userAlert || globalAlert;
  const isUserSpecific = !!userAlert;

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Clear user-specific alert if logged out
        setUserAlert(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Listener for global alerts
    const globalAlertRef = ref(db, 'settings/alert');
    const lastSeenGlobalAlert = localStorage.getItem('userLastSeenAlert');
    
    const unsubscribeGlobal = onValue(globalAlertRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === 'string' && data.trim() !== '' && data !== lastSeenGlobalAlert) {
        setGlobalAlert(data);
      } else {
        setGlobalAlert(null);
      }
    });

    return () => unsubscribeGlobal();
  }, []);
  
  useEffect(() => {
     if (user) {
        // Listener for user-specific alerts
        const userAlertRef = ref(db, `users/${user.uid}/alert`);
        const unsubscribeUser = onValue(userAlertRef, (snapshot) => {
            const data = snapshot.val();
            if (data && typeof data === 'string' && data.trim() !== '') {
                setUserAlert(data);
            } else {
                setUserAlert(null);
            }
        });

        return () => unsubscribeUser();
    }
  }, [user]);


  const handleAlertClose = async () => {
    if (isUserSpecific && user) {
        // For user-specific alerts, remove them from the database
        const userAlertRef = ref(db, `users/${user.uid}/alert`);
        await set(userAlertRef, null);
        setUserAlert(null);
    } else if (globalAlert) {
       // For global alerts, save to localStorage
      localStorage.setItem('userLastSeenAlert', globalAlert);
      setGlobalAlert(null);
    }
  };

  if (!alertToShow) {
    return null;
  }

  return (
    <AlertDialog open={!!alertToShow} onOpenChange={(open) => !open && handleAlertClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-center gap-2">
            <Siren className="w-6 h-6 text-destructive" />
            Alert
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center pt-2">
            {alertToShow}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleAlertClose}>Got it</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
