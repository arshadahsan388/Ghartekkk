
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

const initialOrders = [
  {
    id: 'ORD001',
    customer: 'Ali Khan',
    shop: 'KFC',
    status: 'Pending',
    total: 550.0,
  },
  {
    id: 'ORD002',
    customer: 'Fatima Ahmed',
    shop: 'Butt Karahi',
    status: 'Confirmed',
    total: 1200.0,
  },
  {
    id: 'ORD003',
    customer: 'Zainab Bibi',
    shop: 'Pizza Hut',
    status: 'Delivered',
    total: 2500.0,
  },
  {
    id: 'ORD004',
    customer: 'Hassan Raza',
    shop: 'Haveli Restaurant',
    status: 'Rejected',
    total: 3500.0,
  },
];

export default function OrderManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orders, setOrders] = useState(initialOrders);

   useEffect(() => {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      localStorage.setItem('orders', JSON.stringify(initialOrders));
    }
  }, []);

  const handleRejectClick = (order: any) => {
    setSelectedOrder(order);
    setDialogOpen(true);
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
                <TableCell className="font-medium">{order.id}</TableCell>
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
                      <DropdownMenuItem>
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
