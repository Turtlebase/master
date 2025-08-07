import Link from "next/link";
import { Brush } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Link href="/" className="flex items-center gap-2 font-headline text-lg font-semibold">
                <Brush className="h-6 w-6 text-primary" />
                <span className="font-bold">ImageCon.pro</span>
            </Link>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} ImageCon.pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
