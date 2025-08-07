"use client";

import ToolLayout from "@/components/tool-layout";
import { Button } from "@/components/ui/button";

export default function FiltersPage() {
    return (
        <ToolLayout
            title="Image Filters"
            description="Apply classic filters like Grayscale and Sepia to give your photos a new look."
        >
            {(image) => (
                <>
                    {image && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline">Grayscale</Button>
                                <Button variant="outline">Sepia</Button>
                                <Button variant="outline">Invert</Button>
                                <Button variant="outline">Vintage</Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </ToolLayout>
    );
}
