import { type FormEvent, useState, useEffect } from "react";
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
import { ArrowLeft } from "@phosphor-icons/react";
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
    const [images, setImages] = useState("");

    useEffect(() => {
        if (property) {
            setAmenities(property.amenities.join(", "));
            setRules(property.rules.join(", "));
            setImages(property.images.join(", "));
        }
    }, [property]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        try {
            const imgList = images.split(",").map((s) => s.trim()).filter(Boolean);
            if (imgList.length > 4) {
                toast.error("Maximum 4 images allowed");
                return;
            }

            await mutation.mutateAsync({
                id: id!,
                title: fd.get("title") as string,
                description: fd.get("description") as string,
                location: fd.get("location") as string,
                city: fd.get("city") as string,
                rent: Number(fd.get("rent")),
                deposit: Number(fd.get("deposit") || 0),
                amenities: amenities.split(",").map((s) => s.trim()).filter(Boolean),
                rules: rules.split(",").map((s) => s.trim()).filter(Boolean),
                images: imgList,
                availableFrom: (fd.get("availableFrom") as string) || undefined,
            });
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
                        <div className="space-y-2">
                            <Label>Image URLs (comma-separated)</Label>
                            <Input value={images} onChange={(e) => setImages(e.target.value)} />
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
