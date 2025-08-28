
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home, LogOut, LifeBuoy, Package, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function AccountPage() {
  const [address, setAddress] = useState('');
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        const savedAddress = localStorage.getItem('deliveryAddress') || '';
        setAddress(savedAddress);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = () => {
    localStorage.setItem('deliveryAddress', address);
    toast({
      title: 'Address Saved',
      description: 'Your delivery address has been updated.',
    });
  }

   const handleLogout = async () => {
    try {
        await signOut(auth);
        toast({
            title: 'Logged Out',
            description: 'You have been successfully logged out.',
        });
        router.push('/login');
        router.refresh();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Logout Failed',
            description: 'An error occurred while logging out.',
        });
    }
  };

  if (!isMounted || !user) {
    return (
        <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-12 w-1/4 mb-12" />
            <div className="max-w-xl mx-auto space-y-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter>
                         <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="font-headline text-4xl sm:text-5xl font-bold">My Profile</h1>
         <p className="text-muted-foreground mt-2">Manage your account settings and view your activity.</p>
      </div>
      <div className="max-w-xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-6 h-6" />
              Account Information
            </CardTitle>
             <CardDescription>
                {user.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Link href="/orders" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <span>My Orders</span>
                </Link>
                <Link href="/support" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
                    <LifeBuoy className="w-5 h-5 text-muted-foreground" />
                    <span>Support Chat</span>
                </Link>
              </div>
          </CardContent>
          <Separator />
          <CardFooter className="p-4">
             <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-6 h-6" />
              Delivery Address
            </CardTitle>
            <CardDescription>Manage your saved delivery address.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input 
                  id="address" 
                  placeholder="e.g., House 123, Street 4, Vehari" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave}>Save Address</Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
