import { Button } from '@/components/ui/button';
import ShopList from '@/components/shops/ShopList';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <section className="relative w-full h-[400px] bg-primary/10 flex items-center justify-center">
        <div className="absolute inset-0">
           <Image
            src="https://picsum.photos/1920/400"
            alt="Hero Image"
            fill
            className="object-cover opacity-20"
            data-ai-hint="pakistani food platter"
            />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">
            Your Local Delivery Partner
          </h1>
          <p className="text-md md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            From your favorite restaurants to essential groceries and medicines, we deliver it all right to your doorstep in Vehari.
          </p>
        </div>
      </section>

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
