

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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Star, MessageSquareWarning } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { ref, push, set, update } from 'firebase/database';
import type { User } from 'firebase/auth';

type Shop = {
  id: string;
  name: string;
};

type ReviewPromptProps = {
  shop: Shop;
  user: User;
  orderId: string | null;
  disabled: boolean;
  onSubmitted?: () => void;
};

export default function ReviewPrompt({
  shop,
  user,
  orderId,
  disabled,
  onSubmitted,
}: ReviewPromptProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [complaintType, setComplaintType] = useState('');
  const [complaintDetails, setComplaintDetails] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !shop || !orderId) return;
    setIsSubmittingReview(true);

    try {
      const reviewsRef = ref(db, 'reviews');
      const newReviewRef = push(reviewsRef);

      const reviewData: any = {
        id: newReviewRef.key,
        shopId: shop.id,
        shopName: shop.name,
        userId: user.uid,
        orderId: orderId,
        rating: rating,
        date: new Date().toISOString(),
        isRead: false,
      };

      if (complaintType && complaintDetails) {
        reviewData.complaintType = complaintType;
        reviewData.complaintDetails = complaintDetails;
      }

      await set(newReviewRef, reviewData);
      
      // Mark the order as reviewed
      const orderRef = ref(db, `orders/${orderId}`);
      await update(orderRef, { reviewed: true });

      toast({
        title: 'Feedback Submitted!',
        description: `Thank you for your feedback on ${shop.name}.`,
      });
      setRating(0);
      setComplaintType('');
      setComplaintDetails('');
      if(onSubmitted) onSubmitted();

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
  };

  return (
    <form onSubmit={handleReviewSubmit}>
      <Card className={disabled ? 'bg-muted/50' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6" /> Leave a Review or Complaint
          </CardTitle>
          <CardDescription>
            {disabled 
              ? 'You must have a delivered order from this shop to leave a review.'
              : 'Your feedback helps us improve our service.'
            }
          </CardDescription>
        </CardHeader>
        <fieldset disabled={disabled}>
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
              <Label htmlFor="complaint-type">
                Reason for Complaint (Optional)
              </Label>
              <Select onValueChange={setComplaintType} value={complaintType}>
                <SelectTrigger id="complaint-type">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Late Delivery">Late Delivery</SelectItem>
                  <SelectItem value="Bad Food">Bad Food</SelectItem>
                  <SelectItem value="Product Damage">Product Damage</SelectItem>
                  <SelectItem value="Rider/Staff Misbehavior">
                    Rider/Staff Misbehavior
                  </SelectItem>
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
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmittingReview || disabled || rating === 0}
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </CardFooter>
        </fieldset>
      </Card>
    </form>
  );
}
