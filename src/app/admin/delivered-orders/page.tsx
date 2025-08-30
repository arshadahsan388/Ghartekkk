

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
import { MoreHorizontal, Loader2, FileText, User, MapPin, DollarSign, StickyNote, Rabbit, Turtle, Eye, Phone, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, update, remove } from 'firebase/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';

type Order = {
    id: string;
    displayId: string;
    customer: string;
    shop: string;
    total: number;
    status: string;
    date: string;
    description: string;
    address: string;
    phoneNumber?: string;
    budget?: number;
    note?: string;
    additionalNote?: string;
    deliverySpeed?: string;
};

export default function DeliveredOrdersPage() {
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const ordersRef = ref(db, 'orders');
        const unsubscribe = onValue(ordersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const orderList: Order[] = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                    date: data[key].date ? new Date(data[key].date).toLocaleDateString() : 'N/A'
                }))
                .reverse()
                .filter(order => order.status === 'Delivered');
                setOrders(orderList);
            } else {
                setOrders([]);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    const handleRowClick = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailsOpen(true);
    }
    
    const handleDeleteAll = async () => {
        setIsDeleting(true);
        try {
            const updates: { [key: string]: null } = {};
            orders.forEach(order => {
                updates[`/orders/${order.id}`] = null;
            });

            if (Object.keys(updates).length > 0) {
                 await update(ref(db), updates);
                 toast({
                    title: 'Orders Deleted',
                    description: 'All delivered orders have been removed.',
                });
            } else {
                 toast({
                    title: 'No Orders to Delete',
                    description: 'There are no delivered orders to remove.',
                });
            }
        } catch (error) {
            console.error("Failed to delete orders:", error);
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: 'Could not remove delivered orders. Please try again.',
            });
        } finally {
            setIsDeleting(false);
            setIsConfirmOpen(false);
        }
    }


    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
        case 'delivered':
            return 'bg-green-500 hover:bg-green-600';
        default:
            return 'bg-gray-500 hover:bg-gray-600';
        }
    };


  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="flex items-center justify-between">
            <AdminHeader title="Delivered Orders" description="View all successfully delivered orders." />
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={orders.length === 0 || isLoading}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete All
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all {orders.length} delivered orders from the database.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAll} disabled={isDeleting}>
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Yes, delete all
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>A list of all completed orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
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
                                <TableCell className="font-medium">{order.displayId}</TableCell>
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
                                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleRowClick(order)}}>
                                        <Eye className="mr-2 h-4 w-4"/>
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                           ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={8} className="text-center">
                                    No delivered orders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                 </Table>
                </div>
            </CardContent>
        </Card>
        
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <DialogDescription>
                        Full details for order {selectedOrder?.displayId}
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
                                {selectedOrder.phoneNumber && (
                                     <p className="flex items-start gap-2">
                                        <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
                                        <span><strong>Phone:</strong> {selectedOrder.phoneNumber}</span>
                                    </p>
                                )}
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
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </main>
  );
}
