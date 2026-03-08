import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePropertyById } from "@/hooks/use-properties";
import { useCreateVisitRequest } from "@/hooks/use-visits";
import { useCreateMoveIn } from "@/hooks/use-move-in";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    MapPin,
    CurrencyDollar,
    Calendar,
    ArrowLeft,
    User,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type { User as UserType } from "@/types";

export default function PropertyDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: property, isLoading } = usePropertyById(id!);

    const visitMutation = useCreateVisitRequest();
    const moveInMutation = useCreateMoveIn();

    const [visitOpen, setVisitOpen] = useState(false);
    const [visitDate, setVisitDate] = useState("");

    const handleRequestVisit = async () => {
        if (!visitDate) {
            toast.error("Please select a date");
            return;
        }
        try {
            await visitMutation.mutateAsync({
                propertyId: id!,
                preferredDate: visitDate,
            });
            toast.success("Visit request submitted!");
            setVisitOpen(false);
            setVisitDate("");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to request visit");
        }
    };

    const handleStartMoveIn = async () => {
        try {
            const result = await moveInMutation.mutateAsync(id!);
            toast.success("Move-in created!");
            navigate(`/tenant/move-ins/${result._id}`);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to start move-in");
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
        return (
            <div className="py-12 text-center text-muted-foreground">
                Property not found.
            </div>
        );
    }

    const owner =
        typeof property.ownerId === "object"
            ? (property.ownerId as UserType)
            : null;

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-1 size-4" /> Back
            </Button>

            {/* Images */}
            {property.images.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {property.images.map((img, i) => (
                        <div key={i} className="aspect-video overflow-hidden rounded-lg">
                            <img
                                src={img}
                                alt={`${property.title} ${i + 1}`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main info */}
                <div className="lg:col-span-2 space-y-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{property.title}</h1>
                        <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                            <MapPin className="size-4" />
                            {property.location}, {property.city}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex items-center gap-1 text-lg font-semibold">
                            <CurrencyDollar className="size-5" />
                            ₹{property.rent.toLocaleString()}/mo
                        </div>
                        {property.deposit > 0 && (
                            <div className="text-sm text-muted-foreground flex items-center">
                                Deposit: ₹{property.deposit.toLocaleString()}
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div>
                        <h3 className="font-medium mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {property.description}
                        </p>
                    </div>

                    {property.amenities.length > 0 && (
                        <div>
                            <h3 className="font-medium mb-2">Amenities</h3>
                            <div className="flex flex-wrap gap-2">
                                {property.amenities.map((a) => (
                                    <Badge key={a} variant="secondary">
                                        {a}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {property.rules.length > 0 && (
                        <div>
                            <h3 className="font-medium mb-2">Rules</h3>
                            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                {property.rules.map((r) => (
                                    <li key={r}>{r}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Sidebar card */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                className="w-full"
                                onClick={() => setVisitOpen(true)}
                            >
                                <Calendar className="mr-2 size-4" /> Request a Visit
                            </Button>
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={handleStartMoveIn}
                                disabled={moveInMutation.isPending}
                            >
                                Start Move-In
                            </Button>
                        </CardContent>
                    </Card>

                    {owner && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Owner</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="size-4 text-muted-foreground" />
                                    {owner.name}
                                </div>
                                <div className="text-muted-foreground">{owner.email}</div>
                                {owner.phone && (
                                    <div className="text-muted-foreground">{owner.phone}</div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {property.availableFrom && (
                        <Card>
                            <CardContent className="pt-6 text-sm">
                                <span className="font-medium">Available from: </span>
                                {new Date(property.availableFrom).toLocaleDateString()}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Visit Dialog */}
            <Dialog open={visitOpen} onOpenChange={setVisitOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request a Visit</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Label htmlFor="visitDate">Preferred Date</Label>
                        <Input
                            id="visitDate"
                            type="date"
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setVisitOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRequestVisit}
                            disabled={visitMutation.isPending}
                        >
                            {visitMutation.isPending ? "Submitting…" : "Submit Request"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
