import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock } from 'lucide-react';

type ShopCardProps = {
  name: string;
  cuisine: string;
  rating: number;
  imageUrl: string;
  deliveryTime: number;
  [key: string]: any; 
};

export default function ShopCard({ name, cuisine, rating, imageUrl, deliveryTime, ...props }: ShopCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300 ease-in-out cursor-pointer">
      <CardHeader className="p-0">
        <Image
          src={imageUrl}
          alt={name}
          width={400}
          height={250}
          className="w-full h-40 object-cover"
          {...props}
        />
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-lg">{name}</CardTitle>
            <div className="flex items-center gap-1 text-sm font-medium">
                <Star className="w-4 h-4 text-primary fill-primary"/>
                <span>{rating.toFixed(1)}</span>
            </div>
        </div>
        <CardDescription className="flex justify-between items-center">
          <span>{cuisine}</span>
          <span className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3"/> {deliveryTime} min
          </span>
        </CardDescription>
      </CardContent>
    </Card>
  );
}
