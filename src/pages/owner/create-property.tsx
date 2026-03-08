import { type FormEvent, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProperty } from "@/hooks/use-properties";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, X } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function CreateProperty() {
    const navigate = useNavigate();
    const mutation = useCreateProperty();
    const [amenities, setAmenities] = useState("");
    const [rules, setRules] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const today = now.toISOString().split("T")[0];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const total = selectedFiles.length + files.length;
        if (total > 4) {
            toast.error("Maximum 4 images allowed");
            return;
        }
        setSelectedFiles((prev) => [...prev, ...files]);
        // Reset input so user can select more
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", fd.get("title") as string);
            formData.append("description", fd.get("description") as string);
            formData.append("location", fd.get("location") as string);
            formData.append("city", fd.get("city") as string);
            formData.append("rent", fd.get("rent") as string);
            formData.append("deposit", (fd.get("deposit") as string) || "0");

            const availableFrom = fd.get("availableFrom") as string;
            if (availableFrom) formData.append("availableFrom", availableFrom);

            const amenityList = amenities.split(",").map((s) => s.trim()).filter(Boolean);
            formData.append("amenities", JSON.stringify(amenityList));

            const ruleList = rules.split(",").map((s) => s.trim()).filter(Boolean);
            formData.append("rules", JSON.stringify(ruleList));

            // Append image files
            for (const file of selectedFiles) {
                formData.append("images", file);
            }

            await mutation.mutateAsync(formData);
            toast.success("Property submitted for review");
            navigate("/owner/properties");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to create property");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-1 size-4" /> Back
            </Button>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>New Property Listing</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" placeholder="2BHK in Andheri" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" name="city" placeholder="Mumbai" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Full Address</Label>
                            <Input
                                id="location"
                                name="location"
                                placeholder="123, ABC Road, Andheri West"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe the property…"
                                rows={4}
                                required
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="rent">Rent (₹/mo)</Label>
                                <Input id="rent" name="rent" type="number" placeholder="15000" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deposit">Deposit (₹)</Label>
                                <Input id="deposit" name="deposit" type="number" placeholder="30000" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="availableFrom">Available From</Label>
                                <Input id="availableFrom" name="availableFrom" type="date" min={today} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                            <Input
                                id="amenities"
                                value={amenities}
                                onChange={(e) => setAmenities(e.target.value)}
                                placeholder="WiFi, Parking, Gym"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rules">Rules (comma-separated)</Label>
                            <Input
                                id="rules"
                                value={rules}
                                onChange={(e) => setRules(e.target.value)}
                                placeholder="No pets, No smoking"
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>Property Images (max 4)</Label>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                                disabled={selectedFiles.length >= 4}
                            />
                            {selectedFiles.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {selectedFiles.map((file, i) => (
                                        <div key={i} className="group relative aspect-video overflow-hidden rounded-lg border">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(i)}
                                                className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <X className="size-3" />
                                            </button>
                                            <span className="absolute bottom-0 left-0 right-0 truncate bg-black/50 px-1 text-xs text-white">
                                                {file.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {selectedFiles.length}/4 images selected
                            </p>
                        </div>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating…" : "Create Property"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
