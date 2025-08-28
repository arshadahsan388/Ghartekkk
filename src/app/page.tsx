
'use client';

import { Button } from '@/components/ui/button';
import ShopList from '@/components/shops/ShopList';
import Link from 'next/link';
import { ArrowRight, Home as HomeIcon, Send, Wallet, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import { getSearchSuggestions } from '@/ai/flows/get-search-suggestions';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import CategoryNav from '@/components/shops/CategoryNav';

// Debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};


export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [budget, setBudget] = useState('');
  const [address, setAddress] = useState('');
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const isTyping = useRef(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const savedAddress = localStorage.getItem('deliveryAddress');
        if (savedAddress) {
          setAddress(savedAddress);
        }
      }
    });

    // Hide suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
        unsubscribe();
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const debouncedGetSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsSuggesting(true);
      try {
        const result = await getSearchSuggestions({ query });
        setSuggestions(result.suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to get suggestions", error);
        toast({ variant: 'destructive', title: 'Could not fetch suggestions' });
      } finally {
        setIsSuggesting(false);
      }
    }, 500),
    [toast]
  );
  
   useEffect(() => {
    if (searchQuery && isTyping.current) {
      debouncedGetSuggestions(searchQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, debouncedGetSuggestions]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('description', searchQuery);
      if (budget) {
        params.set('budget', budget);
      }
      if (address) {
        params.set('address', address);
      }
      router.push(`/custom-order?${params.toString()}`);
    }
  };

  const handleFocus = () => {
    setShowExtraFields(true);
    if(suggestions.length > 0) {
        setShowSuggestions(true);
    }
  }
  
  const handleSuggestionClick = (suggestion: string) => {
    isTyping.current = false;
    setSearchQuery(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  }
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isTyping.current = true;
    setSearchQuery(e.target.value);
  }

  return (
    <>
      <AnnouncementBar />
      <div className="relative py-8">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent -z-10"></div>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-headline">
            Aap kia mangwana chahtay han?
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-muted-foreground">
            Grocery, dawai, ya aap ka pasandeeda khana. Bas humain batain aap ko
            kya chahiye.
          </p>
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-xl mx-auto space-y-4">
             <div className="relative w-full" ref={suggestionsRef}>
              <Input
                type="text"
                placeholder="e.g., 'A box of Panadol and some fresh bread'"
                className="h-12 text-base"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleFocus}
                autoComplete="off"
              />
               {isSuggesting && <Loader2 className="animate-spin absolute right-3 top-3.5 text-muted-foreground" />}
              {showSuggestions && suggestions.length > 0 && (
                <Card className="absolute top-full mt-2 w-full z-10 shadow-lg text-left">
                  <ul className="p-2">
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-2 rounded-md hover:bg-muted cursor-pointer"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
            
            {showExtraFields && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left animate-in fade-in-0 duration-500">
                    <div className="space-y-2">
                        <Label htmlFor="budget" className="flex items-center gap-2"><Wallet className="w-4 h-4" /> Budget (Optional)</Label>
                        <Input 
                            id="budget"
                            type="number"
                            placeholder="e.g., 1000"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="address" className="flex items-center gap-2"><HomeIcon className="w-4 h-4" /> Address</Label>
                        <Input 
                            id="address"
                            placeholder="e.g., Vehari"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2 self-end">
                        <Button type="submit" size="lg" className="w-full h-10">
                            Submit
                            <Send className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

          </form>
        </div>
      </div>
      
      <div id="shops" className="container mx-auto px-4 py-8">
        <ShopList />
      </div>
    </>
  );
}
