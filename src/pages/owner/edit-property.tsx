import { type FormEvent, useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePropertyById, useUpdateProperty } from "@/hooks/use-properties";
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

export default function EditProperty() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: property, isLoading } = usePropertyById(id!);
    const mutation = useUpdateProperty();
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const today = now.toISOString().split("T")[0];

    const [amenities, setAmenities] = useState("");
    const [rules, setRules] = useState("");

    // Existing images (from Cloudinary) the user wants to keep
    const [existingImages, setExistingImages] = useState<string[]>([]);
    // New files to upload
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const totalImages = existingImages.length + newFiles.length;

    useEffect(() => {
        if (property) {
            setAmenities(property.amenities.join(", "));
            setRules(property.rules.join(", "));
            setExistingImages(property.images || []);
        }
    }, [property]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const total = existingImages.length + newFiles.length + files.length;
        if (total > 4) {
            toast.error(`Maximum 4 images allowed. You can add ${4 - existingImages.length - newFiles.length} more.`);
            return;
        }
        setNewFiles((prev) => [...prev, ...files]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeExistingImage = (index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeNewFile = (index: number) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
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

            // Tell backend which existing images to keep
            formData.append("existingImages", JSON.stringify(existingImages));

            // Append new image files
            for (const file of newFiles) {
                formData.append("images", file);
            }

            await mutation.mutateAsync({ id: id!, formData });
            toast.success("Property updated");
            navigate("/owner/properties");
        } catch {
            toast.error("Failed to update property");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!property) {
        return <div className="py-12 text-center text-muted-foreground">Property not found.</div>;
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-1 size-4" /> Back
            </Button>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Edit Property</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" defaultValue={property.title} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" name="city" defaultValue={property.city} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Full Address</Label>
                            <Input id="location" name="location" defaultValue={property.location} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={property.description} rows={4} required />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="rent">Rent (₹/mo)</Label>
                                <Input id="rent" name="rent" type="number" defaultValue={property.rent} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deposit">Deposit (₹)</Label>
                                <Input id="deposit" name="deposit" type="number" defaultValue={property.deposit} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="availableFrom">Available From</Label>
                                <Input
                                    id="availableFrom"
                                    name="availableFrom"
                                    type="date"
                                    min={today}
                                    defaultValue={
                                        property.availableFrom
                                            ? new Date(property.availableFrom).toISOString().split("T")[0]
                                            : ""
                                    }
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Amenities (comma-separated)</Label>
                            <Input value={amenities} onChange={(e) => setAmenities(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Rules (comma-separated)</Label>
                            <Input value={rules} onChange={(e) => setRules(e.target.value)} />
                        </div>

                        {/* Image Management */}
                        <div className="space-y-2">
                            <Label>Property Images (max 4)</Label>

                            {/* Existing images */}
                            {existingImages.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {existingImages.map((url, i) => (
                                        <div key={url} className="group relative aspect-video overflow-hidden rounded-lg border">
                                            <img
                                                src={url}
                                                alt={`Image ${i + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(i)}
                                                className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <X className="size-3" />
                                            </button>
                                            <span className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 text-center text-[10px] text-white">
                                                Existing
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New file previews */}
                            {newFiles.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {newFiles.map((file, i) => (
                                        <div key={i} className="group relative aspect-video overflow-hidden rounded-lg border border-dashed border-primary/40">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewFile(i)}
                                                className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <X className="size-3" />
                                            </button>
                                            <span className="absolute bottom-0 left-0 right-0 truncate bg-primary/70 px-1 text-center text-[10px] text-white">
                                                New: {file.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* File input */}
                            {totalImages < 4 && (
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileSelect}
                                />
                            )}

                            <p className="text-xs text-muted-foreground">
                                {totalImages}/4 images ({existingImages.length} existing + {newFiles.length} new)
                            </p>
                        </div>

                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving…" : "Save Changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
