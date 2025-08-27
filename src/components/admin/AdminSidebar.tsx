
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, Users } from 'lucide-react';
import Logo from '../icons/Logo';

const navItems = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/shops', icon: Package, label: 'Shops' },
];


export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-background md:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6" />
            <span>Admin Panel</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map(({ href, icon: Icon, label }) => (
                 <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname === href ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
                >
                    <Icon className="h-4 w-4" />
                    {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
