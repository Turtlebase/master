
import { ToolCard } from '@/components/tool-card';
import { Button } from '@/components/ui/button';
import * as Icons from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';
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
  { name: 'AI Copyright Checker', description: 'Analyze images for potential copyright risks and get a risk assessment.', href: '/copyright-checker', icon: 'ShieldCheck' },
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
      <section className="relative overflow-hidden text-center py-20 md:py-28">
         <div className="absolute top-0 left-0 -z-10 h-full w-full bg-grid-white/[0.05]" />
         <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

        <div className="container mx-auto px-4">
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent">
            Your Ultimate Free Image Toolbox
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            Unleash your creativity with a full suite of professional-grade image editing tools. 100% free, private, and no signup required.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="font-semibold text-lg py-7 px-10 transition-all duration-300 transform hover:scale-105">
              <Link href="#tools">Explore All Tools</Link>
            </Button>
          </div>
           <div className="mt-12 flex justify-center items-center flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>100% Free, No Watermarks</span>
              </div>
              <div className="flex items-center gap-2">
                 <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Client-Side for Privacy</span>
              </div>
               <div className="flex items-center gap-2">
                 <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No Signup Required</span>
              </div>
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
