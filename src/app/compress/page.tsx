"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import ToolLayout from "@/components/tool-layout";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Download, Loader2, Wand2, FileDigit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function CompressPage() {
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<{dataUrl: string, file: File} | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [quality, setQuality] = useState(80);
    const [originalSize, setOriginalSize] = useState<number | null>(null);
    const [compressedSize, setCompressedSize] = useState<number | null>(null);

    const imageRef = useRef<HTMLImageElement>(null);
    
    const handleImageUpload = (image: string | null, file: File | null) => {
        if (image && file) {
            setOriginalImage({ dataUrl: image, file });
            setOriginalSize(file.size);
            setProcessedImage(null);
            setCompressedSize(null);
            
            const img = new Image();
            img.src = image;
            img.onload = () => {
                imageRef.current = img;
                estimateCompressedSize(img, quality, file.type);
            }
        } else {
            setOriginalImage(null);
            setOriginalSize(null);
            setProcessedImage(null);
            setCompressedSize(null);
            imageRef.current = null;
        }
    };

    const estimateCompressedSize = useCallback(async (imageElement: HTMLImageElement, currentQuality: number, mimeType: string) => {
        const canvas = document.createElement('canvas');
        canvas.width = imageElement.naturalWidth;
        canvas.height = imageElement.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(imageElement, 0, 0);

        canvas.toBlob((blob) => {
            if (blob) {
                setCompressedSize(blob.size);
            }
        }, mimeType, currentQuality / 100);

    }, []);

    useEffect(() => {
        if (originalImage && imageRef.current) {
            estimateCompressedSize(imageRef.current, quality, originalImage.file.type);
        }
    }, [quality, originalImage, estimateCompressedSize]);

    const processImage = useCallback(() => {
        if (!originalImage || !imageRef.current) {
            toast({
                variant: "destructive",
                title: "No Image",
                description: "Please upload an image first.",
            });
            return;
        }

        setIsProcessing(true);
        setProcessedImage(null);

        setTimeout(() => {
            try {
                const img = imageRef.current!;
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error("Could not get canvas context");

                ctx.drawImage(img, 0, 0);
                
                const mimeType = originalImage.file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                
                const dataUrl = canvas.toDataURL(mimeType, quality / 100);
                setProcessedImage(dataUrl);

                // For a more accurate final size
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
        }, 100);

    }, [originalImage, quality, toast]);

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
            processedImage={processedImage || originalImage?.dataUrl}
            isProcessing={isProcessing}
            showReset={hasImage}
            hideUpload={hasImage}
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
                                <span className="font-mono font-medium">{compressedSize ? formatFileSize(compressedSize) : '...'}</span>
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
                        <Button onClick={processImage} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
                            Compress Image
                        </Button>
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
