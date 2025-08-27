'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderManagement from '@/components/admin/OrderManagement';
import UserManagement from '@/components/admin/UserManagement';
import ShopManagement from '@/components/admin/ShopManagement';
import { Package, ShoppingBag, Users } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      router.push('/login');
    }
  }, [router]);

  if (!isMounted) {
    return null; 
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="font-headline text-3xl font-bold mb-8">Admin Dashboard</h1>
      <Tabs defaultValue="orders">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Order Management
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="shops">
            <Package className="mr-2 h-4 w-4" />
            Shop Management
          </TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        <TabsContent value="shops">
          <ShopManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
