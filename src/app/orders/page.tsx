
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';

type Order = {
    id: string;
    shop: string;
    status: string;
    total: number;
    date: string; // Should ideally be part of the saved order data.
    description: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (!currentUser) {
            router.push('/login');
        } else {
            setUser(currentUser);
            // Fetch user-specific orders
            const ordersRef = ref(db, 'orders');
            const userOrdersQuery = query(ordersRef, orderByChild('userId'), equalTo(currentUser.uid));

            const unsubscribeOrders = onValue(userOrdersQuery, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const userOrdersList = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key],
                        // Assuming 'date' is not stored, we add a placeholder.
                        // Ideally, you should save the order date when creating it.
                        date: data[key].date || new Date().toLocaleDateString('en-CA'),
                    })).reverse();
                    setOrders(userOrdersList);
                } else {
                    setOrders([]);
                }
                setIsLoading(false);
            });

            return () => unsubscribeOrders();
        }
    });

    return () => unsubscribe();
  }, [router]);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'out for delivery':
        return 'bg-blue-500 hover:bg-blue-600';
       case 'confirmed':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'delivered':
        return 'bg-green-500 hover:bg-green-600';
      case 'rejected':
         return 'bg-red-500 hover:bg-red-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (!isMounted || !user || isLoading) {
     return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4 mb-12" />
          <Card className="shadow-xl">
            <CardContent className="p-0">
               <Table>
                <TableHeader>
                    <TableRow>
                      <TableHead><Skeleton className="h-4 w-[120px]" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-[80px]" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                      <TableHead className="text-right"><Skeleton className="h-4 w-[80px] ml-auto" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                             <TableCell className="text-right"><Skeleton className="h-8 w-[120px] ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
               </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
             <h1 className="font-headline text-4xl sm:text-5xl font-bold">My Orders</h1>
             <p className="text-muted-foreground mt-2">View your order history and track current deliveries.</p>
        </div>
        
        {orders.length > 0 ? (
             <Card className="shadow-xl">
                <CardContent className="p-0">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Shop/Description</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.shop === "Custom Order" ? order.description.substring(0, 30)+'...' : order.shop}</TableCell>
                            <TableCell>Rs. {order.total.toFixed(2)}</TableCell>
                            <TableCell>
                            <Badge className={getStatusBadge(order.status)}>
                                {order.status}
                            </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/track-order/${order.id}`}>
                                Track Order <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
        ) : (
             <Card className="shadow-xl text-center py-16">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-10 h-10 text-primary" />
                    </div>
                   <CardTitle className="mt-4">You have no orders yet.</CardTitle>
                   <CardDescription>
                     Looks like you haven't placed an order with us.
                   </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/">Start Shopping</Link>
                    </Button>
                </CardContent>
            </Card>
        )}

       
      </div>
    </div>
  );
}
