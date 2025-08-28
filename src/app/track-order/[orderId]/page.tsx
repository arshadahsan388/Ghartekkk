
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Phone, Bike, PackageCheck, Hourglass, Loader2, ServerCrash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type Order = {
  id: string;
  shop: string;
  status: 'Pending' | 'Confirmed' | 'Out for Delivery' | 'Delivered' | 'Rejected' | 'Cancelled';
  date: string; // ISO String
};

const statusSteps = [
  { status: 'Confirmed', icon: Phone, title: 'Order Confirmed', description: 'Your order has been confirmed and is being prepared.' },
  { status: 'Out for Delivery', icon: Hourglass, title: 'Out for Delivery', description: 'A rider has picked up your order and is on the way.' },
  { status: 'Delivered', icon: PackageCheck, title: 'Delivered', description: 'Your order has been delivered. Enjoy!' },
];

const statusToIndex: Record<Order['status'], number> = {
  Pending: 0,
  Confirmed: 1,
  'Out for Delivery': 2,
  Delivered: 3,
  Rejected: -1,
  Cancelled: -1,
};


export default function TrackOrderPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.orderId) {
      setError("No order ID provided.");
      setIsLoading(false);
      return;
    }
    
    const orderRef = ref(db, `orders/${params.orderId}`);
    const unsubscribe = onValue(orderRef, (snapshot) => {
      if (snapshot.exists()) {
        setOrder({ id: snapshot.key, ...snapshot.val() });
      } else {
        setError('Order not found. Please check the ID and try again.');
      }
      setIsLoading(false);
    }, (err) => {
        console.error(err);
        setError("Failed to fetch order details.");
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [params.orderId]);

  const currentStatusIndex = order ? statusToIndex[order.status] : -1;
  const orderTime = order ? new Date(order.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

  if (isLoading) {
    return (
       <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <Skeleton className="h-9 w-3/4 mx-auto" />
                <Skeleton className="h-5 w-1/2 mx-auto mt-2" />
            </div>
            <Card><CardContent className="p-8"><Loader2 className="w-8 h-8 mx-auto animate-spin" /></CardContent></Card>
        </div>
       </div>
    )
  }

  if (error) {
    return (
         <div className="container mx-auto py-8">
            <div className="max-w-2xl mx-auto text-center">
                 <Card className="shadow-lg">
                    <CardHeader><CardTitle className="text-destructive flex items-center justify-center gap-2"><ServerCrash /> Error</CardTitle></CardHeader>
                    <CardContent><p>{error}</p></CardContent>
                 </Card>
            </div>
         </div>
    )
  }
  
  if (!order) {
    return null; // Should not happen if error state is handled
  }


  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
            <h1 className="font-headline text-3xl font-bold">Tracking Order #{params.orderId.substring(params.orderId.length - 6).toUpperCase()}</h1>
            <p className="text-muted-foreground mt-2">From "{order.shop}" to your doorstep.</p>
        </div>

        <Card className="shadow-lg">
            <CardContent className="p-8">
                <div className="space-y-8 relative">
                    {/* Vertical line */}
                    <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-border -z-10"></div>

                    {statusSteps.map((step, index) => {
                        const isCompleted = currentStatusIndex >= index + 1;
                        const isCurrent = currentStatusIndex === index + 1;
                        const StepIcon = step.icon;

                        return (
                            <div key={step.status} className="flex items-start gap-6">
                                <div className={cn(
                                    "flex items-center justify-center p-3 rounded-full z-10",
                                     isCompleted || isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 'bg-secondary text-muted-foreground'
                                )}>
                                    <StepIcon className="w-6 h-6"/>
                                </div>
                                <div>
                                    <p className={cn("font-semibold text-lg", !(isCompleted || isCurrent) && "text-muted-foreground")}>{step.title}</p>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                    {isCurrent && <p className="text-sm text-muted-foreground">{orderTime}</p>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
        
        <Separator className="my-8" />

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><Bike className="w-5 h-5" /> Rider Details</CardTitle>
            </CardHeader>
            <CardContent>
                {currentStatusIndex >= 2 ? (
                    <>
                     <p className="font-medium text-lg">Ali Khan</p>
                     <p className="text-muted-foreground">Honda CD-70 | LEH-1234</p>
                     <p className="text-muted-foreground">Rating: 4.8 ★</p>
                    </>
                ) : (
                    <p className="text-muted-foreground">Rider will be assigned once your order is out for delivery.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
