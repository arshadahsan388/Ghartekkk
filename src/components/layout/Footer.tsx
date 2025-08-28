
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, PlusSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/orders', icon: Package, label: 'Orders' },
  { href: '/custom-order', icon: PlusSquare, label: 'Custom' },
];

export default function Footer() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return a placeholder footer if the component has not yet mounted on the client.
  // This ensures the server-rendered HTML and the initial client-rendered HTML are identical.
  const renderPlaceholder = () => (
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

  if (!isMounted) {
    return renderPlaceholder();
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <nav className="flex items-center justify-around h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
           const isActive = pathname === href;
           return (
             <Link
               key={href}
               href={href}
               className={cn(
                 'flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full transition-colors',
                 isActive
                   ? 'text-primary'
                   : 'text-muted-foreground hover:text-primary'
               )}
             >
               <Icon className="h-6 w-6" />
               <span>{label}</span>
             </Link>
           );
        })}
      </nav>
    </footer>
  );
}
