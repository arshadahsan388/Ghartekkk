
'use client';

import { Button } from '@/components/ui/button';
import ShopList from '@/components/shops/ShopList';
import { ArrowRight, Home as HomeIcon, Store, ShoppingBag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const savedAddress = localStorage.getItem('deliveryAddress');
        if (savedAddress) {
          setAddress(savedAddress);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('description', searchQuery);
      if (shopName) {
        params.set('shopName', shopName);
      }
      if (address) {
        params.set('address', address);
      }
      router.push(`/custom-order?${params.toString()}`);
    }
  };

  return (
    <>
      <AnnouncementBar />
      <div className="py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-headline">
            Aap kia mangwana chahtay han?
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-muted-foreground">
            Grocery, dawai, ya aap ka pasandeeda khana. Bas humain batain aap ko
            kya chahiye.
          </p>
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto">
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2 text-left">
                        <Label htmlFor="searchQuery" className="flex items-center gap-2 text-lg font-semibold"><ShoppingBag className="w-5 h-5" /> What do you need?</Label>
                        <Textarea
                            id="searchQuery"
                            placeholder="e.g., 'A box of Panadol and some fresh bread'"
                            className="h-24 text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoComplete="off"
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="space-y-2">
                            <Label htmlFor="shopName" className="flex items-center gap-2"><Store className="w-4 h-4" /> Shop (Optional)</Label>
                            <Input 
                                id="shopName"
                                type="text"
                                placeholder="e.g., Al-Madina Restaurant"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="address" className="flex items-center gap-2"><HomeIcon className="w-4 h-4" /> Address</Label>
                            <Input 
                                id="address"
                                placeholder="e.g., Vehari"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" size="lg" className="w-full h-12 text-lg">
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
          </form>
        </div>
      </div>
      
      <div id="shops" className="container mx-auto px-4 py-8">
        <ShopList />
      </div>
    </>
  );
}
