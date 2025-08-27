import { Button } from '@/components/ui/button';
import ShopRecommendations from '@/components/recommendations/ShopRecommendations';
import ShopList from '@/components/shops/ShopList';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-12">
        <div className="text-center p-8 border-2 border-dashed rounded-lg bg-secondary/50">
            <h2 className="font-headline text-2xl font-bold mb-2">Can't Find It? We'll Get It!</h2>
            <p className="text-muted-foreground mb-4">
                Need groceries, medicine, or something else? Just tell us what you need.
            </p>
            <Button asChild>
                <Link href="/custom-order">
                    <ShoppingCart className="mr-2 h-4 w-4"/>
                    Place a Custom Order
                </Link>
            </Button>
        </div>
        <ShopRecommendations />
        <ShopList />
      </div>
    </div>
  );
}
