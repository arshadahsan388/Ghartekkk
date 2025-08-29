
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';

export default function RefundPolicyPage() {
  const [content, setContent] = useState<{ title: string, body: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const contentRef = ref(db, 'content/refund');
    const unsubscribe = onValue(contentRef, (snapshot) => {
      if (snapshot.exists()) {
        setContent(snapshot.val());
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-card p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-6 font-headline text-primary">{content?.title || 'Refund Policy'}</h1>
        <div
          className="prose dark:prose-invert max-w-none space-y-4"
          dangerouslySetInnerHTML={{ __html: content?.body || '<p>No content available.</p>' }}
        />
      </div>
    </div>
  );
}
