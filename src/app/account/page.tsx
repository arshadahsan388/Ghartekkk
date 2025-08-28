

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Home, LifeBuoy, MessageSquare, Package, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
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
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="font-headline text-4xl sm:text-5xl font-bold">My Profile</h1>
      </div>
      <div className="max-w-xl mx-auto space-y-8">
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

         <Card>
          <CardHeader>
            <CardTitle>Account Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/orders" className="flex items-center p-3 -m-3 rounded-lg hover:bg-muted transition-colors">
                <Package className="w-5 h-5 mr-4 text-primary" />
                <span>My Orders</span>
            </Link>
            <Separator />
             <Link href="/support" className="flex items-center p-3 -m-3 rounded-lg hover:bg-muted transition-colors">
                <LifeBuoy className="w-5 h-5 mr-4 text-primary" />
                <span>Support Chat</span>
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
