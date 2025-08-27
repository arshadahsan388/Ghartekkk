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
import { MoreHorizontal, ShieldCheck, Trash2, UserX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const users = [
  { id: 'USR001', name: 'Ali Khan', email: 'ali.khan@email.com', orders: 5, role: 'customer' },
  { id: 'USR002', name: 'Fatima Ahmed', email: 'fatima.ahmed@email.com', orders: 12, role: 'customer' },
  { id: 'USR003', name: 'Admin', email: 'admin@example.com', orders: 0, role: 'admin' },
  { id: 'USR004', name: 'Zainab Bibi', email: 'zainab.bibi@email.com', orders: 2, role: 'customer' },
  { id: 'USR005', name: 'Hassan Raza', email: 'hassan.raza@email.com', orders: 8, role: 'customer' },
];

export default function UserManagement() {
  return (
     <Card>
        <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage user accounts.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.orders}</TableCell>
                        <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role}
                            </Badge>
                        </TableCell>
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
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <UserX className="mr-2 h-4 w-4" />
                                Ban Account
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Account
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
     </Card>
  );
}
