import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Brush } from 'lucide-react';
import { Button } from '../ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2.5 font-headline text-xl font-bold">
          <div className="bg-primary p-2 rounded-lg">
            <Brush className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline-block">ImageCon.pro</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
           <Button variant="ghost" asChild>
             <Link href="/#tools">Tools</Link>
           </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
