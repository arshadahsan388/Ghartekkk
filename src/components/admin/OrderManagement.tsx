
'use client';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCircle, MoreHorizontal, Pencil, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import RejectOrderDialog from './RejectOrderDialog';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, update } from "firebase/database";

type Order = {
  id: string;
  customer: string;
  shop: string;
  status: string;
  total: number;
};

export default function OrderManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

   useEffect(() => {
    const ordersRef = ref(db, 'orders');
    onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const ordersList = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).reverse(); // show latest orders first
            setOrders(ordersList);
        } else {
            setOrders([]);
        }
    });
  }, []);

  const handleRejectClick = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  }

  const handleStatusChange = (orderId: string, status: string) => {
    const orderRef = ref(db, `orders/${orderId}`);
    update(orderRef, { status });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Manage and track all customer orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Shop</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id.substring(order.id.length-6).toUpperCase()}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.shop}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      order.status === 'Pending' ? 'bg-yellow-500 hover:bg-yellow-600'
                      : order.status === 'Confirmed' ? 'bg-blue-500 hover:bg-blue-600'
                      : order.status === 'Delivered' ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>Rs. {order.total.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Confirmed')}>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Confirm Order
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRejectClick(order)}>
                        <XCircle className="mr-2 h-4 w-4 text-destructive" />
                        Reject Order
                      </DropdownMenuItem>
                       <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4 text-blue-500"/>
                        Edit Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <RejectOrderDialog open={dialogOpen} onOpenChange={setDialogOpen} order={selectedOrder} />
      </CardContent>
    </Card>
  );
}
