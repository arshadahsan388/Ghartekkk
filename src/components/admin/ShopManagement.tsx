'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import AddShopDialog from './AddShopDialog';
import { useState } from 'react';

const shops = [
  { id: 'SHP001', name: 'KFC', cuisine: 'Fast Food', category: 'Fast Food' },
  { id: 'SHP002', name: 'Butt Karahi', cuisine: 'Pakistani', category: 'Pakistani' },
  { id: 'SHP003', name: 'Pizza Hut', cuisine: 'Pizza', category: 'Pizza' },
];

export default function ShopManagement() {
    const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Shop Management</CardTitle>
                <CardDescription>Add, edit, or remove shops from the platform.</CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Shop
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Shop ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Cuisine</TableHead>
                    <TableHead>Category</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {shops.map((shop) => (
                    <TableRow key={shop.id}>
                    <TableCell className="font-medium">{shop.id}</TableCell>
                    <TableCell>{shop.name}</TableCell>
                    <TableCell>{shop.cuisine}</TableCell>
                    <TableCell>{shop.category}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            <AddShopDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </CardContent>
    </Card>
  );
}
