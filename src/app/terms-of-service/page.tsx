import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for ImageCon.pro. By using our services, you agree to these terms.',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 animate-fade-in-up">
       <div className="max-w-4xl mx-auto prose prose-invert prose-headings:font-headline prose-headings:text-primary prose-a:text-primary">
        <h1>Terms of Service</h1>
        <p>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p>
          Welcome to ImageCon.pro. These Terms of Service ("Terms") govern your use of our website and services (the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
        </p>

        <h2>1. Use of Services</h2>
        <p>
          Our Services are provided free of charge for personal and commercial use. You agree to use our Services in compliance with all applicable laws and regulations. You are solely responsible for the content (e.g., images) you process through our Services.
        </p>

        <h2>2. Prohibited Conduct</h2>
        <p>You agree not to use the Services to:</p>
        <ul>
          <li>Process any content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</li>
          <li>Infringe upon the intellectual property rights of others. You must have the legal right to use any images you process with our tools.</li>
          <li>Attempt to gain unauthorized access to our systems or engage in any activity that disrupts, diminishes the quality of, interferes with the performance of, or impairs the functionality of the Services.</li>
        </ul>

        <h2>3. AI-Powered Tools Disclaimer</h2>
        <p>
          Some of our tools use artificial intelligence. While powerful, AI can make mistakes. The output from tools like the AI Copyright Checker and Metadata Generator is for informational purposes only and is not a substitute for professional legal or SEO advice. You are responsible for verifying the accuracy and appropriateness of any AI-generated content.
        </p>

        <h2>4. Disclaimer of Warranties</h2>
        <p>
          The Services are provided "as is" and "as available" without any warranties of any kind, express or implied. We do not warrant that the Services will be uninterrupted, error-free, or completely secure. You use the Services at your own risk.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, ImageCon.pro shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, resulting from your use of the Services.
        </p>
        
        <h2>6. Intellectual Property</h2>
        <p>
          We do not claim ownership of the content you process through our Services. You retain all rights to your images. We own all rights to the website, design, and the underlying technology of the Services.
        </p>

        <h2>7. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will post the revised Terms on this page. By continuing to use the Services after the changes become effective, you agree to the revised Terms.
        </p>
         <h2>8. Contact</h2>
        <p>
          If you have any questions about these Terms, please see our <Link href="/contact">Contact Page</Link>.
        </p>
      </div>
    </div>
  );
}
