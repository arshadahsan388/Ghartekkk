import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, MapPin } from 'lucide-react';

type ShopCardProps = {
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  address: string;
};

export default function ShopCard({ name, cuisine, rating, deliveryTime, address }: ShopCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-lg duration-300 ease-in-out cursor-pointer flex flex-col group border">
      <CardHeader className="p-4">
         <div className="flex justify-between items-start gap-4">
            <CardTitle className="font-headline text-lg">{name}</CardTitle>
             <div className="flex items-center gap-1 text-sm font-bold text-primary">
                <Star className="w-4 h-4 text-primary fill-primary"/>
                <span>{rating.toFixed(1)}</span>
            </div>
        </div>
        <CardDescription>
             <Badge variant="secondary" className="capitalize">{cuisine}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2 flex-grow flex flex-col">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4"/> Delivery in {deliveryTime} min
          </span>
        </div>
        <div className="flex-grow"></div>
         <div className="flex items-start gap-2 text-xs text-muted-foreground pt-2 border-t mt-auto">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="flex-1">{address}</span>
        </div>
      </CardContent>
    </Card>
  );
}
