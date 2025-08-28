
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Loader2 } from 'lucide-react';
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
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { ref, onValue, set } from 'firebase/database';

export default function ShopCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const categoriesRef = ref(db, 'categories');
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
        const data = snapshot.val();
        if(data) {
            setCategories(data);
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const handleAddCategory = async () => {
    if (newCategory && !categories.includes(newCategory)) {
        const updatedCategories = [...categories, newCategory];
        try {
            await set(ref(db, 'categories'), updatedCategories);
            setNewCategory('');
            setIsDialogOpen(false);
            toast({
                title: 'Category Added',
                description: `"${newCategory}" has been added.`,
            });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error adding category' });
        }
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Category',
        description: 'Category name cannot be empty or a duplicate.',
      });
    }
  };

  const handleRemoveCategory = async (categoryToRemove: string) => {
    const updatedCategories = categories.filter((cat) => cat !== categoryToRemove);
    try {
        await set(ref(db, 'categories'), updatedCategories);
        toast({
            variant: 'destructive',
            title: 'Category Removed',
            description: `"${categoryToRemove}" has been removed.`,
        });
    } catch(error) {
         toast({ variant: 'destructive', title: 'Error removing category' });
    }
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <AdminHeader
        title="Shop Categories"
        description="Manage the categories for shops displayed in the app."
        buttonText="Add New Category"
        onButtonClick={() => setIsDialogOpen(true)}
      />
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            This list determines the sections on the home page.
          </CardDescription>
        </CardHeader>
        <CardContent>
         {isLoading ? (
            <Loader2 className="animate-spin mx-auto" />
         ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category}>
                  <TableCell className="font-medium">{category}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCategory(category)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
         )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Enter the name for the new shop category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g., Electronics"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
