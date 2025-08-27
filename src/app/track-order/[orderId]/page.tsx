import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bike, CookingPot, Home } from 'lucide-react';

export default function TrackOrderPage({ params }: { params: { orderId: string } }) {

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
            <h1 className="font-headline text-3xl font-bold">Tracking Order #{params.orderId}</h1>
            <p className="text-muted-foreground mt-2">From "Lahori Spice" to your doorstep.</p>
        </div>

        <Card className="shadow-lg">
            <CardContent className="p-8">
                <div className="space-y-8 relative">
                    {/* Vertical line */}
                    <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-border -z-10"></div>

                    <div className="flex items-start gap-6">
                        <div className="flex items-center justify-center bg-primary/20 text-primary-foreground p-3 rounded-full ring-4 ring-primary/10 z-10">
                            <CookingPot className="w-6 h-6"/>
                        </div>
                        <div>
                            <p className="font-semibold text-lg">Order Confirmed</p>
                            <p className="text-sm text-muted-foreground">Your order has been received by the restaurant.</p>
                            <p className="text-sm text-muted-foreground">10:30 PM</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-6">
                        <div className="flex items-center justify-center bg-primary/20 text-primary-foreground p-3 rounded-full ring-4 ring-primary/10 z-10">
                            <Bike className="w-6 h-6"/>
                        </div>
                        <div>
                            <p className="font-semibold text-lg">Out for Delivery</p>
                            <p className="text-sm text-muted-foreground">Your rider is on the way.</p>
                             <p className="text-sm text-muted-foreground">10:45 PM</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-6">
                        <div className="flex items-center justify-center bg-secondary p-3 rounded-full z-10">
                            <Home className="w-6 h-6 text-muted-foreground"/>
                        </div>
                        <div>
                            <p className="font-semibold text-lg text-muted-foreground">Delivered</p>
                            <p className="text-sm text-muted-foreground">Estimated arrival: 11:00 PM.</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Separator className="my-8" />

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Rider Details</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="font-medium text-lg">Ali Khan</p>
                <p className="text-muted-foreground">Honda CD-70 | LEH-1234</p>
                <p className="text-muted-foreground">Rating: 4.8 ★</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
