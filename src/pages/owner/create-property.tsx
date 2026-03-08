import { type FormEvent, useState } from "react";
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
import { ArrowLeft } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function CreateProperty() {
    const navigate = useNavigate();
    const mutation = useCreateProperty();
    const [amenities, setAmenities] = useState("");
    const [rules, setRules] = useState("");
    const [images, setImages] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const today = now.toISOString().split("T")[0];

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setIsSubmitting(true);
        try {
            const imgList = images.split(",").map((s) => s.trim()).filter(Boolean);
            if (imgList.length > 4) {
                toast.error("Maximum 4 images allowed");
                setIsSubmitting(false);
                return;
            }

            await mutation.mutateAsync({
                title: fd.get("title") as string,
                description: fd.get("description") as string,
                location: fd.get("location") as string,
                city: fd.get("city") as string,
                rent: Number(fd.get("rent")),
                deposit: Number(fd.get("deposit") || 0),
                amenities: amenities
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                rules: rules
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                images: imgList,
                availableFrom: fd.get("availableFrom") as string || undefined,
            });
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
                        <div className="space-y-2">
                            <Label htmlFor="images">Image URLs (comma-separated)</Label>
                            <Input
                                id="images"
                                value={images}
                                onChange={(e) => setImages(e.target.value)}
                                placeholder="https://…, https://…"
                            />
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
