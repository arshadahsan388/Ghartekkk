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
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type AddShopDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AddShopDialog({ open, onOpenChange }: AddShopDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Shop</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new shop to the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Shop Name</Label>
                <Input id="name" placeholder="e.g., Gourmet Grill" />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="cuisine">Cuisine / Type</Label>
                <Input id="cuisine" placeholder="e.g., BBQ, Pakistani, Groceries" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="e.g., 123 Food Street, Lahore" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                 <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="fast-food">Fast Food</SelectItem>
                        <SelectItem value="pakistani">Pakistani</SelectItem>
                        <SelectItem value="pizza">Pizza</SelectItem>
                        <SelectItem value="bbq">BBQ</SelectItem>
                        <SelectItem value="home-made">Home-made</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                        <SelectItem value="grocery">Grocery</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onOpenChange(false)}>Add Shop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
