"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { HowToUse } from '@/components/how-to-use';
import { Faq } from '@/components/faq';

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const howToUseSteps = [
    { title: "Step 1: Upload Your Image", description: "Select any JPG, PNG, or WEBP image you want to compress." },
    { title: "Step 2: Adjust Quality", description: "Move the 'Quality' slider. As you move it, you'll see a real-time preview of the compressed image and the new file size." },
    { title: "Step 3: Compare Sizes", description: "Check the info card to see the original size, the new compressed size, and the percentage of file size reduction." },
    { title: "Step 4: Download", description: "When you've found the perfect balance of quality and file size, click the 'Download Image' button." },
];

const faqItems = [
    { question: "What does 'quality' mean?", answer: "Quality refers to the level of compression. A lower quality value (e.g., 20%) will result in a much smaller file size but may have visible artifacts. A higher value (e.g., 90%) will look almost identical to the original but have a larger file size." },
    { question: "Will this reduce the image dimensions (width/height)?", answer: "No, this tool only reduces the file size (in KB/MB). To change the dimensions, please use our Image Resizer tool." },
    { question: "Is there a quality loss when compressing?", answer: "Yes, for formats like JPEG, compression is 'lossy,' meaning some data is discarded to save space. For PNGs, the compression is 'lossless' but may not reduce file size as dramatically. The preview helps you see how much quality is lost." },
    { question: "Are my images stored on your server?", answer: "No. All compression is done in your browser. Your images are never uploaded or stored by us." },
];


export default function CompressPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<{dataUrl: string, file: File} | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [quality, setQuality] = useState(80);
    const [originalSize, setOriginalSize] = useState<number | null>(null);
    const [compressedSize, setCompressedSize] = useState<number | null>(null);

    const imageRef = useRef<HTMLImageElement | null>(null);
    const processTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const handleImageUpload = (image: string | null, file: File | null) => {
        if (processTimeoutRef.current) {
            clearTimeout(processTimeoutRef.current);
        }
        if (image && file) {
            setOriginalImage({ dataUrl: image, file });
            setOriginalSize(file.size);
            setProcessedImage(image); 
            setCompressedSize(file.size);
            
            const img = new Image();
            img.src = image;
            img.onload = () => {
                imageRef.current = img;
            }
        } else {
            setOriginalImage(null);
            setOriginalSize(null);
            setProcessedImage(null);
            setCompressedSize(null);
            imageRef.current = null;
        }
    };
    
    const processImage = useCallback(() => {
        if (!originalImage || !imageRef.current) return;

        setIsProcessing(true);
        if (processTimeoutRef.current) {
            clearTimeout(processTimeoutRef.current);
        }

        processTimeoutRef.current = setTimeout(() => {
            try {
                const img = imageRef.current!;
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error("Could not get canvas context");

                ctx.drawImage(img, 0, 0);
                
                const mimeType = originalImage.file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                
                const dataUrl = canvas.toDataURL(mimeType, quality / 100);
                setProcessedImage(dataUrl);

                canvas.toBlob((blob) => {
                    if(blob) setCompressedSize(blob.size);
                }, mimeType, quality / 100);

            } catch(e: any) {
                console.error(e);
                toast({
                    variant: "destructive",
                    title: "Compression Error",
                    description: e.message || "Could not compress the image.",
                });
            } finally {
                setIsProcessing(false);
            }
        }, 50);

    }, [originalImage, quality, toast]);


    useEffect(() => {
        if (originalImage) {
            processImage();
        }
    }, [quality, originalImage, processImage]);

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        const extension = (originalImage?.file.type === 'image/png' ? 'png' : 'jpg');
        link.download = `compressed-image.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasImage = !!originalImage;
    const reductionPercent = originalSize && compressedSize ? Math.round(((originalSize - compressedSize) / originalSize) * 100) : 0;

    return (
        <ToolLayout
            title="Image Compressor"
            description="Reduce image file size with an interactive quality preview."
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
                        <Label htmlFor="quality" className="flex justify-between items-center mb-2">
                            <span>Quality</span>
                            <span className="font-bold">{quality}%</span>
                        </Label>
                        <Slider 
                            id="quality" 
                            value={[quality]} 
                            onValueChange={(val) => setQuality(val[0])} 
                            max={100}
                            min={0}
                            step={1} 
                        />
                         <p className="text-xs text-muted-foreground mt-2">
                           Lower quality means a smaller file size.
                         </p>
                    </div>

                    <Card className="bg-muted/50">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Original Size:</span>
                                <span className="font-mono font-medium">{originalSize ? formatFileSize(originalSize) : '...'}</span>
                            </div>
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Compressed Size:</span>
                                <span className="font-mono font-medium">{isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : (compressedSize ? formatFileSize(compressedSize) : '...') }</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold text-primary">
                                <span>Reduction:</span>
                                <span>
                                    {reductionPercent > 0 ? `${reductionPercent}%` : '0%'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4 !mt-8">
                        <Button onClick={handleDownload} disabled={isProcessing || !processedImage || processedImage === originalImage?.dataUrl} variant="secondary">
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
