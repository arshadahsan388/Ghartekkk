

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
import { WandSparkles, Send, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  processCustomOrder,
  type CustomOrderOutput,
} from '@/ai/flows/process-custom-order';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useSearchParams, useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { ref, push, get, child, update, set } from "firebase/database";
import { onAuthStateChanged } from 'firebase/auth';

export default function CustomOrderPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [address, setAddress] = useState('');
  const [additionalNote, setAdditionalNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CustomOrderOutput | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any | null>(null);

   useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        const savedAddress = localStorage.getItem('deliveryAddress');
        if (savedAddress) {
          setAddress(savedAddress);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);
  
  useEffect(() => {
    const descriptionFromParams = searchParams.get('description');
    const budgetFromParams = searchParams.get('budget');
    const addressFromParams = searchParams.get('address');
    
    if (descriptionFromParams) {
        setDescription(descriptionFromParams);
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

  const handleOrderSuccess = async (response: CustomOrderOutput) => {
    if (!user) return;

    // Save order
    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);
    const newOrder = {
        id: newOrderRef.key,
        customer: user.displayName || user.email.split('@')[0], 
        shop: "Custom Order",
        status: 'Pending',
        total: response.estimatedCost,
        email: user.email,
        description: description,
        address: address,
        budget: Number(budget),
        additionalNote: additionalNote,
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

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
      const response = await processCustomOrder({
        description,
        budget: Number(budget),
        address,
        additionalNote,
      });
      setResult(response);
      await handleOrderSuccess(response);
      
      toast({
        title: 'Order Processed',
        description: 'Your custom order has been analyzed by our AI and saved.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process your order. Please try again.',
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
        <Card className="shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                 <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="font-headline text-2xl">
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
                />
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
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/50 p-4 rounded-b-lg">
                <div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><WandSparkles className="w-3 h-3" /> Powered by AI</span>
                </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Submit Order'}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>

        {isLoading && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Analyzing Your Order...</CardTitle>
              <CardDescription>
                Our AI is on the case! Please wait a moment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="mt-8 border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5 rounded-t-lg">
              <CardTitle>Order Analysis Complete</CardTitle>
               <CardDescription>Here's what our AI thinks about your order.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">Order Summary</Label>
                <p className="text-base">{result.summary}</p>
              </div>
               <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                 <div>
                    <Label className="text-sm font-semibold text-muted-foreground">
                      Suggested Shop
                    </Label>
                    <div className="text-base">
                      <Badge variant="secondary" className="text-base">{result.suggestedShop}</Badge>
                    </div>
                  </div>
                   <div>
                    <Label className="text-sm font-semibold text-muted-foreground">
                      Estimated Cost
                    </Label>
                    <p className="text-base font-bold">Rs. {result.estimatedCost.toFixed(2)}</p>
                  </div>
               </div>
              <div className={`p-4 rounded-md ${
                    result.isFeasible ? 'bg-green-100 dark:bg-green-900/20 border-l-4 border-green-500' : 'bg-destructive/10 border-l-4 border-destructive'
                  }`}>
                <Label className="text-sm font-semibold">Feasibility</Label>
                <p
                  className={`text-sm font-medium ${
                    result.isFeasible ? 'text-green-700 dark:text-green-300' : 'text-destructive'
                  }`}
                >
                  {result.isFeasible
                    ? 'Looks Good! Your budget is sufficient.'
                    : 'Budget may be tight. The estimated cost is higher than your budget.'}
                </p>
              </div>
            </CardContent>
             <CardFooter>
              <Button className="w-full" size="lg" onClick={() => router.push('/orders')}>
                Track Your Order
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
