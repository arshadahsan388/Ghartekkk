

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
import { Star, Trash2, Edit, Loader2 } from 'lucide-react';
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
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { db } from '@/lib/firebase';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { initialShops, initialCategories } from '@/lib/shops';
import { Textarea } from '@/components/ui/textarea';

type Shop = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  description: string;
  address: string;
  category: string;
};

export default function ShopsPage() {
  const { toast } = useToast();
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shopToEdit, setShopToEdit] = useState<Partial<Shop> | null>(null);

  // Function to seed initial data
  const seedDatabase = async () => {
    const shopsRef = ref(db, 'shops');
    const categoriesRef = ref(db, 'categories');
    await set(shopsRef, initialShops.reduce((acc, shop) => ({...acc, [shop.id]: shop }), {}));
    await set(categoriesRef, initialCategories);
    toast({ title: "Database Seeded", description: "Initial shops and categories have been loaded."});
  }

  useEffect(() => {
    const shopsRef = ref(db, 'shops');
    const categoriesRef = ref(db, 'categories');

    const unsubscribeShops = onValue(shopsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setShops(Object.values(data));
        } else {
            // If no data, seed it for the first time.
            seedDatabase();
        }
        setIsLoading(false);
    });

    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setCategories(data);
        }
    });

    return () => {
        unsubscribeShops();
        unsubscribeCategories();
    }
  }, []);


  const handleOpenDialog = (shop: Partial<Shop> | null = null) => {
    setShopToEdit(shop ? {...shop} : {});
    setIsDialogOpen(true);
  }

  const handleCloseDialog = () => {
    setShopToEdit(null);
    setIsDialogOpen(false);
  }
  
  const handleSaveShop = async () => {
    if (!shopToEdit || !shopToEdit.name || !shopToEdit.category || !shopToEdit.address) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please fill out all required fields.',
        });
        return;
    }
    
    try {
        if (shopToEdit.id) { // Editing existing shop
            const shopRef = ref(db, `shops/${shopToEdit.id}`);
            await set(shopRef, shopToEdit);
            toast({
                title: 'Shop Updated',
                description: `${shopToEdit.name} has been updated.`,
            });
        } else { // Adding new shop
            const shopsRef = ref(db, 'shops');
            const newShopRef = push(shopsRef);
            const newShopId = newShopRef.key!;
            const newShopData = {
                id: newShopId,
                rating: shopToEdit.rating || 0,
                description: shopToEdit.description || "No description provided.",
                ...shopToEdit,
            };
            await set(ref(db, `shops/${newShopId}`), newShopData);

            toast({
                title: 'Shop Added',
                description: `${newShopData.name} has been added.`,
            });
        }
        handleCloseDialog();
    } catch(error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Save Failed' });
    }
  };


  const handleRemoveShop = async (shopId: string) => {
    try {
        const shopRef = ref(db, `shops/${shopId}`);
        await remove(shopRef);
        toast({
            variant: 'destructive',
            title: 'Shop Removed'
        })
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Removal Failed' });
    }
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
           {isLoading ? (
                <Loader2 className="animate-spin mx-auto" />
           ) : (
                <div className="overflow-x-auto">
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
                </div>
           )}
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
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
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
                <Label htmlFor="shop-description">Description</Label>
                <Textarea
                    id="shop-description"
                    value={shopToEdit?.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="e.g., Known for our juicy, flame-grilled burgers."
                    rows={3}
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
