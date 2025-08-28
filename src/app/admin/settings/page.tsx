
'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, updateProfile, sendPasswordResetEmail, updateEmail, EmailAuthProvider, reauthenticateWithCredential, type User } from 'firebase/auth';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [newEmail, setNewEmail] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setDisplayName(currentUser.displayName || '');
                setNewEmail(currentUser.email || '');
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

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

    const handleEmailChange = async () => {
        if (!user || !newEmail || newEmail === user.email) return;
        
        const password = prompt("For your security, please enter your current password:");
        if (!password) return;

        setIsSaving(true);

        try {
            const credential = EmailAuthProvider.credential(user.email!, password);
            await reauthenticateWithCredential(user, credential);
            await updateEmail(user, newEmail);
            toast({
                title: 'Email Updated',
                description: `Your email has been changed to ${newEmail}.`,
            });
        } catch (error: any) {
            console.error("Error updating email:", error);
            if (error.code === 'auth/wrong-password') {
                toast({
                    variant: 'destructive',
                    title: 'Authentication Failed',
                    description: 'The password you entered is incorrect.',
                });
            } else if (error.code === 'auth/email-already-in-use') {
                 toast({
                    variant: 'destructive',
                    title: 'Email Update Failed',
                    description: 'This email is already in use by another account.',
                });
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Email Update Failed',
                    description: 'An error occurred while updating your email.',
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
             <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <AdminHeader title="Settings" description="Manage general application settings." />
                <div className="grid md:grid-cols-1 gap-8">
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                        <CardContent><Skeleton className="h-10 w-full" /></CardContent>
                        <CardFooter><Skeleton className="h-10 w-24" /></CardFooter>
                    </Card>
                </div>
            </main>
        )
    }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <AdminHeader title="Settings" description="Manage your administrator account." />
        <div className="grid md:grid-cols-1 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your display name and email address.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <div className="flex gap-2">
                            <Input 
                                id="displayName" 
                                value={displayName} 
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your Name"
                                disabled={isSaving}
                            />
                            <Button onClick={handleSaveName} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Name'}
                            </Button>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="flex gap-2">
                            <Input 
                                id="email" 
                                type="email" 
                                value={newEmail || ''}
                                onChange={(e) => setNewEmail(e.target.value)}
                                disabled={isSaving}
                            />
                             <Button onClick={handleEmailChange} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Email'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your password and two-factor authentication.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <p className="font-medium flex items-center gap-2"><KeyRound className="w-4 h-4"/> Change Password</p>
                            <p className="text-sm text-muted-foreground">Click to send a password reset link to your email.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handlePasswordReset} disabled={isSaving}>
                           Send Reset Link
                        </Button>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <p className="font-medium flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">Enable 2FA in the Firebase console for enhanced security.</p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                             <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
                               Go to Firebase
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </main>
  );
}
