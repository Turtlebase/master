"use client";

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onImageUpload: (image: string | null, file: File | null) => void;
  processedImage?: string | null;
  isProcessing?: boolean;
  showReset?: boolean;
  hideUpload?: boolean;
  imageContainerChildren?: React.ReactNode;
}

export default function ToolLayout({ 
    title, 
    description, 
    children, 
    onImageUpload, 
    processedImage,
    isProcessing = false,
    showReset = false,
    hideUpload = false,
    imageContainerChildren,
}: ToolLayoutProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if(e.target?.result) {
            onImageUpload(e.target.result as string, file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  
  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files);
  }, [handleFileChange]);

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const onReset = () => {
    onImageUpload(null, null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const displayImage = processedImage;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-fade-in-up">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-blue-400 to-blue-500 text-transparent bg-clip-text">{title}</h1>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">{description}</p>
        </div>

        {hideUpload ? null : (
            !showReset && (
                 <div 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={onButtonClick}
                    className={`relative flex flex-col items-center justify-center w-full p-12 lg:p-24 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${dragOver ? 'border-primary bg-primary/10 scale-105' : 'border-border hover:border-primary/50'}`}
                >
                    <UploadCloud className="w-16 h-16 text-muted-foreground mb-4 transition-transform duration-300 ${dragOver ? 'transform -translate-y-2' : ''}" />
                    <h2 className="text-xl font-semibold">Drag & drop your image here</h2>
                    <p className="text-muted-foreground">or click to browse</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files)}
                    />
                </div>
            )
        )}
          
        {showReset && (
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 relative group bg-card/50 p-4 rounded-xl shadow-lg border border-border/50 min-h-[400px] flex items-center justify-center">
                    {isProcessing && (
                         <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-20 rounded-lg">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <p className="mt-4 text-lg font-semibold">Processing...</p>
                        </div>
                    )}

                    {imageContainerChildren ? imageContainerChildren : (
                        displayImage ? (
                            <Image
                                src={displayImage}
                                alt="Processed image"
                                width={800}
                                height={800}
                                className={`rounded-lg object-contain w-full max-h-[70vh] transition-opacity duration-300 ${isProcessing ? 'opacity-20' : 'opacity-100'}`}
                            />
                        ): <Skeleton className="w-full h-full min-h-[400px] rounded-lg absolute inset-0" />
                    )}

                    {showReset && (
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={onReset}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
                <div className="flex flex-col gap-6 relative lg:sticky lg:top-24">
                    <Card className="shadow-2xl shadow-black/50 border-border/50">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Controls</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {children}
                        </CardContent>
                    </Card>
                </div>
            </div>
          )}
      </div>
    </div>
  );
}
