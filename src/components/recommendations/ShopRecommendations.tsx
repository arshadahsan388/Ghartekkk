'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { recommendShops, type RecommendShopsOutput } from '@/ai/flows/recommend-shops';
import { Skeleton } from '@/components/ui/skeleton';
import { WandSparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ShopCard from '../shops/ShopCard';

export default function ShopRecommendations() {
  const [recommendations, setRecommendations] = useState<RecommendShopsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setRecommendations(null);
    try {
      const result = await recommendShops({
        location: 'Lahore, Pakistan',
        orderHistory: ['Bundu Khan', 'Salt n Pepper'],
      });
      setRecommendations(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get recommendations. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="mb-4 sm:mb-0">
          <h2 className="font-headline text-2xl font-bold">Recommended For You</h2>
          <p className="text-muted-foreground">AI-powered picks based on your taste and location.</p>
        </div>
        <Button onClick={handleGetRecommendations} disabled={isLoading}>
          <WandSparkles className="mr-2 h-4 w-4" />
          {isLoading ? 'Thinking...' : 'Get New Recommendations'}
        </Button>
      </div>
      
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      )}

      {recommendations && (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle>Our Suggestions</CardTitle>
                <CardDescription>{recommendations.reason}</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {recommendations.recommendedShops.map((shopName, index) => (
                        <ShopCard
                            key={index}
                            name={shopName}
                            cuisine="Varies"
                            rating={4.5 + (index * 0.1)}
                            imageUrl={`https://picsum.photos/400/250?random=${index}`}
                            deliveryTime={25 + (index * 5)}
                            data-ai-hint="restaurant food"
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
      )}

      {!isLoading && !recommendations && (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Click the button to discover new places to eat!</p>
        </div>
      )}
    </section>
  );
}
