
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { LogIn, UserPlus, LifeBuoy, ShoppingBag } from 'lucide-react';
import Logo from '../icons/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Header() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const isNotAdminPage = !pathname.startsWith('/admin');

  if (!isNotAdminPage) {
    return null; // Don't render the main header on admin pages
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="md:hidden">
            {/* Placeholder for mobile layout */}
        </div>
        <Link href="/" className="mr-6 hidden md:flex items-center space-x-2">
          <Logo className="h-8 w-8" />
          <span className="font-bold text-xl font-headline">GharTek</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
             <Link href="/orders" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <ShoppingBag className="h-4 w-4"/>
                My Orders
            </Link>
             <Link href="/support" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <LifeBuoy className="h-4 w-4"/>
                Support
            </Link>
        </nav>


        <div className="flex items-center justify-end space-x-2 flex-1">
           <ThemeSwitcher />
          {!user && (
             <div className="space-x-2">
              <Button asChild variant="ghost">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Link>
              </Button>
              <Button asChild>
                <Link href="/signup">
                  <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
