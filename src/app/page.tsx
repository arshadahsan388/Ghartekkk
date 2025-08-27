import { Button } from '@/components/ui/button';
import ShopList from '@/components/shops/ShopList';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          <div className="text-center p-8 border-2 border-dashed rounded-lg bg-card shadow-sm">
              <h2 className="text-2xl font-bold mb-2 font-headline">Can't Find It? We'll Get It!</h2>
              <p className="text-muted-foreground mb-4">
                  Need groceries, medicine, or something else? Just tell us what you need.
              </p>
              <Button asChild size="lg">
                  <Link href="/custom-order">
                      <ShoppingCart className="mr-2 h-5 w-5"/>
                      Place a Custom Order
                  </Link>
              </Button>
          </div>
          <ShopList />
        </div>
      </div>
    </>
  );
}
