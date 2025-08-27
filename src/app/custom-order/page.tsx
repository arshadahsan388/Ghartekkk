
'use client';
import { useState } from 'react';
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

export default function CustomOrderPage() {
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CustomOrderOutput | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await processCustomOrder({
        description,
        budget: Number(budget),
        address,
      });
      setResult(response);
      toast({
        title: 'Order Processed',
        description: 'Your custom order has been analyzed by our AI.',
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-4">
              <ShoppingCart className="w-8 h-8 text-primary" />
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
            <CardFooter className="flex justify-between items-center">
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
          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Order Analysis Complete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Order Summary</Label>
                <p className="text-sm">{result.summary}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">
                  Suggested Shop Type
                </Label>
                <p className="text-sm">
                  <Badge>{result.suggestedShop}</Badge>
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold">
                  Estimated Cost
                </Label>
                <p className="text-sm">Rs. {result.estimatedCost.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Feasibility</Label>
                <p
                  className={`text-sm font-bold ${
                    result.isFeasible ? 'text-green-600' : 'text-destructive'
                  }`}
                >
                  {result.isFeasible
                    ? 'Looks Good! Your budget is sufficient.'
                    : 'Budget may be tight. The estimated cost is higher than your budget.'}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Proceed to find a rider
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
