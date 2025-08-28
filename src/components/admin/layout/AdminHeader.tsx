
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

type AdminHeaderProps = {
    title: string;
    description: string;
    buttonText?: string;
    onButtonClick?: () => void;
}

export default function AdminHeader({ title, description, buttonText, onButtonClick }: AdminHeaderProps) {
  return (
    <div className="flex items-center">
        <div className="grid gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
        </div>
       {buttonText && onButtonClick && (
         <div className="ml-auto flex items-center gap-2">
            <Button size="sm" onClick={onButtonClick}>
                <PlusCircle className="h-4 w-4 mr-2" />
                {buttonText}
            </Button>
         </div>
       )}
    </div>
  );
}
