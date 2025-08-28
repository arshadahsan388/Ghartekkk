
'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, MapPin } from 'lucide-react';

type Shop = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  address: string;
  category: string;
};

export default function ShopPage({ params }: { params: { shopId: string } }) {
  const searchParams = useSearchParams();
  const shopData = searchParams.get('data');
  const shop: Shop = shopData ? JSON.parse(decodeURIComponent(shopData)) : null;

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Shop not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
       <Card>
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
                <CardTitle className="font-headline text-3xl">{shop.name}</CardTitle>
                <div className="flex items-center gap-1 text-lg font-bold text-primary">
                    <Star className="w-5 h-5 text-primary fill-primary"/>
                    <span>{shop.rating.toFixed(1)}</span>
                </div>
            </div>
            <CardDescription className="flex items-center gap-4 pt-2">
               <Badge variant="secondary" className="capitalize text-base">{shop.cuisine}</Badge>
               <span className="flex items-center gap-1 text-sm text-muted-foreground">
                 <Clock className="w-4 h-4"/> Delivery in {shop.deliveryTime} min
               </span>
            </CardDescription>
             <div className="flex items-start gap-2 text-sm text-muted-foreground pt-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="flex-1">{shop.address}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p>Products and order form will be here.</p>
          </CardContent>
        </Card>
    </div>
  );
}
