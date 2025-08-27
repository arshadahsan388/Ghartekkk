import { Button } from '@/components/ui/button';
import ShopList from '@/components/shops/ShopList';
import Link from 'next/link';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <div className="relative pt-10 pb-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent -z-10"></div>
        <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight font-headline bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent drop-shadow-md">
                From Cravings to Comfort
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-base text-muted-foreground">
              From your favorite restaurants to essential groceries and medicines, we deliver it all right to your doorstep in Vehari.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-amber-400 text-primary-foreground hover:shadow-lg transition-shadow">
                  <Link href="/custom-order">
                      <ShoppingCart className="mr-2 h-5 w-5"/>
                      Place a Custom Order
                  </Link>
              </Button>
            </div>
        </div>
      </div>
      <div id="shops" className="container mx-auto px-4 py-12">
        <ShopList />
      </div>
    </>
  );
}
