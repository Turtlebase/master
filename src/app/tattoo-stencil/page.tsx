import ToolLayout from "@/components/tool-layout";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function TattooStencilPage() {
    return (
        <ToolLayout
            title="Tattoo Stencil Maker"
            description="Convert your photo to a black & white stencil with adjustable edge detection."
        >
            {(image) => (
                <>
                    {image && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="threshold">Edge Threshold</Label>
                                <Slider id="threshold" defaultValue={[50]} max={100} step={1} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </ToolLayout>
    );
}
