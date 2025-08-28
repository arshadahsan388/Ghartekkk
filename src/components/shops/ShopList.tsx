
'use client';
import ShopCard from './ShopCard';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import CategoryNav from './CategoryNav';

type Shop = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  description: string;
  address: string;
  category: string;
};

export default function ShopList() {
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const shopsRef = ref(db, 'shops');
    const categoriesRef = ref(db, 'categories');

    const unsubscribeShops = onValue(shopsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const shopList = Object.values(data);
            setAllShops(shopList);
            setFilteredShops(shopList);
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

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = allShops.filter(shop => 
        shop.name.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredShops(filtered);
  }, [searchQuery, allShops]);

  if (isLoading) {
    return (
        <div className="space-y-12">
            <Skeleton className="h-12 w-full mb-6" />
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

  const shopsByCategory = categories.map(category => ({
      category,
      shops: filteredShops
        .filter(shop => shop.category === category)
        .sort((a,b) => b.rating - a.rating) // Sort by rating
        .slice(0, searchQuery ? undefined : 3) // Show top 3 unless searching
  })).filter(group => group.shops.length > 0);


  return (
    <div className="space-y-8">
        <div className="space-y-4">
            <CategoryNav />
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search all shops..."
                    className="pl-10 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        <div className="space-y-12">
        {shopsByCategory.map(({ category, shops }) => (
            <div key={category} id={category.replace(/\s+/g, '-')}>
            <div className="mb-6">
                <h2 className="text-3xl sm:text-4xl font-bold font-headline">{category}</h2>
                 {searchQuery ? (
                    <p className="text-muted-foreground mt-1">Showing search results for "{searchQuery}" in {category}.</p>
                 ) : (
                    <p className="text-muted-foreground mt-1">Top-rated {category.toLowerCase()} options in town.</p>
                 )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {shops.map((shop) => (
                    <ShopCard
                    key={shop.id}
                    shop={shop}
                    />
                ))}
            </div>
            </div>
        ))}
         {shopsByCategory.length === 0 && !isLoading && (
            <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">No shops found matching your search.</p>
            </div>
        )}
        </div>
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
