
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingBag, LifeBuoy, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/orders', icon: Package, label: 'Orders' },
  { href: '/custom-order', icon: ShoppingBag, label: 'Custom' },
  { href: '/support', icon: LifeBuoy, label: 'Support' },
  { href: '/account', icon: User, label: 'Profile' },
];

export default function Footer() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  useEffect(() => {
    setIsMounted(true);

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if(user) {
             const ordersRef = ref(db, 'orders');
             const userOrdersQuery = query(ordersRef, orderByChild('userId'), equalTo(user.uid));

             const unsubscribeOrders = onValue(userOrdersQuery, (snapshot) => {
                let count = 0;
                snapshot.forEach(childSnapshot => {
                    const order = childSnapshot.val();
                    if (order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Rejected') {
                        count++;
                    }
                });
                setActiveOrdersCount(count);
             });

             return () => unsubscribeOrders();
        } else {
            setActiveOrdersCount(0);
        }
    });
    
    return () => unsubscribeAuth();

  }, []);

  // This prevents hydration errors by ensuring the server and client render the same initial UI
  if (!isMounted) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 md:hidden">
        <nav className="flex items-center justify-around h-full">
            {navItems.map((item) => (
            <div key={item.href} className="flex flex-col items-center justify-center gap-1 w-full h-full text-xs font-medium text-muted-foreground">
                <item.icon className="h-6 w-6" />
                <span>{item.label}</span>
            </div>
            ))}
        </nav>
      </footer>
    );
  }


  return (
    <>
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <nav className="flex items-center justify-around h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
           const isActive = pathname === href;
           return (
             <Link
               key={href}
               href={href}
               className={cn(
                 'relative flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full transition-colors',
                 isActive
                   ? 'text-primary'
                   : 'text-muted-foreground hover:text-primary'
               )}
             >
                {label === 'Orders' && activeOrdersCount > 0 && (
                    <Badge className="absolute top-1 right-5 h-5 w-5 justify-center p-0">{activeOrdersCount}</Badge>
                )}
               <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
               <span>{label}</span>
             </Link>
           );
        })}
      </nav>
    </footer>
     <footer className="hidden md:block bg-background border-t">
        <div className="container mx-auto py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-bold text-lg mb-2">GharTek</h3>
                    <p className="text-muted-foreground text-sm">Your favorite food and groceries, delivered fast.</p>
                </div>
                 <div>
                    <h3 className="font-semibold mb-2">Navigate</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/" className="text-muted-foreground hover:text-primary">Home</Link></li>
                        <li><Link href="/orders" className="text-muted-foreground hover:text-primary">My Orders</Link></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="font-semibold mb-2">Legal</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                        <li><Link href="/terms-and-conditions" className="text-muted-foreground hover:text-primary">Terms & Conditions</Link></li>
                        <li><Link href="/refund-policy" className="text-muted-foreground hover:text-primary">Refund Policy</Link></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="font-semibold mb-2">Support</h3>
                     <ul className="space-y-2 text-sm">
                        <li><Link href="/support" className="text-muted-foreground hover:text-primary">Support Chat</Link></li>
                         <li><Link href="/account" className="text-muted-foreground hover:text-primary">My Account</Link></li>
                    </ul>
                </div>
            </div>
             <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} GharTek. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </>
  );
}
