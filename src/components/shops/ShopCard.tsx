import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

type Shop = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  description: string;
  address: string;
  category: string;
};


export default function ShopCard({ shop }: { shop: Shop }) {
  return (
    <Link href={`/shop/${encodeURIComponent(shop.id)}?data=${encodeURIComponent(JSON.stringify(shop))}`}>
      <Card className="transition-shadow hover:shadow-lg duration-300 ease-in-out cursor-pointer flex flex-col group border h-full">
        <CardHeader className="p-4">
           <div className="flex justify-between items-start gap-4">
              <CardTitle className="font-headline text-lg">{shop.name}</CardTitle>
               <div className="flex items-center gap-1 text-sm font-bold text-primary">
                  <Star className="w-4 h-4 text-primary fill-primary"/>
                  <span>{shop.rating.toFixed(1)}</span>
              </div>
          </div>
          <CardDescription>
               <Badge variant="secondary" className="capitalize">{shop.cuisine}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2 flex-grow flex flex-col">
          <div className="text-sm text-muted-foreground">
            <p className="line-clamp-2">{shop.description}</p>
          </div>
          <div className="flex-grow"></div>
           <div className="flex items-start gap-2 text-xs text-muted-foreground pt-2 border-t mt-auto">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1">{shop.address}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
