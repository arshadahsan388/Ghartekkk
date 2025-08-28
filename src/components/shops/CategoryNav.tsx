
'use client';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

export default function CategoryNav() {
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const categoriesRef = ref(db, 'categories');
        const unsubscribe = onValue(categoriesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCategories(data);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const offset = 100; // Adjust this value to account for the sticky nav bar height
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = targetElement.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    if (isLoading) {
        return (
            <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
                <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-4">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
            <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 md:gap-4 overflow-x-auto">
                {categories.map(category => (
                    <Button asChild key={category} variant="ghost" className="rounded-full">
                        <Link 
                            href={`#${category.replace(/\s+/g, '-')}`}
                            onClick={(e) => handleScroll(e, category.replace(/\s+/g, '-'))}
                        >
                            {category}
                        </Link>
                    </Button>
                ))}
            </div>
        </div>
    )
}
