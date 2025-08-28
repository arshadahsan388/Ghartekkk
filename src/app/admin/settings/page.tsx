
'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, updateProfile, type User } from 'firebase/auth';
import { ArrowUpRight, KeyRound, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setDisplayName(currentUser.displayName || '');
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
    }

    if (isLoading) {
        return (
             <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <AdminHeader title="Settings" description="Manage general application settings." />
                <div className="grid md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                        <CardContent><Skeleton className="h-10 w-full" /></CardContent>
                        <CardFooter><Skeleton className="h-10 w-24" /></CardFooter>
                    </Card>
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </main>
        )
    }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <AdminHeader title="Settings" description="Manage your administrator account." />
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your display name.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={user?.email || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input 
                            id="displayName" 
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your Name"
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveName} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardFooter>
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
                            <p className="text-sm text-muted-foreground">For security, password changes are handled by Google.</p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer">
                                Go to Google <ArrowUpRight className="w-4 h-4 ml-2"/>
                            </a>
                        </Button>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <p className="font-medium flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">Enable 2FA in the Firebase console for enhanced security.</p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                             <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
                                Go to Firebase <ArrowUpRight className="w-4 h-4 ml-2"/>
                            </a>
                        </Button>
                    </div>
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">
                        It's best practice to manage sensitive security settings directly in the provider's console.
                    </p>
                </CardFooter>
            </Card>
        </div>
    </main>
  );
}
