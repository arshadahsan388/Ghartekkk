
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
import { MoreHorizontal, PlusCircle, Star, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const initialShops = [
  // Food Shops
  { id: 'al-madina-restaurant', name: 'Al-Madina Restaurant', cuisine: 'Pakistani', rating: 4.5, deliveryTime: 40, category: 'Food', address: 'Club Road, Vehari' },
  { id: 'pizza-n-pizza', name: 'Pizza N Pizza', cuisine: 'Pizza', rating: 4.2, deliveryTime: 35, category: 'Food', address: 'Stadium Road, Vehari' },
  { id: 'silver-spoon', name: 'Silver Spoon', cuisine: 'Fast Food', rating: 4.0, deliveryTime: 25, category: 'Food', address: 'Main Bazar, Vehari' },
  { id: 'naveed-bbq', name: 'Naveed BBQ', cuisine: 'BBQ', rating: 4.6, deliveryTime: 50, category: 'Food', address: 'Sharqi Colony, Vehari' },
  { id: 'kfc-vehari', name: 'KFC Vehari', cuisine: 'Fast Food', rating: 4.3, deliveryTime: 30, category: 'Food', address: 'Multan Road, Vehari' },
  // Grocery Shops
  { id: 'vehari-general-store', name: 'Vehari General Store', cuisine: 'Groceries', rating: 4.8, deliveryTime: 20, category: 'Grocery', address: 'Karkhana Bazar, Vehari' },
  { id: 'madina-cash-carry', name: 'Madina Cash & Carry', cuisine: 'Groceries', rating: 4.7, deliveryTime: 25, category: 'Grocery', address: 'Block 12, Vehari' },
  { id: 'punjab-mart', name: 'Punjab Mart', cuisine: 'Groceries', rating: 4.6, deliveryTime: 30, category: 'Grocery', address: 'Model Town, Vehari' },
  { id: 'csd-vehari', name: 'CSD Vehari', cuisine: 'Groceries', rating: 4.5, deliveryTime: 35, category: 'Grocery', address: 'Cantt Area, Vehari' },
  { id: 'imtiaz-super-market', name: 'Imtiaz Super Market', cuisine: 'Groceries', rating: 4.9, deliveryTime: 40, category: 'Grocery', address: 'D-Block, Vehari' },
  // Medical Shops
  { id: 'servaid-pharmacy', name: 'Servaid Pharmacy', cuisine: 'Pharmacy', rating: 4.8, deliveryTime: 15, category: 'Medical', address: 'Hospital Road, Vehari' },
  { id: 'fazal-din-pharma-plus', name: 'Fazal Din Pharma Plus', cuisine: 'Pharmacy', rating: 4.7, deliveryTime: 20, category: 'Medical', address: 'Main Bazar, Vehari' },
  { id: 'shaheen-chemist', name: 'Shaheen Chemist', cuisine: 'Pharmacy', rating: 4.6, deliveryTime: 25, category: 'Medical', address: 'Iqbal Town, Vehari' },
  { id: 'al-shifa-medical-store', name: 'Al-Shifa Medical Store', cuisine: 'Pharmacy', rating: 4.5, deliveryTime: 30, category: 'Medical', address: 'Sharqi Colony, Vehari' },
  { id: 'clinix-pharmacy', name: 'Clinix Pharmacy', cuisine: 'Pharmacy', rating: 4.9, deliveryTime: 15, category: 'Medical', address: 'College Road, Vehari' },
];

const initialCategories = ['Food', 'Grocery', 'Medical'];

type Shop = typeof initialShops[0];

export default function ShopsPage() {
  const { toast } = useToast();
  const [shops, setShops] = useState(initialShops);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newShop, setNewShop] = useState<Partial<Shop>>({});

  const handleAddShop = () => {
    // Basic validation
    if (newShop.name && newShop.category && newShop.address) {
      const fullNewShop = {
        id: newShop.name!.toLowerCase().replace(/\s+/g, '-'),
        rating: 0,
        deliveryTime: 30, // default
        ...newShop,
      } as Shop;

      setShops([...shops, fullNewShop]);
      setNewShop({});
      setIsDialogOpen(false);
      toast({
        title: 'Shop Added',
        description: `${fullNewShop.name} has been added.`,
      });
    } else {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please fill out all required fields.',
        });
    }
  };

  const handleRemoveShop = (shopId: string) => {
    setShops(shops.filter((shop) => shop.id !== shopId));
    toast({
        variant: 'destructive',
        title: 'Shop Removed'
    })
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <AdminHeader
        title="Shops"
        description="Manage the shops available in your app."
        buttonText="Add New Shop"
        onButtonClick={() => setIsDialogOpen(true)}
      />
      <Card>
        <CardHeader>
          <CardTitle>All Shops</CardTitle>
          <CardDescription>
            A list of all shops available to customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Cuisine/Type</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell className="font-medium">{shop.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{shop.category}</Badge>
                  </TableCell>
                  <TableCell>{shop.cuisine}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-primary" />
                    {shop.rating.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveShop(shop.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Remove Shop</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Shop</DialogTitle>
            <DialogDescription>
              Enter the details for the new shop.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="shop-name">Shop Name</Label>
              <Input
                id="shop-name"
                value={newShop.name || ''}
                onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                placeholder="e.g., Best Burger Joint"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shop-category">Category</Label>
              <Select onValueChange={(value) => setNewShop({ ...newShop, category: value })}>
                <SelectTrigger id="shop-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {initialCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div className="grid gap-2">
              <Label htmlFor="shop-cuisine">Cuisine / Type</Label>
              <Input
                id="shop-cuisine"
                value={newShop.cuisine || ''}
                onChange={(e) => setNewShop({ ...newShop, cuisine: e.target.value })}
                placeholder="e.g., Fast Food"
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="shop-address">Address</Label>
              <Input
                id="shop-address"
                value={newShop.address || ''}
                onChange={(e) => setNewShop({ ...newShop, address: e.target.value })}
                placeholder="e.g., Main Street, Vehari"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddShop}>Add Shop</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
