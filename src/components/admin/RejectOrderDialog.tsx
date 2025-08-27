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

type RejectOrderDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: any;
}

export default function RejectOrderDialog({ open, onOpenChange, order }: RejectOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Order #{order?.id}</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this order. This note will be sent to the customer.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="reason">Rejection Note</Label>
                <Textarea id="reason" placeholder="e.g., Items out of stock, shop is closed" />
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => onOpenChange(false)}>Reject Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
