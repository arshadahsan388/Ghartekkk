
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AdminHeader from '@/components/admin/layout/AdminHeader';
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, update } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

type Order = {
    id: string;
    customer: string;
    shop: string;
    total: number;
    status: string;
    date: string;
}

export default function OrdersPage() {
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const ordersRef = ref(db, 'orders');
        const unsubscribe = onValue(ordersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const orderList: Order[] = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                    date: data[key].date ? new Date(data[key].date).toLocaleDateString() : 'N/A'
                })).reverse();
                setOrders(orderList);
            } else {
                setOrders([]);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        const orderRef = ref(db, `orders/${orderId}`);
        try {
            await update(orderRef, { status: newStatus });
            toast({
                title: 'Order Status Updated',
                description: `Order #${orderId.substring(orderId.length - 6).toUpperCase()} is now ${newStatus}.`,
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Failed to update status',
            });
        }
    }

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


  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <AdminHeader title="Orders" description="View and manage all customer orders." />
        <Card>
            <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>A list of all orders placed on your app.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Shop</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                     <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    <Loader2 className="animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : orders.length > 0 ? (
                           orders.map((order) => (
                             <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.id.substring(order.id.length - 6).toUpperCase()}</TableCell>
                                <TableCell>{order.date}</TableCell>
                                <TableCell>{order.customer}</TableCell>
                                <TableCell>{order.shop}</TableCell>
                                <TableCell>Rs. {order.total.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge className={getStatusBadge(order.status)}>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Pending')}>Pending</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Confirmed')}>Confirmed</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Out for Delivery')}>Out for Delivery</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Delivered')}>Delivered</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Rejected')} className="text-destructive">Rejected</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Cancelled')} className="text-destructive">Cancelled</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                           ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>
    </main>
  );
}
