import Link from 'next/link';
import * as Icons from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface ToolCardProps {
  name: string;
  description: string;
  href: string;
  icon: keyof typeof Icons;
}

export function ToolCard({ name, description, href, icon }: ToolCardProps) {
  const LucideIcon = Icons[icon];

  return (
    <Link href={href} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:-translate-y-2 bg-card border border-border hover:border-primary/50">
        <CardHeader className="items-start">
            <div className="mb-4 rounded-lg bg-primary/10 p-3 text-primary ring-2 ring-primary/20">
                {LucideIcon && <LucideIcon className="h-7 w-7" />}
            </div>
            <CardTitle className="font-headline text-xl">{name}</CardTitle>
            <CardDescription className="pt-2 min-h-[4rem] text-muted-foreground/80">{description}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto flex justify-start">
            <div className="flex items-center text-sm font-semibold text-primary">
                Use Tool <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}
