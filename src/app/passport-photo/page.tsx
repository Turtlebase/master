import ToolLayout from "@/components/tool-layout";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function PassportPhotoPage() {
    return (
        <ToolLayout
            title="Passport Photo Tool"
            description="Crop and resize photos for any official ID with standard presets."
        >
            {(image) => (
                <>
                    {image && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="ratio">Choose Format</Label>
                                <Select>
                                    <SelectTrigger id="ratio">
                                        <SelectValue placeholder="Select a format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="us">US Passport (2x2 in)</SelectItem>
                                        <SelectItem value="uk">UK Passport (35x45 mm)</SelectItem>
                                        <SelectItem value="in">India Passport (35x45 mm)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                <Label htmlFor="white-bg">White Background</Label>
                                <Switch id="white-bg" />
                            </div>
                        </div>
                    )}
                </>
            )}
        </ToolLayout>
    );
}
