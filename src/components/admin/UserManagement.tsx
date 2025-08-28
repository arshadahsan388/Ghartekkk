
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
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, update, remove } from 'firebase/database';

type User = {
    id: string;
    name: string;
    email: string;
    orders: number;
    role: 'customer' | 'admin';
    isBanned: boolean;
};

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const usersList = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            setUsers(usersList);
        } else {
            setUsers([]);
        }
    });
  }, []);

  const handleMakeAdmin = (userId: string) => {
    const userRef = ref(db, `users/${userId}`);
    update(userRef, { role: 'admin' });
    toast({ title: 'User Promoted', description: 'The user has been promoted to admin.' });
  };

  const handleToggleBan = (userId: string, isBanned: boolean) => {
    const userRef = ref(db, `users/${userId}`);
    update(userRef, { isBanned: !isBanned });
    toast({
      title: `User ${!isBanned ? 'Banned' : 'Unbanned'}`,
      description: `The user has been successfully ${!isBanned ? 'banned' : 'unbanned'}.`,
    });
  };

  const handleDelete = (userId: string) => {
    const userRef = ref(db, `users/${userId}`);
    remove(userRef);
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
                        <TableCell className="font-medium">{user.id.substring(user.id.length-6).toUpperCase()}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleToggleBan(user.id, user.isBanned)}>
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
