
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, MapPin, Send, MessageSquareWarning, ShoppingBag, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { ref, push, set, get, update } from 'firebase/database';
import { processComplaint } from '@/ai/flows/process-complaint';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type Shop = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  address: string;
  category: string;
};

const NORMAL_DELIVERY_FEE = 50;
const FAST_DELIVERY_FEE = 70;

export default function ShopPage({ params }: { params: { shopId: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopData = searchParams.get('data');
  const shop: Shop | null = shopData ? JSON.parse(decodeURIComponent(shopData)) : null;

  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  const [orderDescription, setOrderDescription] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [deliverySpeed, setDeliverySpeed] = useState('normal');
  const [isOrdering, setIsOrdering] = useState(false);

  const [rating, setRating] = useState(0);
  const [complaintType, setComplaintType] = useState('');
  const [complaintDetails, setComplaintDetails] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);
  
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !shop) return;
    setIsOrdering(true);

    try {
        const deliveryFee = deliverySpeed === 'fast' ? FAST_DELIVERY_FEE : NORMAL_DELIVERY_FEE;
        const total = (Number(orderPrice) || 0) + deliveryFee;

        const ordersRef = ref(db, 'orders');
        const newOrderRef = push(ordersRef);
        const newOrder = {
            id: newOrderRef.key,
            customer: user.displayName || user.email?.split('@')[0], 
            shop: shop.name,
            shopId: shop.id,
            status: 'Pending',
            description: orderDescription,
            total: total,
            note: orderNote,
            deliverySpeed: deliverySpeed,
            email: user.email,
            address: localStorage.getItem('deliveryAddress') || 'Vehari, Pakistan',
            userId: user.uid,
            date: new Date().toISOString(),
        };
        await set(newOrderRef, newOrder);

        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if(snapshot.exists()) {
            const userData = snapshot.val();
            await update(userRef, { orders: (userData.orders || 0) + 1 });
        }

        toast({
            title: 'Order Placed!',
            description: `Your order from ${shop.name} has been placed.`,
        });
        setOrderDescription('');
        setOrderPrice('');
        setOrderNote('');
        setDeliverySpeed('normal');

    } catch(error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Order Failed',
            description: 'There was an issue placing your order.',
        });
    } finally {
        setIsOrdering(false);
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !shop) return;
    setIsSubmittingReview(true);

    try {
        const reviewsRef = ref(db, 'reviews');
        const newReviewRef = push(reviewsRef);

        const reviewData: any = {
            id: newReviewRef.key,
            shopId: shop.id,
            shopName: shop.name,
            userId: user.uid,
            rating: rating,
            date: new Date().toISOString(),
        }

        if (complaintType && complaintDetails) {
            reviewData.complaintType = complaintType;
            reviewData.complaintDetails = complaintDetails;
            
            // Process with AI
            const complaintResult = await processComplaint({
                shopName: shop.name,
                complaintDetails,
                complaintType
            });
            reviewData.aiSummary = complaintResult.summary;
            reviewData.aiCategory = complaintResult.category;
            reviewData.aiUrgency = complaintResult.urgency;
        }

        await set(newReviewRef, reviewData);
        
        toast({
            title: 'Feedback Submitted!',
            description: `Thank you for your feedback on ${shop.name}.`,
        });
        setRating(0);
        setComplaintType('');
        setComplaintDetails('');

    } catch (error) {
         console.error(error);
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'There was an issue submitting your feedback.',
        });
    } finally {
        setIsSubmittingReview(false);
    }

  }

  if (!isMounted || !user || !shop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
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
       <div className="grid md:grid-cols-2 gap-8">
        <div>
            <Card>
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="font-headline text-3xl">{shop.name}</CardTitle>
                    <div className="flex items-center gap-1 text-lg font-bold text-primary">
                        <Star className="w-5 h-5 text-primary fill-primary"/>
                        <span>{shop.rating.toFixed(1)}</span>
                    </div>
                </div>
                <CardDescription className="flex items-center gap-4 pt-2">
                <Badge variant="secondary" className="capitalize text-base">{shop.cuisine}</Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4"/> Delivery in {shop.deliveryTime} min
                </span>
                </CardDescription>
                <div className="flex items-start gap-2 text-sm text-muted-foreground pt-2">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="flex-1">{shop.address}</span>
                </div>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleOrderSubmit}>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShoppingBag className="w-6 h-6"/> Order from this Shop</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="order-description">What would you like to order?</Label>
                            <Textarea
                                id="order-description"
                                placeholder={`e.g., "One Zinger Burger with extra cheese and a large fries."`}
                                rows={3}
                                value={orderDescription}
                                onChange={(e) => setOrderDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="order-note">Additional Note (optional)</Label>
                            <Textarea
                                id="order-note"
                                placeholder="e.g., 'Please make it less spicy.'"
                                rows={2}
                                value={orderNote}
                                onChange={(e) => setOrderNote(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="order-price">Price / Budget (PKR)</Label>
                                <Input 
                                    id="order-price"
                                    type="number"
                                    placeholder="e.g., 500"
                                    value={orderPrice}
                                    onChange={(e) => setOrderPrice(e.target.value)}
                                    required
                                />
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
                                            <span className="text-xs text-muted-foreground">Rs. {NORMAL_DELIVERY_FEE} &bull; ~30 mins</span>
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
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isOrdering}>
                            {isOrdering ? 'Placing Order...' : 'Place Order'} <Send className="ml-2 w-4 h-4" />
                        </Button>
                    </CardFooter>
                </Card>
               </form>
            </CardContent>
            </Card>
        </div>
        <div>
           <form onSubmit={handleReviewSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageSquareWarning className="w-6 h-6"/> Leave a Review or Complaint</CardTitle>
                    <CardDescription>Your feedback helps us improve our service.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Your Rating</Label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                key={star}
                                className={`w-8 h-8 cursor-pointer transition-colors ${
                                    rating >= star
                                    ? 'text-primary fill-primary'
                                    : 'text-muted-foreground/50'
                                }`}
                                onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="complaint-type">Reason for Complaint (Optional)</Label>
                        <Select onValueChange={setComplaintType} value={complaintType}>
                            <SelectTrigger id="complaint-type">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Late Delivery">Late Delivery</SelectItem>
                                <SelectItem value="Bad Food">Bad Food</SelectItem>
                                <SelectItem value="Product Damage">Product Damage</SelectItem>
                                <SelectItem value="Rider/Staff Misbehavior">Rider/Staff Misbehavior</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="complaint-details">Details (Optional)</Label>
                         <Textarea
                            id="complaint-details"
                            placeholder="Please provide more details about your experience."
                            rows={3}
                            value={complaintDetails}
                            onChange={(e) => setComplaintDetails(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isSubmittingReview}>
                       {isSubmittingReview ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                </CardFooter>
            </Card>
           </form>
        </div>
       </div>
    </div>
  );
}
