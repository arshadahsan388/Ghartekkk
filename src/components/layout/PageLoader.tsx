
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export default function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // We don't use React's state transition for the initial loading state
    // to avoid a flash of the loader on page load.
    const handleRouteChangeStart = () => {
      setLoading(true);
    };

    const handleRouteChangeComplete = () => {
      // Hide the loader with a delay to allow the animation to finish
      setTimeout(() => setLoading(false), 300);
    };

    // This is a bit of a workaround for the App Router as it doesn't have native router events.
    // We listen to clicks on links and assume a navigation is starting.
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            // Check if it's an internal link and not just an anchor link
            if (href && href.startsWith('/') && !href.startsWith('/#')) {
                handleRouteChangeStart();
            }
        });
    });

    // We use the pathname change to signal the end of navigation.
    handleRouteChangeComplete();
    
  }, [pathname]);

  if (!isMobile) {
    return null;
  }

  return (
    <div
      className={cn(
        'h-1 w-full bg-primary/20 overflow-hidden fixed top-16 left-0 z-50 transition-opacity duration-300',
        loading ? 'opacity-100' : 'opacity-0'
      )}
      style={{ pointerEvents: loading ? 'auto' : 'none' }}
    >
      <div className="h-full bg-primary page-loader-progress"></div>
    </div>
  );
}
