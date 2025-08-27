import Link from 'next/link';
import Logo from '../icons/Logo';

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-8" />
              <span className="font-bold text-xl font-headline">Pak Delivers</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Your one-stop shop for deliveries in Vehari.
            </p>
             <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Pak Delivers. All Rights Reserved.</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-muted-foreground hover:text-primary">Home</Link></li>
                <li><Link href="/orders" className="text-muted-foreground hover:text-primary">My Orders</Link></li>
                <li><Link href="/custom-order" className="text-muted-foreground hover:text-primary">Custom Order</Link></li>
              </ul>
            </div>
             <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms-and-conditions" className="text-muted-foreground hover:text-primary">Terms & Conditions</Link></li>
              </ul>
            </div>
             <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="text-muted-foreground">contact@pakdelivers.com</li>
                <li className="text-muted-foreground">+92 300 1234567</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
