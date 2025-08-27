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
import { MoreHorizontal, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import AddShopDialog from './AddShopDialog';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const shops = [
  { id: 'SHP001', name: 'Al-Madina Restaurant', cuisine: 'Pakistani', category: 'Pakistani', joined: '2023-01-15', address: 'Club Road, Vehari' },
  { id: 'SHP002', name: 'Pizza N Pizza', cuisine: 'Pizza', category: 'Pizza', joined: '2023-02-20', address: 'Stadium Road, Vehari' },
  { id: 'SHP003', name: 'Silver Spoon', cuisine: 'Fast Food', category: 'Fast Food', joined: '2023-03-10', address: 'Main Bazar, Vehari' },
  { id: 'SHP004', name: 'Naveed BBQ', cuisine: 'BBQ', category: 'BBQ', joined: '2023-04-01', address: 'Sharqi Colony, Vehari' },
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
                Add New Shop
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Shop ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Cuisine</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {shops.map((shop) => (
                    <TableRow key={shop.id}>
                        <TableCell className="font-medium">{shop.id}</TableCell>
                        <TableCell>{shop.name}</TableCell>
                        <TableCell>{shop.cuisine}</TableCell>
                        <TableCell>{shop.address}</TableCell>
                        <TableCell>{shop.joined}</TableCell>
                        <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Shop
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Shop
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            <AddShopDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </CardContent>
    </Card>
  );
}
