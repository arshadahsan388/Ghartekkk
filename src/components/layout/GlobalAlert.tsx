
'use client';
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
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

  useEffect(() => {
    const settingsRef = ref(db, 'settings/alert');
    // Use a unique key for localStorage to avoid conflicts with admin panel logic
    const lastSeenAlertKey = 'userLastSeenAlert';
    const lastSeenAlert = localStorage.getItem(lastSeenAlertKey);

    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      // Show the alert if it's new, non-empty, and different from the last one seen by the user.
      if (data && typeof data === 'string' && data.trim() !== '' && data !== lastSeenAlert) {
        setAlertToShow(data);
      } else {
        setAlertToShow(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAlertClose = () => {
    if (alertToShow) {
       // Use the same unique key to save the alert
      localStorage.setItem('userLastSeenAlert', alertToShow);
    }
    setAlertToShow(null);
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
