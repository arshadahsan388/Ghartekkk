
'use client';
import { Megaphone } from "lucide-react";
import { useEffect, useState } from "react";

export default function AnnouncementBar() {
    const [announcement, setAnnouncement] = useState('Free delivery on all orders above Rs. 1000! Limited time offer.');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const savedAnnouncement = localStorage.getItem('announcement');
        if (savedAnnouncement) {
            setAnnouncement(savedAnnouncement);
        }
    }, []);

    if (!isMounted) {
        return null; // Or a loading skeleton
    }

    return (
        <div className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-4 h-10 overflow-hidden">
                    <Megaphone className="h-5 w-5 shrink-0" />
                    <div className="flex-1 overflow-hidden">
                        <p className="whitespace-nowrap moving-text text-sm font-medium">
                           {announcement}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
