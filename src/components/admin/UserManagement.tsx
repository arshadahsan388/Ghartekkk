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
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const initialUsers = [
  { id: 'USR001', name: 'Ali Khan', email: 'ali.khan@email.com', orders: 5, role: 'customer' as const, isBanned: false },
  { id: 'USR002', name: 'Fatima Ahmed', email: 'fatima.ahmed@email.com', orders: 12, role: 'customer' as const, isBanned: false },
  { id: 'USR003', name: 'Admin', email: 'admin@example.com', orders: 0, role: 'admin' as const, isBanned: false },
  { id: 'USR004', name: 'Zainab Bibi', email: 'zainab.bibi@email.com', orders: 2, role: 'customer' as const, isBanned: true },
  { id: 'USR005', name: 'Hassan Raza', email: 'hassan.raza@email.com', orders: 8, role: 'customer' as const, isBanned: false },
];

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState(initialUsers);

  const handleMakeAdmin = (userId: string) => {
    setUsers(users.map(user => user.id === userId ? { ...user, role: 'admin' } : user));
    toast({ title: 'User Promoted', description: 'The user has been promoted to admin.' });
  };

  const handleToggleBan = (userId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const isBanned = !user.isBanned;
        toast({
          title: `User ${isBanned ? 'Banned' : 'Unbanned'}`,
          description: `The user has been successfully ${isBanned ? 'banned' : 'unbanned'}.`,
        });
        return { ...user, isBanned };
      }
      return user;
    }));
  };

  const handleDelete = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({ variant: 'destructive', title: 'User Deleted', description: 'The user has been permanently deleted.' });
  };


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
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                    <TableRow key={user.id} className={user.isBanned ? 'bg-destructive/10' : ''}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.orders}</TableCell>
                        <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role}
                            </Badge>
                        </TableCell>
                         <TableCell>
                            {user.isBanned && <Badge variant="destructive">Banned</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={user.email === 'admin@example.com'}>
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleMakeAdmin(user.id)} disabled={user.role === 'admin'}>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleBan(user.id)}>
                                <UserX className="mr-2 h-4 w-4" />
                                {user.isBanned ? 'Unban Account' : 'Ban Account'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user.id)}>
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
