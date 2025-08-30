
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { LogIn, UserPlus, LifeBuoy, ShoppingBag, ArrowLeft, Home, User, Package } from 'lucide-react';
import Logo from '../icons/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

export default function Header() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isNotAdminPage = !pathname.startsWith('/admin');
  const showBackButton = pathname !== '/';

  if (!isNotAdminPage) {
    return null; 
  }
  
  // To prevent hydration mismatch, we'll render a placeholder on the server and the actual content on the client.
  if (!isMounted) {
      return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                 <div className="flex items-center md:hidden">
                    <Skeleton className="h-8 w-8 mr-2" />
                    <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="mr-6 hidden md:flex h-8 w-28" />
                <div className="flex-1"></div>
                 <div className="flex items-center justify-end space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>
        </header>
      )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center md:hidden">
            {showBackButton && (
                <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6"/>
                    <span className="sr-only">Back</span>
                </Button>
            )}
            <Link href="/" className="flex items-center space-x-2">
                <Logo className="h-8 w-8" />
                <span className="font-bold text-xl font-headline">Pak Delivers</span>
            </Link>
        </div>

        <Link href="/" className="mr-6 hidden md:flex items-center space-x-2">
          <Logo className="h-8 w-8" />
          <span className="font-bold text-xl font-headline">Pak Delivers</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
             <Link href="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <Home className="h-4 w-4"/>
                Home
            </Link>
             <Link href="/orders" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <Package className="h-4 w-4"/>
                My Orders
            </Link>
             <Link href="/custom-order" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <ShoppingBag className="h-4 w-4"/>
                Custom Order
            </Link>
             <Link href="/support" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <LifeBuoy className="h-4 w-4"/>
                Support
            </Link>
             <Link href="/account" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <User className="h-4 w-4"/>
                Profile
            </Link>
        </nav>


        <div className="flex items-center justify-end space-x-2 flex-1">
           <ThemeSwitcher />
          {loading ? (
             <div className="flex items-center space-x-1">
                <Skeleton className="h-9 w-10 sm:w-24" />
                <Skeleton className="h-9 w-10 sm:w-24" />
             </div>
          ) : !user ? (
             <div className="flex items-center space-x-1">
              <Button asChild variant="ghost" size="sm" className="px-2 sm:px-4">
                <Link href="/login">
                  <LogIn className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </Button>
              <Button asChild size="sm" className="px-2 sm:px-4">
                <Link href="/signup">
                  <UserPlus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Up</span>
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
