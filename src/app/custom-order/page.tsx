

'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Send, ShoppingCart, Store, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams, useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { ref, push, get, update, set } from "firebase/database";
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getNextOrderId } from '@/lib/order-helpers';

const NORMAL_DELIVERY_FEE = 50;
const FAST_DELIVERY_FEE = 70;


export default function CustomOrderPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [shopName, setShopName] = useState('');
  const [budget, setBudget] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [additionalNote, setAdditionalNote] = useState('');
  const [deliverySpeed, setDeliverySpeed] = useState('normal');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

   useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        // Pre-fill address and phone number
        const savedAddress = localStorage.getItem('deliveryAddress');
        if (savedAddress) {
          setAddress(savedAddress);
        }
        const userRef = ref(db, `users/${currentUser.uid}`);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                if(userData.phoneNumber) {
                    setPhoneNumber(userData.phoneNumber);
                }
            }
        });
      }
    });

    return () => unsubscribe();
  }, [router]);
  
  useEffect(() => {
    const descriptionFromParams = searchParams.get('description');
    const shopNameFromParams = searchParams.get('shopName');
    const budgetFromParams = searchParams.get('budget');
    const addressFromParams = searchParams.get('address');
    
    if (descriptionFromParams) {
        setDescription(descriptionFromParams);
    }
    if (shopNameFromParams) {
      setShopName(shopNameFromParams);
    }
    if (budgetFromParams) {
        setBudget(budgetFromParams);
    }
     if (addressFromParams) {
      setAddress(addressFromParams);
    } else {
      const savedAddress = localStorage.getItem('deliveryAddress');
      if (savedAddress) {
        setAddress(savedAddress);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Not Logged In',
            description: 'You must be logged in to place an order.',
        });
        setIsLoading(false);
        return;
    }

    try {
      // Generate new order ID
      const displayId = await getNextOrderId();

      // Save order
      const ordersRef = ref(db, 'orders');
      const newOrderRef = push(ordersRef); 

      const deliveryFee = deliverySpeed === 'fast' ? FAST_DELIVERY_FEE : NORMAL_DELIVERY_FEE;
      const total = Number(budget) + deliveryFee; // Total is now budget + delivery

      const newOrder = {
          id: newOrderRef.key,
          displayId: displayId,
          customer: user.displayName || user.email?.split('@')[0], 
          shop: shopName || "Custom Order",
          status: 'Pending',
          total: total,
          email: user.email,
          description: description,
          address: address,
          phoneNumber: phoneNumber,
          budget: Number(budget),
          additionalNote: additionalNote,
          deliverySpeed: deliverySpeed,
          userId: user.uid,
          isRead: false,
          date: new Date().toISOString(),
      };
      await set(newOrderRef, newOrder);

      // Update user's order count
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if(snapshot.exists()) {
          const userData = snapshot.val();
          await update(userRef, { orders: (userData.orders || 0) + 1 });
      }

      // Save address in local storage for convenience
      localStorage.setItem('deliveryAddress', address);
      
      toast({
        title: 'Order Placed!',
        description: 'Your custom order has been submitted and is now pending.',
      });
      router.push(`/orders`);

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to place your order. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted || !user) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                 <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="font-headline text-xl sm:text-2xl">
                  Place a Custom Order
                </CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Describe it here, and
                  we'll get it for you.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">What do you need?</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., 'A box of Panadol, 2 loaves of bread, and a 1.5L bottle of Coke'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{description.length} / 500</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopName">Specific Shop Name (Optional)</Label>
                 <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="shopName"
                      placeholder="e.g., Al-Madina Restaurant"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="pl-9"
                    />
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="additionalNote">Additional Note (Optional)</Label>
                <Textarea
                  id="additionalNote"
                  placeholder="e.g., 'Please call upon arrival' or 'No spicy food'"
                  value={additionalNote}
                  onChange={(e) => setAdditionalNote(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Your Budget (PKR)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g., 1000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Input
                    id="address"
                    placeholder="e.g., House 123, Street 4, Vehari"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="phoneNumber"
                            type="tel"
                            placeholder="e.g., 0300-1234567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="pl-9"
                            maxLength={11}
                        />
                    </div>
                </div>
               <div className="space-y-2">
                <Label>Delivery Speed</Label>
                <RadioGroup
                    defaultValue="normal"
                    className="flex flex-col space-y-2 pt-1"
                    value={deliverySpeed}
                    onValueChange={setDeliverySpeed}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="normal" id="normal" />
                        <Label htmlFor="normal" className="flex flex-col gap-0.5 w-full cursor-pointer">
                            <span>Normal</span>
                            <span className="text-xs text-muted-foreground">
                                Rs. {NORMAL_DELIVERY_FEE} &bull; ~40 mins
                            </span>
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fast" id="fast" />
                        <Label htmlFor="fast" className="flex flex-col gap-0.5 w-full cursor-pointer">
                            <span>Fast</span>
                            <span className="text-xs text-muted-foreground">Rs. {FAST_DELIVERY_FEE} &bull; ~20 mins</span>
                        </Label>
                    </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 rounded-b-lg">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Placing Order...' : 'Submit Order'}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
