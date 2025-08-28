
'use client';
import { Siren, X } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function AnnouncementBar() {
    const [announcement, setAnnouncement] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const announcementRef = ref(db, 'settings/announcement');
        
        const unsubscribe = onValue(announcementRef, (snapshot) => {
            const data = snapshot.val();
            if (data && typeof data === 'string') {
                setAnnouncement(data);
                if (localStorage.getItem('announcementSeen') !== data) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            } else {
                setAnnouncement('');
                setIsVisible(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('announcementSeen', announcement);
    }

    if (!isVisible || !announcement) {
        return null;
    }

    return (
        <div className="relative bg-primary/20 text-primary-foreground px-4 py-3 text-sm flex items-center justify-center text-center">
            <Siren className="w-5 h-5 mr-3 text-primary shrink-0" />
            <span className="text-primary font-medium">{announcement}</span>
            <button 
                onClick={handleDismiss}
                className="absolute top-1/2 -translate-y-1/2 right-4 text-primary hover:opacity-75 transition-opacity"
                aria-label="Dismiss announcement"
            >
                <X className="w-5 h-5"/>
            </button>
        </div>
    )
}
