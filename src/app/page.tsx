import { ToolCard } from '@/components/tool-card';
import { Button } from '@/components/ui/button';
import type { LucideProps } from 'lucide-react';
import * as Icons from 'lucide-react';
import Link from 'next/link';

type Tool = {
  name: string;
  description: string;
  href: string;
  icon: keyof typeof Icons | React.ComponentType<any>;
}

const tools: Tool[] = [
  { name: 'Tattoo Stencil Maker', description: 'Convert photos into detailed black and white stencils, perfect for tattoos.', href: '/tattoo-stencil', icon: 'Scissors' },
  { name: 'Coloring Book Converter', description: 'Turn any image into a line-art sketch, ready to be colored in.', href: '/coloring-converter', icon: 'Palette' },
  { name: 'Passport Photo Tool', description: 'Crop and resize photos for any official ID with standard presets.', href: '/passport-photo', icon: 'UserSquare' },
  { name: 'DSLR Blur', description: 'Apply a realistic background blur to your photos to make subjects pop.', href: '/blur-background', icon: 'Droplets' },
  { name: 'Image Resizer', description: 'Quickly resize any image to your specified dimensions.', href: '/resize', icon: 'StretchHorizontal' },
  { name: 'Image Cropper', description: 'Crop images with precision using presets, rotation, and zoom.', href: '/crop', icon: 'Crop' },
  { name: 'Image Compressor', description: 'Reduce image file size with a quality preview.', href: '/compress', icon: 'Minimize2' },
  { name: 'Image Filters', description: 'Apply classic filters like Grayscale and Sepia to your photos.', href: '/filters', icon: 'Wand2' }
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
      <section className="text-center mb-16 md:mb-24">
        <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-primary">
          The Ultimate Free Image Toolbox
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Edit, sketch, resize, crop, and enhance your images – 100% free, no signup, no watermark.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="font-semibold text-lg py-6 px-8 shadow-lg hover:shadow-primary/30 transition-shadow">
            <Link href="#tools">Start Editing</Link>
          </Button>
        </div>
      </section>

      <section id="tools">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {tools.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
