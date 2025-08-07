import Link from 'next/link';
import * as Icons from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ToolCardProps {
  name: string;
  description: string;
  href: string;
  icon: keyof typeof Icons;
}

export function ToolCard({ name, description, href, icon }: ToolCardProps) {
  const LucideIcon = Icons[icon] as React.ComponentType<React.ComponentProps<typeof Icons.Icon>>;

  return (
    <Link href={href} className="group">
      <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card/50 hover:bg-card">
        <CardHeader className="items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                {LucideIcon && <LucideIcon className="h-8 w-8" />}
            </div>
            <CardTitle className="font-headline text-xl">{name}</CardTitle>
            <CardDescription className="pt-2 min-h-[4rem]">{description}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto flex justify-center">
            <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-colors">
                Use Tool <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
