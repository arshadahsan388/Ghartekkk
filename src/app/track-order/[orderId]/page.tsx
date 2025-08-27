import OrderTrackingMap from '@/components/tracking/OrderTrackingMap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bike, CheckCircle2, CookingPot, Home } from 'lucide-react';

export default function TrackOrderPage({ params }: { params: { orderId: string } }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-destructive">Google Maps API key is missing. Please configure it to use the tracking feature.</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] grid md:grid-cols-3">
      <div className="md:col-span-2 relative">
        <OrderTrackingMap apiKey={apiKey} />
      </div>
      <div className="md:col-span-1 p-6 bg-card border-l overflow-y-auto">
        <h1 className="font-headline text-2xl font-bold">Tracking Order #{params.orderId}</h1>
        <p className="text-muted-foreground mb-6">From "Lahori Spice" to your doorstep.</p>

        <div className="space-y-8">
            <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                    <div className="bg-primary/20 text-primary-foreground p-2 rounded-full ring-4 ring-primary/10"><CookingPot className="w-5 h-5"/></div>
                    <div className="w-px h-16 bg-border my-2"></div>
                </div>
                <div>
                    <p className="font-semibold">Order Confirmed</p>
                    <p className="text-sm text-muted-foreground">Your order has been received.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                 <div className="flex flex-col items-center">
                    <div className="bg-primary/20 text-primary-foreground p-2 rounded-full ring-4 ring-primary/10"><Bike className="w-5 h-5"/></div>
                    <div className="w-px h-16 bg-border my-2"></div>
                </div>
                <div>
                    <p className="font-semibold">Out for Delivery</p>
                    <p className="text-sm text-muted-foreground">Your rider is on the way.</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                 <div className="p-2 bg-secondary rounded-full"><Home className="w-5 h-5 text-muted-foreground"/></div>
                <div>
                    <p className="font-semibold text-muted-foreground">Delivered</p>
                    <p className="text-sm text-muted-foreground">Estimated arrival: 15 minutes.</p>
                </div>
            </div>
        </div>
        
        <Separator className="my-6" />

        <Card>
            <CardHeader>
                <CardTitle>Rider Details</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="font-medium">Ali Khan</p>
                <p className="text-sm text-muted-foreground">Honda CD-70 | LEH-1234</p>
                <p className="text-sm text-muted-foreground">Rating: 4.8 ★</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
