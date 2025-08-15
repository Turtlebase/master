import { ToolCard } from '@/components/tool-card';
import { Button } from '@/components/ui/button';
import * as Icons from 'lucide-react';
import Link from 'next/link';

type Tool = {
  name: string;
  description: string;
  href: string;
  icon: keyof typeof Icons;
}

const tools: Tool[] = [
  { name: 'AI Background Remover', description: 'Automatically remove the background from any image with a single click.', href: '/remove-background', icon: 'Sparkles' },
  { name: 'AI Metadata Generator', description: 'Generate SEO-optimized titles, descriptions, and tags for your images.', href: '/metadata-generator', icon: 'FileText' },
  { name: 'Tattoo Stencil Maker', description: 'Convert photos into detailed black and white stencils, perfect for tattoos.', href: '/tattoo-stencil', icon: 'Scissors' },
  { name: 'Coloring Book Converter', description: 'Turn any image into a line-art sketch, ready to be colored in.', href: '/coloring-converter', icon: 'Palette' },
  { name: 'Passport Photo Tool', description: 'Create compliant passport photos with AI background removal.', href: '/passport-photo', icon: 'UserSquare' },
  { name: 'Image Converter', description: 'Convert images to different formats like JPG, PNG, and WebP.', href: '/image-converter', icon: 'FileImage' },
  { name: 'DSLR Blur', description: 'Apply a realistic background blur to your photos to make subjects pop.', href: '/blur-background', icon: 'Droplets' },
  { name: 'Image Resizer', description: 'Quickly resize any image to your specified dimensions.', href: '/resize', icon: 'StretchHorizontal' },
  { name: 'Image Cropper', description: 'Crop images with precision using presets, rotation, and zoom.', href: '/crop', icon: 'Crop' },
  { name: 'Image Compressor', description: 'Reduce image file size with an interactive quality preview.', href: '/compress', icon: 'Minimize2' },
  { name: 'Image Filters', description: 'Apply classic filters like Grayscale and Sepia to your photos.', href: '/filters', icon: 'Wand2' }
];

export default function Home() {
  return (
    <div className="animate-fade-in-up">
      <section className="text-center py-20 md:py-32">
        <div className="container mx-auto px-4">
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary via-blue-400 to-blue-500 text-transparent bg-clip-text">
            Ultimate Free Image Toolbox
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            Edit, sketch, resize, crop, and enhance your images. 100% free, no signup, no watermarks.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="font-semibold text-lg py-7 px-10 shadow-[0_0_20px_theme(colors.primary/30%)] hover:shadow-[0_0_30px_theme(colors.primary/50%)] transition-all duration-300 transform hover:scale-105">
              <Link href="#tools">Explore Tools</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="tools" className="container mx-auto px-4 py-16 sm:py-24">
         <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">Our Suite of Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {tools.map((tool, index) => (
            <div key={tool.href} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`}}>
              <ToolCard {...tool} />
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Why Choose ImageCon.pro?</h2>
        <p className="max-w-3xl mx-auto text-muted-foreground text-lg">
          We believe powerful image editing should be accessible to everyone. All our tools are free, work directly in your browser for speed and privacy, and are designed to be simple enough for anyone to use.
        </p>
      </section>
    </div>
  );
}
