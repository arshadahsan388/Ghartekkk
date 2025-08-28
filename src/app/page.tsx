
'use client';

import { Button } from '@/components/ui/button';
import ShopList from '@/components/shops/ShopList';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/custom-order?description=${encodeURIComponent(searchQuery)}`);
    }
  };


  return (
    <>
      <AnnouncementBar />
      <div className="relative py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent -z-10"></div>
        <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-headline">
               Aap kia mangwana chahtay han?
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-base text-muted-foreground">
              Groceries, medicine, or your favorite meal. Just tell us what you need.
            </p>
            <form onSubmit={handleSearchSubmit} className="mt-8 max-w-xl mx-auto">
              <div className="flex w-full items-center space-x-2">
                <Input 
                  type="text" 
                  placeholder="e.g., 'A box of Panadol and some fresh bread'" 
                  className="h-12 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" size="lg">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              </div>
            </form>
             <div className="mt-4 text-sm">
              <Link href="/custom-order" className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1">
                or go to custom order page <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
        </div>
      </div>
      <div id="shops" className="container mx-auto px-4 py-12">
        <ShopList />
      </div>
    </>
  );
}
