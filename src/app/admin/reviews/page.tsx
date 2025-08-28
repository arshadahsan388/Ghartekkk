

'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Star, MessageSquare, AlertTriangle, Eye, ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, update, query, equalTo, orderByChild } from 'firebase/database';

type Review = {
    id: string;
    customer: string;
    shopName: string;
    rating: number;
    complaintType?: string;
    complaintDetails?: string;
    aiSummary?: string;
    aiCategory?: string;
    aiUrgency?: string;
    date: string;
    userId: string;
    isRead: boolean;
};

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    
     useEffect(() => {
        // Mark all reviews as read when the component mounts
        const markReviewsAsRead = () => {
            const reviewsRef = ref(db, 'reviews');
            const unreadQuery = query(reviewsRef, orderByChild('isRead'), equalTo(false));

            onValue(unreadQuery, (snapshot) => {
                if (snapshot.exists()) {
                    const updates: { [key: string]: boolean } = {};
                    snapshot.forEach((childSnapshot) => {
                        updates[`${childSnapshot.key}/isRead`] = true;
                    });
                     if (Object.keys(updates).length > 0) {
                        update(ref(db, 'reviews'), updates);
                    }
                }
            }, { onlyOnce: true });
        };
        
        markReviewsAsRead();
    }, []);

    useEffect(() => {
        const reviewsRef = ref(db, 'reviews');
        const unsubscribe = onValue(reviewsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const reviewList: Review[] = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                    customer: data[key].userId.substring(0, 6), // Placeholder for customer name
                    date: new Date(data[key].date).toLocaleDateString()
                })).reverse();
                setReviews(reviewList);
            } else {
                setReviews([]);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    const handleRowClick = (review: Review) => {
        setSelectedReview(review);
        setIsDetailsOpen(true);
    }

    const getUrgencyIcon = (urgency?: string) => {
        switch (urgency) {
            case 'High': return <ArrowUp className="w-4 h-4 text-red-500" />;
            case 'Medium': return <ArrowRight className="w-4 h-4 text-yellow-500" />;
            case 'Low': return <ArrowDown className="w-4 h-4 text-green-500" />;
            default: return null;
        }
    };


  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <AdminHeader title="Reviews & Complaints" description="View and manage customer feedback." />
        <Card>
            <CardHeader>
                <CardTitle>All Feedback</CardTitle>
                <CardDescription>A list of all reviews and complaints submitted by users.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Shop</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Complaint</TableHead>
                            <TableHead>Urgency</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                     <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    <Loader2 className="animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : reviews.length > 0 ? (
                           reviews.map((review) => (
                             <TableRow key={review.id} onClick={() => handleRowClick(review)} className="cursor-pointer">
                                <TableCell>{review.date}</TableCell>
                                <TableCell>{review.shopName}</TableCell>
                                <TableCell>{review.customer}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-primary fill-primary" />
                                        {review.rating.toFixed(1)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {review.complaintType ? (
                                        <Badge variant="destructive">{review.complaintType}</Badge>
                                     ) : (
                                        <Badge variant="secondary">No Complaint</Badge>
                                     )}
                                </TableCell>
                                <TableCell>
                                    {review.aiUrgency && (
                                        <div className="flex items-center gap-2">
                                            {getUrgencyIcon(review.aiUrgency)}
                                            <span>{review.aiUrgency}</span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="outline" onClick={() => handleRowClick(review)}>
                                        <Eye className="w-4 h-4 mr-2"/>
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                           ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    No reviews found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Review Details</DialogTitle>
                    <DialogDescription>
                       Full details for the review on {selectedReview?.shopName}.
                    </DialogDescription>
                </DialogHeader>
                {selectedReview && (
                     <div className="grid gap-4 py-4">
                        <div className="space-y-4">
                             <div className="p-4 border rounded-lg space-y-2">
                                <h3 className="font-semibold flex items-center gap-2"><Star className="w-4 h-4 text-muted-foreground" /> Rating & General Info</h3>
                                 <p><strong>Customer ID:</strong> {selectedReview.userId}</p>
                                 <p><strong>Shop:</strong> {selectedReview.shopName}</p>
                                <p><strong>Rating:</strong> {selectedReview.rating} / 5</p>
                            </div>

                            {selectedReview.complaintType && (
                                <>
                                 <div className="p-4 border rounded-lg space-y-2">
                                    <h3 className="font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-muted-foreground" /> Customer Complaint</h3>
                                    <p><strong>Type:</strong> {selectedReview.complaintType}</p>
                                    <p><strong>Details:</strong> {selectedReview.complaintDetails}</p>
                                </div>
                                <div className="p-4 border rounded-lg space-y-2 bg-muted/40">
                                    <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-muted-foreground" /> AI Analysis</h3>
                                    <p><strong>Summary:</strong> {selectedReview.aiSummary}</p>
                                    <p><strong>Category:</strong> <Badge variant="secondary">{selectedReview.aiCategory}</Badge></p>
                                    <p><strong>Urgency:</strong> <Badge variant={selectedReview.aiUrgency === 'High' ? 'destructive' : 'default'}>{selectedReview.aiUrgency}</Badge></p>
                                </div>
                                </>
                            )}
                        </div>
                     </div>
                )}
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </main>
  );
}
