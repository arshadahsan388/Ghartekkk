
'use client';

import Link from 'next/link';
import {
  Home,
  Package,
  Users2,
  Megaphone,
  Siren,
  PanelLeft,
  Settings,
  Star,
  Store,
  LayoutGrid,
  PackageCheck,
  Signal,
  MessageSquare,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import AdminNav from './AdminNav';
import Logo from '@/components/icons/Logo';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

const mainNavItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/orders", label: "Active Orders", icon: Package },
    { href: "/admin/delivered-orders", label: "Delivered Orders", icon: PackageCheck },
    { href: "/admin/users", label: "Users", icon: Users2 },
    { href: "/admin/shops", label: "Shops", icon: Store },
    { href: "/admin/shop-categories", label: "Categories", icon: LayoutGrid },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/support", label: "Support Chat", icon: MessageSquare },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { href: "/admin/alerts", label: "Alerts", icon: Siren },
];

const settingsNavItem = { href: "/admin/settings", label: "Settings", icon: Settings };

type OnlineUser = {
    id: string;
    isOnline: boolean;
    email: string;
};

export function AdminSidebar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });

    const statusRef = ref(db, 'status');
    const unsubscribePresence = onValue(statusRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const users = Object.keys(data)
                .map(key => ({ id: key, ...data[key] }))
                .filter(user => user.isOnline);
            setOnlineUsers(users);
        } else {
            setOnlineUsers([]);
        }
    });

    return () => {
        unsubscribeAuth();
        unsubscribePresence();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'An error occurred while logging out.',
      });
    }
  };


  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                <Link
                    href="/"
                    className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                >
                    <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                    <span className="sr-only">Pak Delivers</span>
                </Link>
                <AdminNav navItems={mainNavItems} />
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                <ThemeSwitcher />
                <AdminNav navItems={[settingsNavItem]} />
            </nav>
        </TooltipProvider>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">Pak Delivers</span>
              </Link>
              {mainNavItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}
               <Link
                  href={settingsNavItem.href}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <settingsNavItem.icon className="h-5 w-5" />
                  {settingsNavItem.label}
                </Link>
            </nav>
          </SheetContent>
        </Sheet>
        
        <div className="ml-auto flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Signal className="w-4 h-4 text-green-500" />
                    <span>{onlineUsers.length} Live</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Online Users</h4>
                        <p className="text-sm text-muted-foreground">
                            A list of users currently active on the app.
                        </p>
                    </div>
                    <ScrollArea className="h-48">
                        <div className="grid gap-2">
                            {onlineUsers.length > 0 ? (
                                onlineUsers.map((onlineUser) => (
                                    <div key={onlineUser.id} className="text-sm p-2 bg-muted rounded-md break-all">
                                        {onlineUser.email || onlineUser.id}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No users online.</p>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </PopoverContent>
          </Popover>

         {user && (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
                >
                 <Avatar>
                    <AvatarImage src={user.photoURL || "https://picsum.photos/100"} alt="User" />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/admin/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
         )}
        </div>

      </header>
    </>
  );
}
