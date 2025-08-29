
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
  FileText,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetClose, SheetTrigger } from '@/components/ui/sheet';
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
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import AdminNav from './AdminNav';
import Logo from '@/components/icons/Logo';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

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
  const [notificationCounts, setNotificationCounts] = useState({
      orders: 0,
      reviews: 0,
      support: 0,
  });

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

    // Listen for active orders
    const ordersRef = ref(db, 'orders');
    const unreadQuery = query(ordersRef, orderByChild('isRead'), equalTo(false));
    const unsubscribeOrders = onValue(unreadQuery, (snapshot) => {
        let count = 0;
        snapshot.forEach(childSnapshot => {
            const order = childSnapshot.val();
             if (order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Rejected') {
                count++;
            }
        });
        setNotificationCounts(prev => ({ ...prev, orders: count }));
    });

    // Listen for unread reviews
    const reviewsRef = ref(db, 'reviews');
    const unreadReviewsQuery = query(reviewsRef, orderByChild('isRead'), equalTo(false));
    const unsubscribeReviews = onValue(unreadReviewsQuery, (snapshot) => {
        setNotificationCounts(prev => ({ ...prev, reviews: snapshot.size }));
    });
    
    // Listen for unread chats
    const chatsRef = ref(db, 'chats');
    const unreadChatsQuery = query(chatsRef, orderByChild('metadata/unreadByAdmin'), equalTo(true));
    const unsubscribeChats = onValue(unreadChatsQuery, (snapshot) => {
        setNotificationCounts(prev => ({ ...prev, support: snapshot.size }));
    });


    return () => {
        unsubscribeAuth();
        unsubscribePresence();
        unsubscribeOrders();
        unsubscribeReviews();
        unsubscribeChats();
    };
  }, []);

  const handleLogout = async () => {
    try {
      router.push('/login');
      await signOut(auth);
      router.refresh();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'An error occurred while logging out.',
      });
    }
  };

  const mainNavItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/orders", label: "Active Orders", icon: Package, notificationCount: notificationCounts.orders },
    { href: "/admin/delivered-orders", label: "Delivered Orders", icon: PackageCheck },
    { href: "/admin/users", label: "Users", icon: Users2 },
    { href: "/admin/shops", label: "Shops", icon: Store },
    { href: "/admin/shop-categories", label: "Categories", icon: LayoutGrid },
    { href: "/admin/reviews", label: "Reviews", icon: Star, notificationCount: notificationCounts.reviews },
    { href: "/admin/support", label: "Support Chat", icon: MessageSquare, notificationCount: notificationCounts.support },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { href: "/admin/alerts", label: "Alerts", icon: Siren },
    { href: "/admin/content", label: "Content", icon: FileText },
];

const settingsNavItem = { href: "/admin/settings", label: "Settings", icon: Settings };


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
                    <span className="sr-only">GharTek</span>
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
          <SheetContent side="left" className="sm:max-w-xs flex flex-col p-0">
             <SheetTitle className="sr-only">Admin Menu</SheetTitle>
             <div className="p-4">
                 <Link
                    href="/"
                    className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                  >
                    <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                    <span className="sr-only">GharTek</span>
                  </Link>
             </div>
             <ScrollArea className="flex-1">
                <nav className="grid gap-2 text-lg font-medium p-4">
                  {mainNavItems.map(({ href, label, icon: Icon, notificationCount }) => (
                    <SheetClose asChild key={href}>
                        <Link
                          href={href}
                          className="flex items-center gap-4 rounded-lg border p-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Icon className="h-5 w-5" />
                          {label}
                          {notificationCount && notificationCount > 0 && <Badge className="ml-auto">{notificationCount}</Badge>}
                        </Link>
                    </SheetClose>
                  ))}
                   <SheetClose asChild>
                        <Link
                          href={settingsNavItem.href}
                          className="flex items-center gap-4 rounded-lg border p-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <settingsNavItem.icon className="h-5 w-5" />
                          {settingsNavItem.label}
                        </Link>
                   </SheetClose>
                </nav>
             </ScrollArea>
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
