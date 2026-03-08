import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    useMoveInById,
    useUploadDocuments,
    useAcceptAgreement,
    useUpdateInventory,
} from "@/hooks/use-move-in";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Trash } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Property } from "@/types";

export default function MoveInDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: moveIn, isLoading } = useMoveInById(id!);

    const uploadMutation = useUploadDocuments();
    const agreementMutation = useAcceptAgreement();
    const inventoryMutation = useUpdateInventory();

    const fileRef = useRef<HTMLInputElement>(null);
    const [newItem, setNewItem] = useState("");

    const handleUpload = async () => {
        const files = fileRef.current?.files;
        if (!files || files.length === 0) {
            toast.error("Select files first");
            return;
        }
        try {
            await uploadMutation.mutateAsync({ id: id!, files });
            toast.success("Documents uploaded");
            if (fileRef.current) fileRef.current.value = "";
        } catch {
            toast.error("Upload failed");
        }
    };

    const handleAcceptAgreement = async () => {
        try {
            await agreementMutation.mutateAsync(id!);
            toast.success("Agreement accepted");
        } catch {
            toast.error("Failed to accept agreement");
        }
    };

    const handleAddItem = async () => {
        if (!newItem.trim() || !moveIn) return;
        const updated = [...moveIn.inventoryList, newItem.trim()];
        try {
            await inventoryMutation.mutateAsync({ id: id!, inventoryList: updated });
            toast.success("Item added");
            setNewItem("");
        } catch {
            toast.error("Failed to update inventory");
        }
    };

    const handleRemoveItem = async (index: number) => {
        if (!moveIn) return;
        const updated = moveIn.inventoryList.filter((_, i) => i !== index);
        try {
            await inventoryMutation.mutateAsync({ id: id!, inventoryList: updated });
            toast.success("Item removed");
        } catch {
            toast.error("Failed to update inventory");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!moveIn) {
        return (
            <div className="py-12 text-center text-muted-foreground">
                Move-in not found.
            </div>
        );
    }

    const prop = moveIn.propertyId as Property;

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-1 size-4" /> Back
            </Button>

            <div>
                <h1 className="text-2xl font-semibold">Move-In Management</h1>
                <p className="text-muted-foreground">
                    {prop?.title} — {prop?.city}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Documents */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {moveIn.documents.length > 0 ? (
                            <ul className="space-y-2">
                                {moveIn.documents.map((doc, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                                    >
                                        <span>{doc.name}</span>
                                        <a
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-primary underline text-xs"
                                        >
                                            View
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No documents uploaded yet.
                            </p>
                        )}
                        <Separator />
                        <div className="space-y-2">
                            <Label>Upload Documents</Label>
                            <Input ref={fileRef} type="file" multiple />
                            <Button
                                size="sm"
                                onClick={handleUpload}
                                disabled={uploadMutation.isPending}
                            >
                                {uploadMutation.isPending ? "Uploading…" : "Upload"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Agreement */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Rental Agreement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Badge
                            variant={moveIn.agreementAccepted ? "default" : "outline"}
                            className="text-sm"
                        >
                            {moveIn.agreementAccepted ? "✓ Accepted" : "Pending"}
                        </Badge>
                        {!moveIn.agreementAccepted && (
                            <div>
                                <Button
                                    onClick={handleAcceptAgreement}
                                    disabled={agreementMutation.isPending}
                                >
                                    {agreementMutation.isPending
                                        ? "Accepting…"
                                        : "Accept Agreement"}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Inventory */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Inventory Checklist</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {moveIn.inventoryList.length > 0 ? (
                            <ul className="space-y-2">
                                {moveIn.inventoryList.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                                    >
                                        <span>{item}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveItem(i)}
                                        >
                                            <Trash className="size-4 text-destructive" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No inventory items added yet.
                            </p>
                        )}
                        <div className="flex gap-2">
                            <Input
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Add inventory item…"
                                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                            />
                            <Button
                                size="sm"
                                onClick={handleAddItem}
                                disabled={inventoryMutation.isPending}
                            >
                                <Plus className="size-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
