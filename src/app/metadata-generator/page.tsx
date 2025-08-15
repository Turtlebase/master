
"use client";

import { useState, useEffect } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Button } from '@/components/ui/button';
import { Copy, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HowToUse } from '@/components/how-to-use';
import { Faq } from '@/components/faq';
import { generateMetadata, GenerateMetadataOutput } from '@/ai/flows/generate-metadata-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const howToUseSteps = [
    { title: "Step 1: Upload Your Image", description: "Select the photo you want to generate metadata for. The AI will analyze the image's content." },
    { title: "Step 2: Generate Metadata", description: "Click the 'Generate Metadata' button. The AI will create a title, description, and tags optimized for SEO." },
    { title: "Step 3: Review and Copy", description: "The generated content will appear in the fields. Use the copy buttons to easily grab the text you need for your website, blog, or social media." },
];

const faqItems = [
    { question: "How does the AI work?", answer: "The tool uses a powerful multimodal AI model that can understand the content and context of images. It's trained to generate human-like text that is not only descriptive but also optimized for search engines." },
    { question: "Can I use this for my business?", answer: "Absolutely! The generated metadata is perfect for e-commerce product listings, blog post images, social media updates, and any other commercial use case where image SEO is important." },
    { question: "What happens to my images?", answer: "Your images are sent to our AI provider for analysis and are not stored by us. Please refer to our privacy policy for more details." },
    { question: "Is the generated content unique?", answer: "Yes, the AI generates unique content for each image. However, we always recommend reviewing and adding your own touch to the text to perfectly match your brand's voice." },
];


export default function MetadataGeneratorPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedData, setGeneratedData] = useState<GenerateMetadataOutput | null>(null);

    useEffect(() => {
        document.title = "AI Image Metadata Generator | ImageCon.pro";
    }, []);

    const handleImageUpload = (image: string | null) => {
        setOriginalImage(image);
        setGeneratedData(null);
    }
    
    const handleGenerate = async () => {
        if (!originalImage) {
            toast({
                variant: "destructive",
                title: "No Image",
                description: "Please upload an image first.",
            });
            return;
        }

        setIsProcessing(true);
        setGeneratedData(null);

        try {
            const result = await generateMetadata({ photoDataUri: originalImage });
            setGeneratedData(result);
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "AI Generation Failed",
                description: error.message || "An unexpected error occurred while generating metadata.",
            });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "The text has been copied to your clipboard.",
        });
    }

    const hasImage = !!originalImage;

    return (
        <ToolLayout
            title="AI Image Metadata Generator"
            description="Generate SEO-optimized titles, descriptions, and tags for your images for free. Boost your online visibility with AI."
            onImageUpload={handleImageUpload}
            isProcessing={false}
            showReset={hasImage}
            hideUpload={hasImage}
            processedImage={originalImage}
            howToUse={<HowToUse steps={howToUseSteps} />}
            faq={<Faq items={faqItems} />}
        >
            <div className="space-y-6">
                {hasImage ? (
                    <>
                        <Card>
                            <CardContent className="p-4">
                                <Button onClick={handleGenerate} disabled={isProcessing} className="w-full">
                                    {isProcessing ? <Wand2 className="animate-spin" /> : <Sparkles />}
                                    {isProcessing ? 'Generating...' : 'Generate Metadata'}
                                </Button>
                            </CardContent>
                        </Card>
                        
                        {isProcessing && <MetadataSkeleton />}

                        {generatedData && (
                            <Card className="bg-muted/30">
                                <CardHeader>
                                    <CardTitle className="font-headline text-xl">Generated Metadata</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">SEO Title</Label>
                                        <div className="relative">
                                            <Input id="title" value={generatedData.title} readOnly />
                                            <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => handleCopy(generatedData.title)}><Copy /></Button>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <div className="relative">
                                            <Textarea id="description" value={generatedData.description} readOnly className="h-36" />
                                            <Button size="icon" variant="ghost" className="absolute right-1 top-2 h-7 w-7" onClick={() => handleCopy(generatedData.description)}><Copy /></Button>
                                        </div>
                                    </div>
                                     <div>
                                        <Label htmlFor="tags">Tags & Hashtags</Label>
                                        <div className="flex flex-wrap gap-2 rounded-lg border bg-background p-3 min-h-[40px]">
                                           {generatedData.tags.map(tag => (
                                                <Badge key={tag} variant="secondary">{tag}</Badge>
                                           ))}
                                        </div>
                                         <Button size="sm" variant="link" className="mt-1" onClick={() => handleCopy(generatedData.tags.join(', '))}>Copy as comma-separated</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">Upload an image to get started.</p>
                )}
            </div>
        </ToolLayout>
    );
}


function MetadataSkeleton() {
    return (
        <Card className="bg-muted/30">
            <CardHeader>
                <CardTitle className="font-headline text-xl">
                    <Skeleton className="h-7 w-48" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-36 w-full" />
                </div>
                <div>
                    <Skeleton className="h-5 w-28 mb-2" />
                     <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-28 rounded-full" />
                     </div>
                </div>
            </CardContent>
        </Card>
    )
}
