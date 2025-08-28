
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

export default function AnnouncementsPage() {
    const { toast } = useToast();
    const [announcement, setAnnouncement] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const settingsRef = ref(db, 'settings/announcement');
                const snapshot = await get(settingsRef);
                if (snapshot.exists()) {
                    setAnnouncement(snapshot.val());
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast({
                    variant: 'destructive',
                    title: 'Failed to load announcements',
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
            const settingsRef = ref(db, 'settings/announcement');
            await set(settingsRef, announcement);
            toast({
                title: 'Announcement Saved',
                description: 'The moving text bar has been updated for all users.',
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({
                variant: 'destructive',
                title: 'Failed to save announcement',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <AdminHeader title="Announcements" description="Manage the moving text announcement bar." />
        <Card>
            <CardHeader>
                <CardTitle>Top Announcement Bar</CardTitle>
                <CardDescription>This message will be displayed in the moving text bar at the top of the app.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <div className="grid gap-2">
                        <Label htmlFor="announcement">Announcement Message</Label>
                        <Textarea 
                            id="announcement"
                            value={announcement}
                            onChange={(e) => setAnnouncement(e.target.value)}
                            placeholder="e.g., Free delivery on all orders above Rs. 1000!"
                            rows={4}
                        />
                    </div>
                )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSave} disabled={isSaving || isLoading}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save & Publish Announcement
                </Button>
            </CardFooter>
        </Card>
    </main>
  );
}
