
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Phone, Bike, PackageCheck, Hourglass } from 'lucide-react';

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
                        <div className="flex items-center justify-center bg-primary text-primary-foreground p-3 rounded-full ring-4 ring-primary/20 z-10">
                            <Phone className="w-6 h-6"/>
                        </div>
                        <div>
                            <p className="font-semibold text-lg">Order Confirmed</p>
                            <p className="text-sm text-muted-foreground">Pak Delivers will call you shortly to confirm your order details.</p>
                            <p className="text-sm text-muted-foreground">10:30 PM</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-6">
                        <div className="flex items-center justify-center bg-primary text-primary-foreground p-3 rounded-full ring-4 ring-primary/20 z-10">
                            <Hourglass className="w-6 h-6"/>
                        </div>
                        <div>
                            <p className="font-semibold text-lg">Waiting for Rider</p>
                            <p className="text-sm text-muted-foreground">Your order is confirmed and we are assigning a rider.</p>
                             <p className="text-sm text-muted-foreground">10:45 PM</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-6">
                        <div className="flex items-center justify-center bg-secondary p-3 rounded-full z-10">
                            <PackageCheck className="w-6 h-6 text-muted-foreground"/>
                        </div>
                        <div>
                            <p className="font-semibold text-lg text-muted-foreground">Delivered</p>
                            <p className="text-sm text-muted-foreground">Your rider will confirm once the order is delivered.</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Separator className="my-8" />

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><Bike className="w-5 h-5" /> Rider Details</CardTitle>
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
