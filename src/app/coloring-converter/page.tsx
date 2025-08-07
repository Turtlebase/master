"use client";

import ToolLayout from "@/components/tool-layout";

export default function ColoringConverterPage() {
    return (
        <ToolLayout
            title="Coloring Book Converter"
            description="Turn any image into a line-art sketch, ready to be colored in."
        >
            {(image) => (
                <>
                    {image && (
                        <div>
                           <p className="text-sm text-muted-foreground">Your coloring page is ready. Use the download button to save it.</p>
                        </div>
                    )}
                </>
            )}
        </ToolLayout>
    );
}
