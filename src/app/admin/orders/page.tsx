
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
import { MoreHorizontal, Loader2, FileText, User, MapPin, DollarSign, StickyNote, Rabbit, Turtle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, update } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type Order = {
    id: string;
    customer: string;
    shop: string;
    total: number;
    status: string;
    date: string;
    description: string;
    address: string;
    budget?: number;
    note?: string;
    additionalNote?: string;
    deliverySpeed?: string;
};

export default function OrdersPage() {
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
    
    const handleRowClick = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailsOpen(true);
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
                <CardDescription>A list of all orders placed on your app. Click a row to see details.</CardDescription>
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
                            <TableHead>Delivery</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                     <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">
                                    <Loader2 className="animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : orders.length > 0 ? (
                           orders.map((order) => (
                             <TableRow key={order.id} onClick={() => handleRowClick(order)} className="cursor-pointer">
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
                                    {order.deliverySpeed && (
                                        <Badge variant={order.deliverySpeed === 'fast' ? 'default' : 'secondary'} className="capitalize">
                                            {order.deliverySpeed === 'fast' ? <Rabbit className="w-3 h-3 mr-1" /> : <Turtle className="w-3 h-3 mr-1" />}
                                            {order.deliverySpeed}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleStatusChange(order.id, 'Pending')}}>Pending</DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleStatusChange(order.id, 'Confirmed')}}>Confirmed</DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleStatusChange(order.id, 'Out for Delivery')}}>Out for Delivery</DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleStatusChange(order.id, 'Delivered')}}>Delivered</DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleStatusChange(order.id, 'Rejected')}} className="text-destructive">Rejected</DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleStatusChange(order.id, 'Cancelled')}} className="text-destructive">Cancelled</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                           ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={8} className="text-center">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>
        
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <DialogDescription>
                        Full details for order #{selectedOrder?.id.substring(selectedOrder.id.length - 6).toUpperCase()}
                    </DialogDescription>
                </DialogHeader>
                {selectedOrder && (
                     <div className="grid gap-4 py-4">
                        <div className="space-y-4">
                            <div className="p-4 border rounded-lg space-y-2">
                                <h3 className="font-semibold flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /> Customer Details</h3>
                                <p><strong>Name:</strong> {selectedOrder.customer}</p>
                                <p className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                                    <span><strong>Address:</strong> {selectedOrder.address}</span>
                                </p>
                            </div>

                             <div className="p-4 border rounded-lg space-y-2">
                                <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" /> Order Details</h3>
                                 <p><strong>Shop:</strong> {selectedOrder.shop}</p>
                                <p><strong>Description:</strong> {selectedOrder.description}</p>
                                {(selectedOrder.note || selectedOrder.additionalNote) && (
                                    <p className="flex items-start gap-2 pt-2 border-t">
                                        <StickyNote className="w-4 h-4 mt-1 text-muted-foreground" />
                                        <span><strong>Notes:</strong> {selectedOrder.note || selectedOrder.additionalNote}</span>
                                    </p>
                                )}
                            </div>

                             <div className="p-4 border rounded-lg space-y-2">
                                <h3 className="font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4 text-muted-foreground" /> Financials & Delivery</h3>
                                {selectedOrder.budget && <p><strong>Budget:</strong> Rs. {selectedOrder.budget}</p>}
                                <p><strong>Total:</strong> Rs. {selectedOrder.total.toFixed(2)}</p>
                                {selectedOrder.deliverySpeed && (
                                    <p className="flex items-center gap-2">
                                        {selectedOrder.deliverySpeed === 'fast' 
                                            ? <Rabbit className="w-4 h-4 text-muted-foreground" /> 
                                            : <Turtle className="w-4 h-4 text-muted-foreground" />}
                                        <span>
                                            <strong>Delivery:</strong> {selectedOrder.deliverySpeed.charAt(0).toUpperCase() + selectedOrder.deliverySpeed.slice(1)}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>
                     </div>
                )}
            </DialogContent>
        </Dialog>
    </main>
  );
}
