

'use client';

import { Button } from '@/components/ui/button';
import ShopList from '@/components/shops/ShopList';
import Link from 'next/link';
import { ArrowRight, Home as HomeIcon, Send, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AnnouncementBar from '@/components/layout/AnnouncementBar';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [budget, setBudget] = useState('');
  const [address, setAddress] = useState('');
  const [showExtraFields, setShowExtraFields] = useState(false);
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
      if (budget) {
        params.set('budget', budget);
      }
      if (address) {
        params.set('address', address);
      }
      router.push(`/custom-order?${params.toString()}`);
    }
  };

  const handleFocus = () => {
    if (user) {
      setShowExtraFields(true);
    }
  }

  return (
    <>
      <AnnouncementBar />
      <div className="relative py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent -z-10"></div>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-headline">
            Aap kia mangwana chahtay han?
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-muted-foreground">
            Grocery, dawai, ya aap ka pasandeeda khana. Bas humain batain aap ko
            kya chahiye.
          </p>
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-xl mx-auto space-y-4">
            <div className="w-full">
              <Input
                type="text"
                placeholder="e.g., 'A box of Panadol and some fresh bread'"
                className="h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleFocus}
              />
            </div>
            
            {showExtraFields && user && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left animate-in fade-in-0 duration-500">
                    <div className="space-y-2">
                        <Label htmlFor="budget" className="flex items-center gap-2"><Wallet className="w-4 h-4" /> Budget (Optional)</Label>
                        <Input 
                            id="budget"
                            type="number"
                            placeholder="e.g., 1000"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
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
                    <div className="space-y-2">
                        <Label>&nbsp;</Label>
                        <Button type="submit" size="lg" className="w-full h-10">
                            Submit
                            <Send className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {!user && showExtraFields && (
                <Button type="submit" size="lg" className="w-full">
                    Place an Order
                    <Send className="ml-2 h-4 w-4" />
                </Button>
            )}

          </form>
        </div>
      </div>
      <div id="shops" className="container mx-auto px-4 py-12">
        <ShopList />
      </div>
    </>
  );
}
