
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { LogOut, Package, User, ShoppingBag, LogIn, UserPlus, LifeBuoy } from 'lucide-react';
import Logo from '../icons/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
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

  const handleLogout = async () => {
    try {
        await signOut(auth);
        toast({
            title: 'Logged Out',
            description: 'You have been successfully logged out.',
        });
        router.push('/login');
        router.refresh();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Logout Failed',
            description: 'An error occurred while logging out.',
        });
    }
  };

  const isNotAdminPage = !pathname.startsWith('/admin');

  if (!isNotAdminPage) {
    return null; // Don't render the main header on admin pages
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo className="h-8 w-8" />
          <span className="font-bold text-xl font-headline">Pak Delivers</span>
        </Link>

        <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || "https://picsum.photos/100"} alt={user.displayName || "User"} />
                    <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <Link href="/orders">
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
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
