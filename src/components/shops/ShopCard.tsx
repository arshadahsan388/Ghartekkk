import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, MapPin } from 'lucide-react';

type ShopCardProps = {
  name: string;
  cuisine: string;
  rating: number;
  imageUrl: string;
  deliveryTime: number;
  address: string;
  [key: string]: any; 
};

export default function ShopCard({ name, cuisine, rating, imageUrl, deliveryTime, address, ...props }: ShopCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-2xl duration-300 ease-in-out cursor-pointer flex flex-col group border">
      <CardHeader className="p-0 relative">
        <Image
          src={imageUrl}
          alt={name}
          width={400}
          height={250}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          {...props}
        />
        <div className="absolute top-2 right-2 flex items-center gap-1 text-sm font-medium bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-foreground">
            <Star className="w-4 h-4 text-primary fill-primary"/>
            <span>{rating.toFixed(1)}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2 flex-grow flex flex-col">
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-lg">{name}</CardTitle>
             <Badge variant="secondary" className="capitalize">{cuisine}</Badge>
        </div>
        <CardDescription className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3"/> Delivery in {deliveryTime} min
          </span>
        </CardDescription>
        <div className="flex-grow"></div>
         <div className="flex items-start gap-2 text-xs text-muted-foreground pt-2 border-t mt-auto">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="flex-1">{address}</span>
        </div>
      </CardContent>
    </Card>
  );
}
