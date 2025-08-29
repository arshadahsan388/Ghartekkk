
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home, LogOut, LifeBuoy, Package, User as UserIcon, KeyRound, Save, AtSign, FileText, Shield, FileQuestion, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, updateProfile, sendPasswordResetEmail, type User } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function AccountPage() {
  const [address, setAddress] = useState('');
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        const savedAddress = localStorage.getItem('deliveryAddress') || '';
        setAddress(savedAddress);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSaveAddress = () => {
    localStorage.setItem('deliveryAddress', address);
    toast({
      title: 'Address Saved',
      description: 'Your delivery address has been updated.',
    });
  }
  
  const handleSaveName = async () => {
    if (!user || !displayName) return;
    setIsSaving(true);
    try {
      await updateProfile(user, { displayName });
      toast({
        title: 'Name Updated',
        description: 'Your display name has been successfully updated.',
      });
    } catch (error) {
      console.error("Error updating name:", error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update your display name.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsSaving(true);
    try {
        await sendPasswordResetEmail(auth, user.email);
        toast({
            title: 'Password Reset Email Sent',
            description: 'Please check your inbox to reset your password.',
        });
    } catch (error) {
        console.error("Error sending password reset email:", error);
        toast({
            variant: 'destructive',
            title: 'Request Failed',
            description: 'Could not send password reset email.',
        });
    } finally {
        setIsSaving(false);
    }
  };


   const handleLogout = async () => {
    try {
        await signOut(auth);
        router.push('/signup');
        router.refresh();
        toast({
            title: 'Logged Out',
            description: 'You have been successfully logged out.',
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Logout Failed',
            description: 'An error occurred while logging out.',
        });
    }
  };

  if (!isMounted || !user) {
    return (
        <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-12 w-1/4 mb-12" />
            <div className="max-w-xl mx-auto space-y-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter>
                         <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="font-headline text-4xl sm:text-5xl font-bold">My Profile</h1>
         <p className="text-muted-foreground mt-2">Manage your account settings and view your activity.</p>
      </div>
      <div className="max-w-2xl mx-auto space-y-8">

        <Card>
            <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your personal details and security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <div className="flex gap-2">
                        <div className="relative w-full">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="displayName" 
                                value={displayName} 
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your Name"
                                disabled={isSaving}
                                className="pl-9"
                            />
                        </div>
                        <Button onClick={handleSaveName} disabled={isSaving}>
                           <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                     <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="email" 
                            type="email" 
                            value={user.email || ''}
                            disabled
                            className="pl-9"
                        />
                    </div>
                     <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                </div>
                <Separator />
                <div className="space-y-2 pt-2">
                    <Label htmlFor="address">Default Delivery Address</Label>
                    <div className="flex gap-2">
                        <div className="relative w-full">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="address" 
                                placeholder="e.g., House 123, Street 4, Vehari" 
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button onClick={handleSaveAddress}><Save className="mr-2 h-4 w-4" /> Save</Button>
                    </div>
                </div>
                <Separator />
                 <div className="space-y-2 pt-2">
                    <Label>Password</Label>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <p className="font-medium flex items-center gap-2"><KeyRound className="w-4 h-4"/> Change Password</p>
                            <p className="text-sm text-muted-foreground">Click to send a password reset link to your email.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handlePasswordReset} disabled={isSaving}>
                            Send Reset Link
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>App Settings &amp; Legal</CardTitle>
            <CardDescription>Navigate to other parts of the app and view our policies.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
                <div className="py-2">
                    <Link href="/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <Package className="w-5 h-5 text-muted-foreground" />
                        <span>My Orders</span>
                    </Link>
                    <Link href="/support" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <LifeBuoy className="w-5 h-5 text-muted-foreground" />
                        <span>Support Chat</span>
                    </Link>
                     <Link href="/about" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <Info className="w-5 h-5 text-muted-foreground" />
                        <span>About Us</span>
                    </Link>
                </div>
                <div className="py-2">
                    <Link href="/privacy-policy" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <Shield className="w-5 h-5 text-muted-foreground" />
                        <span>Privacy Policy</span>
                    </Link>
                     <Link href="/terms-and-conditions" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <span>Terms &amp; Conditions</span>
                    </Link>
                     <Link href="/refund-policy" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <FileQuestion className="w-5 h-5 text-muted-foreground" />
                        <span>Refund Policy</span>
                    </Link>
                </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Log Out</CardTitle>
             <CardDescription>
                End your current session.
            </CardDescription>
          </CardHeader>
          <CardFooter>
             <Button variant="destructive" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
