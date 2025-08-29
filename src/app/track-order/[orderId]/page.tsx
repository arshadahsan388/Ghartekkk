

'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, CheckCircle2, Home, Loader2, ServerCrash, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { Progress } from '@/components/ui/progress';

type Order = {
  id: string;
  displayId: string;
  shop: string;
  status: 'Pending' | 'Confirmed' | 'Delivered' | 'Rejected' | 'Cancelled';
  date: string; // ISO String
  deliverySpeed?: 'normal' | 'fast';
};

const statusSteps = [
  { status: 'Confirmed', icon: Phone, title: 'Order Confirmed', description: 'The shop is preparing your order.' },
  { status: 'Delivered', icon: Home, title: 'Delivered', description: 'Your order has arrived. Enjoy!' },
];

const statusToIndex: Record<Order['status'], number> = {
  Pending: 0,
  Confirmed: 1,
  Delivered: 2,
  Rejected: -1,
  Cancelled: -1,
};

export default function TrackOrderPage() {
  const params = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const orderId = params.orderId;
    if (!orderId) {
      setError("No order ID provided.");
      setIsLoading(false);
      return;
    }
    
    const orderRef = ref(db, `orders/${orderId}`);
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
    if (order?.status === 'Confirmed' && order.date) {
      const deliveryDuration = order.deliverySpeed === 'fast' ? 20 * 60 : 40 * 60; // in seconds
      const startTime = new Date(order.date).getTime();

      const interval = setInterval(() => {
        const now = new Date().getTime();
        const elapsedTime = (now - startTime) / 1000; // in seconds
        
        if (elapsedTime >= deliveryDuration) {
          setProgress(100);
          setTimeLeft(0);
          clearInterval(interval);
        } else {
          const currentProgress = (elapsedTime / deliveryDuration) * 100;
          setProgress(currentProgress);
          setTimeLeft(deliveryDuration - elapsedTime);
        }
      }, 1000);

      return () => clearInterval(interval);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };


  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
            <h1 className="font-headline text-3xl font-bold">Tracking Order {order.displayId}</h1>
            <p className="text-muted-foreground mt-2">From "{order.shop}" to your doorstep.</p>
            <div className="mt-2">
                <Badge variant={isOrderActive ? 'default' : 'destructive'} className="text-base">{order.status}</Badge>
            </div>
        </div>

        {order.status === 'Confirmed' && (
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Timer />
                        Estimated Arrival
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground text-center">
                       {timeLeft > 0 ? `${formatTime(timeLeft)} remaining` : "Arriving soon!"}
                    </p>
                </CardContent>
            </Card>
        )}

        {!isOrderActive && (
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
