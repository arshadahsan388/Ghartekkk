
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Package, Users, Star, Truck } from 'lucide-react';

type Order = {
    total: number;
    status: string;
    deliverySpeed?: string;
    reviewed?: boolean;
};

type User = {
    role: string;
};

const NORMAL_DELIVERY_FEE = 50;
const FAST_DELIVERY_FEE = 70;

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        pendingReviews: 0,
        deliveryPayments: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const ordersRef = ref(db, 'orders');
        const usersRef = ref(db, 'users');
        
        const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
            const ordersData = snapshot.val();
            if (ordersData) {
                const orders: Order[] = Object.values(ordersData);
                const deliveredOrders = orders.filter(o => o.status === 'Delivered');

                const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);
                const totalOrders = orders.length;
                
                const deliveryPayments = deliveredOrders.reduce((sum, order) => {
                    if (order.deliverySpeed === 'fast') {
                        return sum + FAST_DELIVERY_FEE;
                    }
                    return sum + NORMAL_DELIVERY_FEE;
                }, 0);

                const pendingReviews = orders.filter(o => o.status === 'Delivered' && !o.reviewed).length;
                
                setStats(prev => ({
                    ...prev,
                    totalRevenue,
                    totalOrders,
                    deliveryPayments,
                    pendingReviews
                }));
            } else {
                 setStats(prev => ({ ...prev, totalRevenue: 0, totalOrders: 0, deliveryPayments: 0, pendingReviews: 0 }));
            }
             setIsLoading(false);
        });

        const unsubscribeUsers = onValue(usersRef, (snapshot) => {
            const usersData = snapshot.val();
            if (usersData) {
                const users: User[] = Object.values(usersData);
                const totalCustomers = users.filter(u => u.role === 'customer').length;
                setStats(prev => ({ ...prev, totalCustomers }));
            } else {
                setStats(prev => ({ ...prev, totalCustomers: 0}));
            }
             setIsLoading(false);
        });

        return () => {
            unsubscribeOrders();
            unsubscribeUsers();
        };

    }, []);
    

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <AdminHeader title="Dashboard" description="An overview of your store's performance." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-8 w-3/4" /> : (
                    <div className="text-2xl font-bold">Rs. {stats.totalRevenue.toFixed(2)}</div>
                )}
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
             <CardContent>
                {isLoading ? <Skeleton className="h-8 w-3/4" /> : (
                    <div className="text-2xl font-bold">{stats.totalOrders}</div>
                )}
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
             <CardContent>
                {isLoading ? <Skeleton className="h-8 w-3/4" /> : (
                    <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                )}
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
             <CardContent>
                {isLoading ? <Skeleton className="h-8 w-3/4" /> : (
                    <div className="text-2xl font-bold">{stats.pendingReviews}</div>
                )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Payments</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
             <CardContent>
                {isLoading ? <Skeleton className="h-8 w-3/4" /> : (
                    <div className="text-2xl font-bold">Rs. {stats.deliveryPayments.toFixed(2)}</div>
                )}
            </CardContent>
          </Card>
        </div>
    </main>
  );
}
