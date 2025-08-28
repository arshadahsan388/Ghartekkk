
'use client';
import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
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
  const [alertToShow, setAlertToShow] = useState<string | null>(null);
  const [isUserSpecific, setIsUserSpecific] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (user) {
            setUserId(user.uid);
        } else {
            setUserId(null);
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
        setAlertToShow(data);
        setIsUserSpecific(false);
      }
    });

    return () => unsubscribeGlobal();
  }, []);
  
  useEffect(() => {
     if (userId) {
        // Listener for user-specific alerts
        const userAlertRef = ref(db, `users/${userId}/alert`);
        const unsubscribeUser = onValue(userAlertRef, (snapshot) => {
            const data = snapshot.val();
            if (data && typeof data === 'string' && data.trim() !== '') {
                // User-specific alerts always take priority
                setAlertToShow(data);
                setIsUserSpecific(true);
            }
        });

        return () => unsubscribeUser();
    }
  }, [userId]);


  const handleAlertClose = async () => {
    if (isUserSpecific && userId) {
        // For user-specific alerts, remove them from the database
        const userAlertRef = ref(db, `users/${userId}/alert`);
        await set(userAlertRef, null);
    } else if (alertToShow) {
       // For global alerts, save to localStorage
      localStorage.setItem('userLastSeenAlert', alertToShow);
    }
    setAlertToShow(null);
    setIsUserSpecific(false);
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
