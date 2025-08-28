
'use client';
import { Siren, X } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "../ui/button";

export default function AnnouncementBar() {
    const [announcement, setAnnouncement] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const announcementRef = ref(db, 'settings/announcement');
        
        const unsubscribe = onValue(announcementRef, (snapshot) => {
            const data = snapshot.val();
            if (data && typeof data === 'string') {
                setAnnouncement(data);
                if (sessionStorage.getItem('announcementSeen') !== data) {
                   setIsOpen(true);
                }
            } else {
                setAnnouncement('');
            }
        });

        return () => unsubscribe();
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('announcementSeen', announcement);
    }

    if (!isMounted || !announcement || !isOpen) {
        return null;
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Siren className="h-6 w-6 text-primary"/>
                        Alert
                    </AlertDialogTitle>
                    <AlertDialogDescription className="pt-4 text-base">
                       {announcement}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Button variant="outline" onClick={handleClose}>
                    Got it!
                </Button>
            </AlertDialogContent>
        </AlertDialog>
    )
}
