
'use client';
import { Siren } from "lucide-react";
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
            if (data && typeof data === 'string' && data.trim() !== '') {
                setAnnouncement(data);
                setIsVisible(true);
            } else {
                setAnnouncement('');
                setIsVisible(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (!isVisible || !announcement) {
        return null;
    }

    return (
        <div className="relative bg-primary text-primary-foreground overflow-hidden">
            <div className="py-2">
                <p className="moving-text whitespace-nowrap text-sm font-medium">
                    {announcement}
                </p>
            </div>
        </div>
    )
}
