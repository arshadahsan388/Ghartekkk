import { Megaphone } from "lucide-react";

export default function AnnouncementBar() {
    return (
        <div className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-4 h-10 overflow-hidden">
                    <Megaphone className="h-5 w-5 shrink-0" />
                    <div className="flex-1 overflow-hidden">
                        <p className="whitespace-nowrap moving-text text-sm font-medium">
                            Free delivery on all orders above Rs. 1000! Limited time offer.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
