
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import { db } from '@/lib/firebase';
import { ref, set, get } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const { toast } = useToast();
    const [alert, setAlert] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const settingsRef = ref(db, 'settings/alert');
                const snapshot = await get(settingsRef);
                if (snapshot.exists()) {
                    setAlert(snapshot.val());
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast({
                    variant: 'destructive',
                    title: 'Failed to load settings',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [toast]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const settingsRef = ref(db, 'settings/alert');
            await set(settingsRef, alert);
            toast({
                title: 'Settings Saved',
                description: 'The pop-up alert has been updated.',
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({
                variant: 'destructive',
                title: 'Failed to save settings',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <AdminHeader title="Alerts" description="Manage the pop-up alert for all users." />
        <Card>
            <CardHeader>
                <CardTitle>Global App Alert</CardTitle>
                <CardDescription>This message will be displayed in a pop-up to all users when they open the app.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <div className="grid gap-2">
                        <Label htmlFor="alert">Alert Message</Label>
                        <Textarea 
                            id="alert"
                            value={alert}
                            onChange={(e) => setAlert(e.target.value)}
                            placeholder="e.g., Special discount this weekend!"
                            rows={4}
                        />
                    </div>
                )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSave} disabled={isSaving || isLoading}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save & Publish Alert
                </Button>
            </CardFooter>
        </Card>
    </main>
  );
}
