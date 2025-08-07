import { Metadata } from 'next';
import { Users, Target, Eye } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about the mission and values behind ImageCon.pro. We are dedicated to providing free, high-quality image editing tools for everyone.',
};

export default function AboutUsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 animate-fade-in-up">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-primary via-blue-400 to-blue-500 text-transparent bg-clip-text">
          About ImageCon.pro
        </h1>
        <p className="mt-4 text-center text-lg text-muted-foreground">
          Empowering creativity by making professional image editing tools accessible to everyone.
        </p>

        <div className="mt-12 prose prose-invert max-w-none prose-headings:font-headline prose-headings:text-primary prose-a:text-primary prose-strong:text-foreground">
          <p>
            In a world where visual content is king, we noticed a gap. Powerful image editing software was often expensive, complicated, or required downloads and installations. On the other end, free online tools were frequently cluttered with ads, applied ugly watermarks, or worse, compromised user privacy by storing personal images. <strong>ImageCon.pro was born from a simple idea: professional-grade image editing should be free, fast, and private.</strong>
          </p>
          
          <div className="my-12 grid md:grid-cols-3 gap-8 text-center">
            <div className="border border-border/50 rounded-xl p-6">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Target className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-headline">Our Mission</h2>
              <p className="text-muted-foreground">To provide a comprehensive suite of powerful, easy-to-use image editing tools that are freely accessible to everyone, regardless of their technical skill.</p>
            </div>
            <div className="border border-border/50 rounded-xl p-6">
               <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                   <Eye className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-headline">Our Vision</h2>
              <p className="text-muted-foreground">To be the web's #1 destination for quick, private, and high-quality image processing, fostering creativity for students, professionals, and hobbyists alike.</p>
            </div>
            <div className="border border-border/50 rounded-xl p-6">
               <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                   <Users className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-headline">Our Commitment</h2>
              <p className="text-muted-foreground">We are committed to your privacy. All tools on this site perform their magic directly in your browser. We never upload, see, or store your images.</p>
            </div>
          </div>

          <h3>Why Choose Us?</h3>
          <ul>
            <li><strong>100% Free:</strong> No subscriptions, no fees, no premium-only features. All tools are fully functional for everyone.</li>
            <li><strong>Privacy First:</strong> All processing is done client-side. Your images never leave your computer.</li>
            <li><strong>No Watermarks:</strong> The images you create are yours. We'll never add our branding to your work.</li>
            <li><strong>No Sign-up Required:</strong> Get straight to work without creating an account.</li>
            <li><strong>High-Quality Tools:</strong> We use advanced algorithms to ensure your results look professional every time.</li>
          </ul>
          <p>
            Thank you for using ImageCon.pro. We're excited to see what you create!
          </p>
        </div>
      </div>
    </div>
  );
}
