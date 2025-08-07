import Link from "next/link";
import { Brush } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold">
                <div className="bg-primary p-1.5 rounded-md">
                   <Brush className="h-5 w-5 text-primary-foreground" />
                </div>
                <span>ImageCon.pro</span>
            </Link>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">© {new Date().getFullYear()} ImageCon.pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
