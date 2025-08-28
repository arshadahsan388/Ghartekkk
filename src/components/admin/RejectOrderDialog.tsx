'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, update } from 'firebase/database';

type RejectOrderDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: any;
}

export default function RejectOrderDialog({ open, onOpenChange, order }: RejectOrderDialogProps) {
  const [reason, setReason] = useState('');
  
  const handleReject = () => {
    if (order?.id) {
        const orderRef = ref(db, `orders/${order.id}`);
        update(orderRef, { status: 'Rejected', rejectionReason: reason });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Order #{order?.id.substring(order.id.length-6).toUpperCase()}</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this order. This note will be sent to the customer.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="reason">Rejection Note</Label>
                <Textarea id="reason" placeholder="e.g., Items out of stock, shop is closed" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleReject}>Reject Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
