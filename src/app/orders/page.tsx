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
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const orders = [
  {
    id: '12345',
    shop: 'Lahori Spice',
    status: 'Out for Delivery',
    total: 750.0,
    date: '2024-07-28',
  },
  {
    id: '12344',
    shop: 'KFC',
    status: 'Delivered',
    total: 550.0,
    date: '2024-07-27',
  },
  {
    id: '12343',
    shop: 'Butt Karahi',
    status: 'Delivered',
    total: 1200.0,
    date: '2024-07-25',
  },
  {
    id: '12342',
    shop: 'Custom Order',
    status: 'Cancelled',
    total: 900.0,
    date: '2024-07-24',
  },
];

export default function OrdersPage() {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'out for delivery':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'delivered':
        return 'bg-green-500 hover:bg-green-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-yellow-500 hover:bg-yellow-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl border-t-4 border-primary">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">My Orders</CardTitle>
            <CardDescription>
              View your order history and track current deliveries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.shop}</TableCell>
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
      </div>
    </div>
  );
}
