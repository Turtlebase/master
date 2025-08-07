import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for ImageCon.pro. We are committed to protecting your privacy. We do not store any user-uploaded images.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 animate-fade-in-up">
      <div className="max-w-4xl mx-auto prose prose-invert prose-headings:font-headline prose-headings:text-primary prose-a:text-primary">
        <h1>Privacy Policy</h1>
        <p>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p>
          ImageCon.pro ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our website and services (the "Services").
        </p>

        <h2>1. No Data Collection or Storage</h2>
        <p>
          The core of our service is privacy. We do not collect, store, or transmit any personal data or any images you upload to our servers. All image processing is performed directly in your web browser (client-side).
        </p>
        <p>
          Once you close your browser window, the image you were working on is gone. We have no access to it at any point.
        </p>

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
          We may use third-party advertising companies, such as Google AdSense, to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
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
