
"use client";

import { useState, useEffect } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Button } from '@/components/ui/button';
import { AlertCircle, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HowToUse } from '@/components/how-to-use';
import { Faq } from '@/components/faq';
import { checkCopyright, CopyrightCheckOutput } from '@/ai/flows/copyright-checker-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const howToUseSteps = [
    { title: "Step 1: Upload Your Image", description: "Select the photo you want to check for potential copyright issues." },
    { title: "Step 2: Start Analysis", description: "Click the 'Analyze for Copyright Risk' button. The AI will scan the image for protected elements like logos, characters, and more." },
    { title: "Step 3: Review the Assessment", description: "The AI will provide a risk level (Low, Medium, or High) along with a list of detected elements and an explanation. Use this information as a guide, not as legal advice." },
];

const faqItems = [
    { question: "Is this tool's assessment legal advice?", answer: "No, absolutely not. This tool is for informational purposes only and does not constitute legal advice. It uses AI to identify potential risks but cannot understand the full legal context. Always consult with a legal professional for copyright matters." },
    { question: "What kind of things can the AI detect?", answer: "The AI is trained to recognize a wide range of visual content, including well-known brand logos, popular characters from movies and comics, famous artworks, and distinct brand styles." },
    { question: "What if the tool says the risk is 'Low'?", answer: "A 'Low' risk assessment means the AI did not detect common copyrighted elements. This increases your confidence in using the image, but it is not a 100% guarantee. The final responsibility for using an image is always yours." },
    { question: "Will it detect the style of a famous artist?", answer: "It may. If an image's style is extremely similar to a very famous artist (e.g., Van Gogh), the AI might flag this as a 'Medium' risk, as an artist's style can have protections. This helps you be aware of potential issues with art that is 'in the style of' someone else." },
];

const riskLevelConfig = {
    Low: {
        color: 'bg-green-500',
        textColor: 'text-green-500',
        text: 'Low Risk',
        description: 'AI analysis did not detect any obvious copyrighted elements. This image is likely safe to use.',
    },
    Medium: {
        color: 'bg-yellow-500',
        textColor: 'text-yellow-500',
        text: 'Medium Risk',
        description: 'Caution advised. The image may contain elements that are protected or resemble copyrighted material.',
    },
    High: {
        color: 'bg-red-500',
        textColor: 'text-red-500',
        text: 'High Risk',
        description: 'Not recommended for use without a license. The image appears to contain clearly copyrighted material.',
    },
};

export default function CopyrightCheckerPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedData, setGeneratedData] = useState<CopyrightCheckOutput | null>(null);

     useEffect(() => {
        document.title = "AI Copyright Checker for Images | ImageCon.pro";
    }, []);

    const handleImageUpload = (image: string | null) => {
        setOriginalImage(image);
        setGeneratedData(null);
    }
    
    const handleGenerate = async () => {
        if (!originalImage) {
            toast({ variant: "destructive", title: "No Image", description: "Please upload an image first." });
            return;
        }

        setIsProcessing(true);
        setGeneratedData(null);

        try {
            const result = await checkCopyright({ photoDataUri: originalImage });
            setGeneratedData(result);
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "AI Analysis Failed", description: error.message || "An unexpected error occurred." });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const hasImage = !!originalImage;

    return (
        <ToolLayout
            title="AI Copyright Risk Assessment"
            description="Get a free AI-powered copyright risk assessment for your images. Our tool checks for logos, characters, and other protected elements to help you avoid issues."
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
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Disclaimer</AlertTitle>
                            <AlertDescription>
                                This AI-powered tool is for informational purposes only and is not legal advice. Always consult a legal professional for copyright matters.
                            </AlertDescription>
                        </Alert>

                        <Card>
                            <CardContent className="p-4">
                                <Button onClick={handleGenerate} disabled={isProcessing} className="w-full">
                                    {isProcessing ? <Wand2 className="animate-spin" /> : <ShieldCheck />}
                                    {isProcessing ? 'Analyzing...' : 'Analyze for Copyright Risk'}
                                </Button>
                            </CardContent>
                        </Card>
                        
                        {isProcessing && <AnalysisSkeleton />}

                        {generatedData && (
                            <Card className="bg-muted/30">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 font-headline text-xl">
                                        <span>Assessment Result</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 rounded-lg bg-background">
                                         <div className={cn("w-4 h-4 rounded-full", riskLevelConfig[generatedData.riskLevel].color)} />
                                         <span className={cn("text-lg font-bold", riskLevelConfig[generatedData.riskLevel].textColor)}>
                                            {riskLevelConfig[generatedData.riskLevel].text}
                                         </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{generatedData.reason}</p>

                                     <div>
                                        <h3 className="font-semibold mb-2">Detected Elements:</h3>
                                        <div className="space-y-3">
                                           {generatedData.detectedElements.map(element => (
                                                <div key={element.name} className="p-3 rounded-md border border-border/50 bg-background text-sm">
                                                    <p className="font-semibold">{element.name}</p>
                                                    <p className="text-muted-foreground">{element.description}</p>
                                                </div>
                                           ))}
                                        </div>
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


function AnalysisSkeleton() {
    return (
        <Card className="bg-muted/30">
            <CardHeader>
                 <Skeleton className="h-7 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center gap-3 p-4 rounded-lg bg-background">
                     <Skeleton className="w-4 h-4 rounded-full" />
                     <Skeleton className="h-6 w-24" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
                 <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                     <div className="space-y-3">
                        <Skeleton className="h-16 w-full rounded-md" />
                        <Skeleton className="h-16 w-full rounded-md" />
                     </div>
                </div>
            </CardContent>
        </Card>
    )
}
