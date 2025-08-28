
'use client';

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";


export default function CategoryNav() {
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('');
    const pathname = usePathname();

    useEffect(() => {
        const categoriesRef = ref(db, 'categories');
        const unsubscribe = onValue(categoriesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCategories(data);
                 if(data.length > 0) setActiveCategory(data[0]);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, category: string) => {
        e.preventDefault();
        setActiveCategory(category);
        const targetId = category.replace(/\s+/g, '-');
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const offset = 180; // Adjust this value to account for the sticky nav bar height
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
            <div className="border-b">
                <div className="container mx-auto px-4 flex items-center justify-center gap-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        )
    }

    return (
        <div className="border-b sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
            <div className="container mx-auto px-4 flex items-center justify-start gap-1 md:gap-2 overflow-x-auto">
                {categories.map(category => {
                    const isActive = activeCategory === category;
                    return (
                        <Link 
                            href={`#${category.replace(/\s+/g, '-')}`}
                            key={category}
                            onClick={(e) => handleScroll(e, category)}
                            className={cn(
                                "whitespace-nowrap px-4 py-3 border-b-2 font-medium text-sm transition-colors",
                                isActive 
                                    ? 'border-primary text-primary' 
                                    : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                            )}
                        >
                            {category}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
