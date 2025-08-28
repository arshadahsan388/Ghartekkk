
'use client';
import ShopCard from './ShopCard';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

type Shop = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  address: string;
  category: string;
};

export default function ShopList() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const shopsRef = ref(db, 'shops');
    const categoriesRef = ref(db, 'categories');

    const unsubscribeShops = onValue(shopsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setShops(Object.values(data));
        }
        setIsLoading(false);
    });
    
    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
        const data = snapshot.val();
        if(data) {
            setCategories(data);
        }
    });

    return () => {
        unsubscribeShops();
        unsubscribeCategories();
    }
  }, []);

  if (isLoading) {
    return (
        <div className="space-y-12">
            {[...Array(2)].map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-10 w-1/4 mb-6" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, j) => (
                            <CardSkeleton key={j} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
  }


  return (
    <div className="space-y-12">
      {categories.map(category => (
        <div key={category} id={category.replace(/\s+/g, '-')}>
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold font-headline">{category}</h2>
            <p className="text-muted-foreground mt-1">Find the best {category.toLowerCase()} options in town.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shops
              .filter(shop => shop.category === category)
              .map((shop) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CardSkeleton() {
    return (
        <div className="p-4 border rounded-lg space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="pt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        </div>
    )
}
