

'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, Bike, PackageCheck, Hourglass, Loader2, ServerCrash, CheckCircle2, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, update } from 'firebase/database';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

type Order = {
  id: string;
  shop: string;
  status: 'Pending' | 'Confirmed' | 'Out for Delivery' | 'Delivered' | 'Rejected' | 'Cancelled';
  date: string; // ISO String
  deliverySpeed?: 'normal' | 'fast';
};

const statusSteps = [
  { status: 'Confirmed', icon: Phone, title: 'Order Confirmed', description: 'The shop is preparing your order.' },
  { status: 'Out for Delivery', icon: Bike, title: 'Out for Delivery', description: 'A rider has picked up your order.' },
  { status: 'Delivered', icon: Home, title: 'Delivered', description: 'Your order has arrived. Enjoy!' },
];

const statusToIndex: Record<Order['status'], number> = {
  Pending: 0,
  Confirmed: 1,
  'Out for Delivery': 2,
  Delivered: 3,
  Rejected: -1,
  Cancelled: -1,
};

const DELIVERY_TIME_NORMAL_MINS = 40;
const DELIVERY_TIME_FAST_MINS = 20;

export default function TrackOrderPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

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

  useEffect(() => {
    if (order?.status === 'Out for Delivery') {
        const totalDuration = (order.deliverySpeed === 'fast' ? DELIVERY_TIME_FAST_MINS : DELIVERY_TIME_NORMAL_MINS) * 60; // in seconds
        const startTime = new Date(order.date).getTime(); // This should be when it's marked "Out for Delivery"
        
        const interval = setInterval(() => {
            const now = Date.now();
            const timeElapsed = (now - startTime) / 1000;
            const newProgress = Math.min((timeElapsed / totalDuration) * 100, 100);
            
            setProgress(newProgress);
            setTimeLeft(Math.max(0, totalDuration - timeElapsed));

            if (newProgress >= 100) {
                clearInterval(interval);
                const orderRef = ref(db, `orders/${order.id}`);
                update(orderRef, { status: 'Delivered' });
            }
        }, 1000);

        return () => clearInterval(interval);
    } else if (order?.status === 'Delivered') {
        setProgress(100);
        setTimeLeft(0);
    }
  }, [order]);


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
  
  const isOrderActive = order.status !== 'Rejected' && order.status !== 'Cancelled';
  const currentStatusIndex = statusToIndex[order.status];

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
            <h1 className="font-headline text-3xl font-bold">Tracking Order #{params.orderId.substring(params.orderId.length - 6).toUpperCase()}</h1>
            <p className="text-muted-foreground mt-2">From "{order.shop}" to your doorstep.</p>
            <div className="mt-2">
                <Badge variant={isOrderActive ? 'default' : 'destructive'} className="text-base">{order.status}</Badge>
            </div>
        </div>

        {isOrderActive ? (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Delivery Progress</CardTitle>
                    <CardDescription>
                        {progress < 100 ? `Estimated arrival in ${Math.ceil(timeLeft / 60)} minutes.` : 'Your order has arrived!'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="relative h-4 mb-8">
                        <Progress value={progress} className="h-2 absolute top-1/2 -translate-y-1/2"/>
                        <Bike 
                            className="w-8 h-8 p-1.5 bg-primary text-primary-foreground rounded-full absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear"
                            style={{ left: `calc(${progress}% - 16px)` }}
                        />
                    </div>
                     <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Shop</span>
                        <span>Your Location</span>
                    </div>
                </CardContent>
            </Card>
        ) : (
             <Card className="shadow-lg bg-destructive/10 border-destructive">
                <CardHeader className="text-center">
                    <CardTitle className="text-destructive">Order {order.status}</CardTitle>
                    <CardDescription className="text-destructive/80">
                        This order has been {order.status.toLowerCase()}. If you have any questions, please contact support.
                    </CardDescription>
                </CardHeader>
            </Card>
        )}

        <div className="mt-8 space-y-8 relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-border -z-10"></div>

            {statusSteps.map((step, index) => {
                const isCompleted = currentStatusIndex > index + 1;
                const isCurrent = currentStatusIndex === index + 1;
                const StepIcon = step.icon;

                return (
                    <div key={step.status} className="flex items-start gap-6">
                        <div className={cn(
                            "flex items-center justify-center p-3 rounded-full z-10 transition-colors",
                                isCompleted ? 'bg-green-500 text-white ring-4 ring-green-500/20' : 
                                isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 
                                'bg-secondary text-muted-foreground'
                        )}>
                            {isCompleted ? <CheckCircle2 className="w-6 h-6"/> : <StepIcon className="w-6 h-6"/>}
                        </div>
                        <div>
                            <p className={cn("font-semibold text-lg", !(isCompleted || isCurrent) && "text-muted-foreground")}>{step.title}</p>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                    </div>
                )
            })}
        </div>

      </div>
    </div>
  );
}
