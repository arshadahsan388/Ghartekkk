

'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type NavItem = {
    href: string;
    label: string;
    icon: LucideIcon;
    notificationCount?: number;
}

export default function AdminNav({ navItems }: { navItems: NavItem[] }) {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            {navItems.map(({ href, label, icon: Icon, notificationCount }) => {
                const isActive = pathname.startsWith(href);
                return (
                    <Tooltip key={href}>
                        <TooltipTrigger asChild>
                        <Link
                            href={href}
                            className={cn(
                                "relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                                isActive && "bg-accent text-accent-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {notificationCount && notificationCount > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{notificationCount}</Badge>
                            )}
                            <span className="sr-only">{label}</span>
                        </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">{label}</TooltipContent>
                    </Tooltip>
                )
            })}
      </nav>
    )
}
