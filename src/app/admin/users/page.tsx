

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
  import { MoreHorizontal, Send, Loader2 } from 'lucide-react';
  import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
  import { useEffect, useState } from 'react';
  import { db } from '@/lib/firebase';
  import { ref, onValue, set, update } from 'firebase/database';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
  import { Label } from '@/components/ui/label';
  import { Textarea } from '@/components/ui/textarea';
  import { useToast } from '@/hooks/use-toast';
  
type User = {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'customer';
    orders: number;
    isBanned: boolean;
};


export default function UsersPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [isSendingAlert, setIsSendingAlert] = useState(false);

    useEffect(() => {
        const usersRef = ref(db, 'users');
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const userList = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                setUsers(userList);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleOpenAlert = (user: User) => {
        setSelectedUser(user);
        setIsAlertDialogOpen(true);
    }

    const handleCloseAlert = () => {
        setIsAlertDialogOpen(false);
        setSelectedUser(null);
        setAlertMessage('');
    }

    const handleSendAlert = async () => {
        if (!selectedUser || !alertMessage) return;
        setIsSendingAlert(true);
        try {
            const userAlertRef = ref(db, `users/${selectedUser.id}/alert`);
            await set(userAlertRef, alertMessage);
            toast({
                title: 'Alert Sent!',
                description: `An alert has been sent to ${selectedUser.name}.`,
            });
            handleCloseAlert();
        } catch (error) {
            console.error("Error sending alert:", error);
            toast({
                variant: 'destructive',
                title: 'Failed to send alert',
            });
        } finally {
            setIsSendingAlert(false);
        }
    };
    
    const handleToggleBan = async (user: User) => {
        const userRef = ref(db, `users/${user.id}`);
        try {
            await update(userRef, { isBanned: !user.isBanned });
            toast({
                title: `User ${user.isBanned ? 'Unbanned' : 'Banned'}`,
                description: `${user.name} has been successfully ${user.isBanned ? 'unbanned' : 'banned'}.`,
            });
        } catch(error) {
            toast({ variant: 'destructive', title: 'Action Failed' });
        }
    }
    
    const handleToggleAdmin = async (user: User) => {
        const userRef = ref(db, `users/${user.id}`);
        try {
            await update(userRef, { role: user.role === 'admin' ? 'customer' : 'admin' });
             toast({
                title: `Role Updated`,
                description: `${user.name} is now a ${user.role === 'admin' ? 'customer' : 'admin'}.`,
            });
        } catch(error) {
             toast({ variant: 'destructive', title: 'Action Failed' });
        }
    }


  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <AdminHeader title="Users" description="Manage your customers and their roles." />
        <Card>
            <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>A list of all users in your database.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Total Orders</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                           <TableRow>
                             <TableCell colSpan={6} className="text-center">
                               <Loader2 className="animate-spin mx-auto" />
                             </TableCell>
                           </TableRow>
                        ) : users.map((user) => (
                           <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                            <TableCell>{user.orders || 0}</TableCell>
                             <TableCell>
                                <Badge variant={user.isBanned ? 'destructive' : 'outline'}>
                                    {user.isBanned ? 'Banned' : 'Active'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleOpenAlert(user)}>Send Alert</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleAdmin(user)}>{user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleBan(user)} className={user.isBanned ? '' : 'text-destructive'}>
                                        {user.isBanned ? 'Unban User' : 'Ban User'}
                                    </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                 </Table>
                </div>
            </CardContent>
        </Card>

        <Dialog open={isAlertDialogOpen} onOpenChange={handleCloseAlert}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send Alert to {selectedUser?.name}</DialogTitle>
                    <DialogDescription>
                        This message will be shown as a pop-up only to this user.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="alert-message">Message</Label>
                        <Textarea 
                            id="alert-message"
                            value={alertMessage}
                            onChange={(e) => setAlertMessage(e.target.value)}
                            placeholder="e.g., Your order #1234 has been updated."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCloseAlert}>Cancel</Button>
                    <Button onClick={handleSendAlert} disabled={isSendingAlert}>
                        {isSendingAlert && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Alert <Send className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </main>
  );
}
