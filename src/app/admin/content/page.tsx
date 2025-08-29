
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { defaultContent } from '@/lib/default-content';

type PageContent = {
  title: string;
  body: string;
}

const pageKeys = ['about', 'privacy', 'terms', 'refund'];
const pageTitles: { [key: string]: string } = {
  about: 'About Us',
  privacy: 'Privacy Policy',
  terms: 'Terms & Conditions',
  refund: 'Refund Policy'
};

export default function ContentPage() {
    const { toast } = useToast();
    const [content, setContent] = useState<{ [key: string]: PageContent }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState(pageKeys[0]);

    useEffect(() => {
        const fetchContent = async () => {
            setIsLoading(true);
            try {
                const contentRef = ref(db, 'content');
                const snapshot = await get(contentRef);
                if (snapshot.exists()) {
                    const dbContent = snapshot.val();
                    // Ensure all keys are present, falling back to default if not
                    const fullContent = pageKeys.reduce((acc, key) => {
                        acc[key] = dbContent[key] || defaultContent[key as keyof typeof defaultContent];
                        return acc;
                    }, {} as { [key: string]: PageContent });
                    setContent(fullContent);
                } else {
                    // Initialize with default content if no content exists at all
                    setContent(defaultContent);
                }
            } catch (error) {
                console.error("Error fetching content:", error);
                 setContent(defaultContent);
                toast({
                    variant: 'destructive',
                    title: 'Failed to load content',
                    description: 'Loading default content instead.',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
    }, [toast]);
    

    const handleSave = async (pageKey: string) => {
        setIsSaving(true);
        try {
            const pageContentRef = ref(db, `content/${pageKey}`);
            await set(pageContentRef, content[pageKey]);
            toast({
                title: 'Content Saved',
                description: `The ${pageTitles[pageKey]} page has been updated.`,
            });
        } catch (error) {
            console.error("Error saving content:", error);
            toast({
                variant: 'destructive',
                title: 'Failed to save content',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleContentChange = (pageKey: string, field: 'title' | 'body', value: string) => {
        setContent(prev => ({
            ...prev,
            [pageKey]: {
                ...prev[pageKey],
                [field]: value,
            }
        }));
    }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <AdminHeader title="Content Management" description="Edit the content of your static pages." />
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
                 {pageKeys.map(key => (
                    <TabsTrigger key={key} value={key}>{pageTitles[key]}</TabsTrigger>
                ))}
            </TabsList>
            {isLoading ? (
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="animate-spin" />
                </div>
            ) : (
                 pageKeys.map(key => (
                    <TabsContent key={key} value={key}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit {pageTitles[key]}</CardTitle>
                                <CardDescription>Use the fields below to update the page content.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor={`${key}-title`}>Page Title</Label>
                                    <Textarea 
                                        id={`${key}-title`}
                                        value={content[key]?.title || ''}
                                        onChange={(e) => handleContentChange(key, 'title', e.target.value)}
                                        rows={1}
                                    />
                                </div>
                                 <div className="grid gap-2">
                                    <Label htmlFor={`${key}-body`}>Page Body</Label>
                                    <Textarea 
                                        id={`${key}-body`}
                                        value={content[key]?.body || ''}
                                        onChange={(e) => handleContentChange(key, 'body', e.target.value)}
                                        placeholder={`Enter the main content for the ${pageTitles[key]} page here...`}
                                        rows={15}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4">
                                <Button onClick={() => handleSave(key)} disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                 ))
            )}
        </Tabs>
    </main>
  );
}
