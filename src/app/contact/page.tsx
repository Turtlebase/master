import { Metadata } from 'next';
import { Mail, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the ImageCon.pro team. We welcome your feedback, questions, and suggestions.',
};

export default function ContactUsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 animate-fade-in-up">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-primary via-blue-400 to-blue-500 text-transparent bg-clip-text">
          Contact Us
        </h1>
        <p className="mt-4 text-center text-lg text-muted-foreground">
          We'd love to hear from you! Whether you have a question, feedback, or a suggestion, please don't hesitate to reach out.
        </p>

        <Card className="mt-12 shadow-2xl shadow-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
              <Mail className="w-7 h-7 text-primary" />
              <span>General Inquiries & Support</span>
            </CardTitle>
            <CardDescription>
              For all questions, feedback, and support requests, the best way to reach us is by email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              Please send your email to:
            </p>
            <a 
              href="mailto:contact@imagecon.pro" 
              className="mt-2 inline-block text-xl font-bold text-primary hover:underline"
            >
              contact@imagecon.pro
            </a>
            <p className="mt-4 text-sm text-muted-foreground">
              We do our best to respond to all inquiries within 48 business hours. Your feedback is important to us and helps us improve our tools for everyone.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-8 shadow-2xl shadow-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
              <HelpCircle className="w-7 h-7 text-primary" />
              <span>Frequently Asked Questions</span>
            </CardTitle>
             <CardDescription>
              Before reaching out, you might find an answer to your question below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Is ImageCon.pro really free?</h3>
                <p className="text-muted-foreground">Yes, 100%. All our tools are completely free to use without any limitations or watermarks.</p>
              </div>
               <div>
                <h3 className="font-semibold">Is it safe to use? Do you store my images?</h3>
                <p className="text-muted-foreground">Your privacy is our top priority. All image processing happens directly in your browser. We never upload or store your images on our servers. Once you close the page, the image is gone.</p>
              </div>
               <div>
                <h3 className="font-semibold">Can I use the images for commercial purposes?</h3>
                <p className="text-muted-foreground">Yes. You retain full ownership of your images and the edits you make. You can use them for any personal or commercial project.</p>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
