import { useState } from "react";
import { Link } from "react-router-dom";
import { useMyProperties, useDeleteProperty, useSubmitForReview } from "@/hooks/use-properties";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, PencilSimple, Trash, PaperPlaneTilt } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Property } from "@/types";

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
    draft: "outline",
    review: "secondary",
    published: "default",
    rejected: "outline",
    cancelled: "outline",
};

export default function OwnerProperties() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("all");
    const { data, isLoading } = useMyProperties({
        page,
        limit: 10,
        status: status === "all" ? undefined : status,
    });

    const deleteMutation = useDeleteProperty();
    const submitMutation = useSubmitForReview();

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this property?")) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success("Property deleted");
        } catch {
            toast.error("Failed to delete");
        }
    };

    const handleSubmit = async (id: string) => {
        try {
            await submitMutation.mutateAsync(id);
            toast.success("Submitted for review");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to submit");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">My Properties</h1>
                    <p className="text-muted-foreground">Manage your property listings</p>
                </div>
                <Button asChild>
                    <Link to="/owner/properties/new">
                        <Plus className="mr-1 size-4" /> Add Property
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">Loading…</div>
            ) : data?.docs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                    No properties yet. Create your first listing!
                </div>
            ) : (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>Rent</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.docs.map((prop: Property) => (
                                    <TableRow key={prop._id}>
                                        <TableCell className="font-medium">{prop.title}</TableCell>
                                        <TableCell>{prop.city}</TableCell>
                                        <TableCell>₹{prop.rent.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[prop.status]}>
                                                {prop.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                {["rejected", "cancelled"].includes(prop.status) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleSubmit(prop._id)}
                                                        title="Submit for review"
                                                    >
                                                        <PaperPlaneTilt className="size-4" />
                                                    </Button>
                                                )}
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link to={`/owner/properties/${prop._id}/edit`}>
                                                        <PencilSimple className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(prop._id)}
                                                >
                                                    <Trash className="size-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" disabled={!data?.hasPrevPage} onClick={() => setPage((p) => p - 1)}>
                            Previous
                        </Button>
                        <span className="flex items-center text-sm text-muted-foreground">
                            Page {data?.page} of {data?.totalPages}
                        </span>
                        <Button variant="outline" size="sm" disabled={!data?.hasNextPage} onClick={() => setPage((p) => p + 1)}>
                            Next
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
