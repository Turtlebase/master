
"use client";

import { useState, useCallback, useRef } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HowToUse } from '@/components/how-to-use';
import { Faq } from '@/components/faq';
import { Card, CardContent } from '@/components/ui/card';

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const conversionOptions = [
    { value: 'png', label: 'PNG', mime: 'image/png' },
    { value: 'jpeg', label: 'JPG', mime: 'image/jpeg' },
    { value: 'webp', label: 'WebP', mime: 'image/webp' },
    { value: 'bmp', label: 'BMP', mime: 'image/bmp' },
    { value: 'gif', label: 'GIF', mime: 'image/gif' },
];

const howToUseSteps = [
    { title: "Step 1: Upload Your Image", description: "Click the upload area to select any image file from your device." },
    { title: "Step 2: Choose Output Format", description: "Select your desired format (e.g., JPG, PNG, WebP) from the dropdown menu." },
    { title: "Step 3: Convert Image", description: "The tool will automatically convert the image. You'll see a preview of the converted file and its new size." },
    { title: "Step 4: Download", description: "Click the 'Download Image' button to save the file in its new format." },
];

const faqItems = [
    { question: "Which image formats can I upload?", answer: "You can upload most standard image formats, including JPG, PNG, WebP, SVG, and GIF. The tool will then convert it to your chosen output format." },
    { question: "What is the difference between JPG, PNG, and WebP?", answer: "JPG is best for photos and offers good compression. PNG is 'lossless' and supports transparency, making it great for graphics and logos. WebP is a modern format that offers excellent compression for both photos and graphics, often resulting in smaller file sizes than JPG and PNG." },
    { question: "Will converting to a different format affect my image quality?", answer: "It can. Converting from a high-quality format like PNG to a 'lossy' format like JPG may reduce quality slightly to achieve a smaller file size. The conversion is done at high quality to minimize this." },
    { question: "Is this tool private and secure?", answer: "Yes. All conversions happen directly in your browser. Your images are never uploaded to any servers, so your data remains completely private." },
];

export default function ImageConverterPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<{dataUrl: string, file: File} | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [outputFormat, setOutputFormat] = useState('png');
    
    const [originalSize, setOriginalSize] = useState<number | null>(null);
    const [convertedSize, setConvertedSize] = useState<number | null>(null);

    const imageRef = useRef<HTMLImageElement | null>(null);
    
    const handleImageUpload = (image: string | null, file: File | null) => {
        if (image && file) {
            setOriginalImage({ dataUrl: image, file });
            setOriginalSize(file.size);
            
            const img = new Image();
            img.src = image;
            img.onload = () => {
                imageRef.current = img;
                convertImage('png', img); 
            }
            img.onerror = () => {
                 toast({ variant: "destructive", title: "Error", description: "Could not load the image." });
            }
        } else {
            setOriginalImage(null);
            setOriginalSize(null);
            setProcessedImage(null);
            setConvertedSize(null);
            imageRef.current = null;
        }
    };
    
    const convertImage = useCallback((format: string, image: HTMLImageElement) => {
        if (!image) return;

        setIsProcessing(true);
        setTimeout(() => {
            try {
                const mimeType = conversionOptions.find(opt => opt.value === format)?.mime || 'image/png';
                
                const canvas = document.createElement('canvas');
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error("Could not get canvas context");
                
                // For formats like PNG that have transparency, draw a white background first
                // if the original was not a transparent format.
                if (mimeType !== 'image/png' || originalImage?.file.type !== 'image/png') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.drawImage(image, 0, 0);
                
                const dataUrl = canvas.toDataURL(mimeType, 0.95);
                setProcessedImage(dataUrl);

                canvas.toBlob((blob) => {
                    if(blob) setConvertedSize(blob.size);
                }, mimeType, 0.95);

            } catch(e: any) {
                console.error(e);
                toast({
                    variant: "destructive",
                    title: "Conversion Error",
                    description: e.message || "Could not convert the image. The format may not be supported.",
                });
            } finally {
                setIsProcessing(false);
            }
        }, 50);

    }, [toast, originalImage]);


    const handleFormatChange = (format: string) => {
        setOutputFormat(format);
        if (imageRef.current) {
            convertImage(format, imageRef.current);
        }
    }

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `converted-image.${outputFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasImage = !!originalImage;

    return (
        <ToolLayout
            title="Image Converter"
            description="Convert your images to JPG, PNG, WebP, and more."
            onImageUpload={(img, file) => handleImageUpload(img, file)}
            processedImage={processedImage}
            isProcessing={isProcessing}
            showReset={hasImage}
            hideUpload={hasImage}
            howToUse={<HowToUse steps={howToUseSteps} />}
            faq={<Faq items={faqItems} />}
        >
            {hasImage ? (
                <div className="space-y-6">
                    <div>
                        <Label htmlFor="format">Convert To</Label>
                        <Select onValueChange={handleFormatChange} defaultValue={outputFormat}>
                            <SelectTrigger id="format">
                                <SelectValue placeholder="Select a format" />
                            </SelectTrigger>
                            <SelectContent>
                                {conversionOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Card className="bg-muted/50">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Original Size:</span>
                                <span className="font-mono font-medium">{originalSize ? formatFileSize(originalSize) : '...'}</span>
                            </div>
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Converted Size:</span>
                                <span className="font-mono font-medium">{isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : (convertedSize ? formatFileSize(convertedSize) : '...') }</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4 !mt-8">
                        <Button onClick={handleDownload} disabled={isProcessing || !processedImage} variant="secondary">
                            <Download />
                            Download Image
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Upload an image to get started.</p>
            )}
        </ToolLayout>
    );
}
