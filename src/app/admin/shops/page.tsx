
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
import { MoreHorizontal, PlusCircle, Star, Trash2, Edit } from 'lucide-react';
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
import { initialShops, initialCategories } from '@/lib/shops';

type Shop = typeof initialShops[0];

export default function ShopsPage() {
  const { toast } = useToast();
  const [shops, setShops] = useState(initialShops);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shopToEdit, setShopToEdit] = useState<Partial<Shop> | null>(null);

  const handleOpenDialog = (shop: Partial<Shop> | null = null) => {
    setShopToEdit(shop ? {...shop} : {});
    setIsDialogOpen(true);
  }

  const handleCloseDialog = () => {
    setShopToEdit(null);
    setIsDialogOpen(false);
  }
  
  const handleSaveShop = () => {
    if (!shopToEdit || !shopToEdit.name || !shopToEdit.category || !shopToEdit.address) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please fill out all required fields.',
        });
        return;
    }
    
    if (shopToEdit.id) { // Editing existing shop
        setShops(shops.map(s => s.id === shopToEdit.id ? shopToEdit as Shop : s));
        toast({
            title: 'Shop Updated',
            description: `${shopToEdit.name} has been updated.`,
        });
    } else { // Adding new shop
        const newShop: Shop = {
            id: shopToEdit.name!.toLowerCase().replace(/\s+/g, '-'),
            rating: 0,
            deliveryTime: 30,
            ...shopToEdit,
        } as Shop;
        setShops([...shops, newShop]);
        toast({
            title: 'Shop Added',
            description: `${newShop.name} has been added.`,
        });
    }
    handleCloseDialog();
  };


  const handleRemoveShop = (shopId: string) => {
    setShops(shops.filter((shop) => shop.id !== shopId));
    toast({
        variant: 'destructive',
        title: 'Shop Removed'
    })
  }
  
  const handleInputChange = (field: keyof Shop, value: string | number) => {
    if(shopToEdit) {
      setShopToEdit({...shopToEdit, [field]: value});
    }
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <AdminHeader
        title="Shops"
        description="Manage the shops available in your app."
        buttonText="Add New Shop"
        onButtonClick={() => handleOpenDialog()}
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
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(shop)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Shop</span>
                    </Button>
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
            <DialogTitle>{shopToEdit?.id ? 'Edit Shop' : 'Add New Shop'}</DialogTitle>
            <DialogDescription>
              {shopToEdit?.id ? 'Update the details for this shop.' : 'Enter the details for the new shop.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="shop-name">Shop Name</Label>
              <Input
                id="shop-name"
                value={shopToEdit?.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Best Burger Joint"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shop-category">Category</Label>
              <Select value={shopToEdit?.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
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
                value={shopToEdit?.cuisine || ''}
                onChange={(e) => handleInputChange('cuisine', e.target.value)}
                placeholder="e.g., Fast Food"
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="shop-address">Address</Label>
              <Input
                id="shop-address"
                value={shopToEdit?.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="e.g., Main Street, Vehari"
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="shop-rating">Rating</Label>
              <Input
                id="shop-rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={shopToEdit?.rating || 0}
                onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveShop}>{shopToEdit?.id ? 'Save Changes' : 'Add Shop'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
