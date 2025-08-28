

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, CreditCard, DollarSign, Users, Megaphone } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get, child } from 'firebase/database';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import OrderManagement from '@/components/admin/OrderManagement';
import UserManagement from '@/components/admin/UserManagement';
import ShopManagement from '@/components/admin/ShopManagement';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) {
            router.push('/login');
            return;
        }

        const userRef = ref(db);
        const snapshot = await get(child(userRef, `users/${currentUser.uid}`));
        if (!snapshot.exists() || snapshot.val().role !== 'admin') {
            router.push('/login');
            return;
        }
        
        setUser(currentUser);
        const savedAnnouncement = localStorage.getItem('announcement') || 'Free delivery on all orders above Rs. 1000! Limited time offer.';
        setAnnouncement(savedAnnouncement);
    });

     return () => unsubscribe();
  }, [router]);

  const handleSaveAnnouncement = () => {
    localStorage.setItem('announcement', announcement);
    toast({
        title: 'Announcement Saved',
        description: 'The new announcement will be visible to all users.',
    })
  }

  if (!isMounted || !user) {
    return (
        <div className="space-y-8 p-8">
            <Skeleton className="h-10 w-1/4" />
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-5 w-3/4" />
                        </CardHeader>
                        <CardContent>
                             <Skeleton className="h-7 w-1/2 mb-2" />
                             <Skeleton className="h-4 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="space-y-8">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
       <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. 45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+235</div>
            <p className="text-xs text-muted-foreground">
              +18.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +20 since last hour
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5" /> Announcement Settings</CardTitle>
                <CardDescription>Update the announcement text shown at the top of the app.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    <Label htmlFor="announcement-text">Announcement Text</Label>
                    <Textarea 
                        id="announcement-text"
                        value={announcement}
                        onChange={(e) => setAnnouncement(e.target.value)}
                        placeholder="Enter your announcement..."
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveAnnouncement}>Save Announcement</Button>
            </CardFooter>
        </Card>
        <OrderManagement />
        <UserManagement />
        <ShopManagement />
      </div>
    </div>
  );
}
