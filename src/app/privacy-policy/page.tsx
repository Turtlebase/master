import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for ImageCon.pro. We are committed to protecting your privacy. We do not store any user-uploaded images for most tools. See policy for AI tool details.',
  robots: {
    index: true,
    follow: true,
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 animate-fade-in-up">
      <div className="max-w-4xl mx-auto prose prose-invert prose-headings:font-headline prose-headings:text-primary prose-a:text-primary">
        <h1>Privacy Policy</h1>
        <p>Last Updated: July 26, 2024</p>

        <p>
          ImageCon.pro ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our website and services (the "Services").
        </p>

        <h2>1. Information Handling</h2>
        <p>Our tools can be separated into two categories regarding data handling:</p>
        
        <h3>A. Client-Side Tools (No Uploads)</h3>
        <p>
          The vast majority of our tools (including the Resizer, Cropper, Filter Applicator, Compressor, Coloring Page Converter, and Tattoo Stencil Maker) operate entirely within your web browser. 
        </p>
        <ul>
            <li>We do **not** collect, store, or transmit any images you use with these tools.</li>
            <li>Your images **never** leave your computer.</li>
            <li>Once you close your browser tab, the image data is gone.</li>
        </ul>

        <h3>B. Server-Side AI Tools (Temporary Processing)</h3>
        <p>
          A few of our advanced tools (AI Background Remover, AI Metadata Generator, AI Copyright Checker, Passport Photo Tool) require server-side processing to perform their function.
        </p>
        <ul>
            <li>To use these tools, your image is sent to our backend services and those of our AI service providers (like Google Gemini).</li>
            <li>The images are used **solely** for the purpose of analysis and generating the result you requested.</li>
            <li>We do **not** store your images on our servers after the processing is complete. Our AI providers may temporarily cache data for operational purposes, but do not use your images to train their models.</li>
            <li>We do not attach any personally identifiable information to the images we process.</li>
        </ul>
        

        <h2>2. Anonymous Usage Analytics</h2>
        <p>
          We may collect anonymous usage data to understand how our visitors use our website and to improve the Service. This information is aggregated and cannot be used to identify you personally. This may include:
        </p>
        <ul>
          <li>The number of visits to a specific tool.</li>
          <li>The browser type and operating system.</li>
          <li>General geographic location (e.g., country).</li>
        </ul>
        <p>
          We do not use cookies for tracking individuals across different websites.
        </p>

        <h2>3. Third-Party Services (Advertising)</h2>
        <p>
          We may use third-party advertising companies to serve ads when you visit our website. These companies may use aggregated information about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
        </p>

        <h2>4. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
        </p>

        <h2>5. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please see our <Link href="/contact">Contact Page</Link>.
        </p>
      </div>
    </div>
  );
}
