import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { PT_Sans, Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const fontBody = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});

const fontHeadline = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-headline",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://imagecon.pro';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ImageCon.pro - The Ultimate Free Image Toolbox",
    template: "%s | ImageCon.pro",
  },
  description:
    "Edit, sketch, resize, crop, and enhance your images with our suite of free, professional-grade online tools. No signup, no watermarks, 100% free.",
  keywords: ["image editor", "free tools", "image compressor", "image resizer", "background blur", "tattoo stencil", "coloring page", "passport photo", "image crop", "online image editor", "ai image tools", "background remover", "seo metadata generator", "copyright checker"],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "ImageCon.pro - The Ultimate Free Image Toolbox",
    description: "The complete suite of free, professional-grade image editing tools. Edit, resize, crop, and much more.",
    url: siteUrl,
    siteName: "ImageCon.pro",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "ImageCon.pro - Free Image Toolbox",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ImageCon.pro - The Ultimate Free Image Toolbox",
    description: "The complete suite of free, professional-grade image editing tools. Edit, resize, crop, and much more.",
    images: [`${siteUrl}/og-image.png`],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteUrl}/site.webmanifest`,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head />
      <body
        className={cn(
          "font-body antialiased",
          fontBody.variable,
          fontHeadline.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
