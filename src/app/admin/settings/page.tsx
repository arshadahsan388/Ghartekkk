
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminHeader from '@/components/admin/layout/AdminHeader';

export default function SettingsPage() {
    
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <AdminHeader title="Settings" description="Manage general application settings." />
        <Card>
            <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>More settings will be available here in the future.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>No settings available at the moment.</p>
            </CardContent>
        </Card>
    </main>
  );
}
