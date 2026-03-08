import { useState } from "react";
import { useAdminProperties, useReviewProperty } from "@/hooks/use-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Check, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Property, User } from "@/types";

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
    draft: "outline",
    review: "secondary",
    published: "default",
};

export default function AdminProperties() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("all");

    const { data, isLoading } = useAdminProperties({
        page,
        limit: 10,
        status: status === "all" ? undefined : status,
    });

    const reviewMutation = useReviewProperty();

    const handleReview = async (id: string, action: "approve" | "reject") => {
        try {
            await reviewMutation.mutateAsync({ id, action });
            toast.success(action === "approve" ? "Property approved" : "Property rejected");
        } catch {
            toast.error("Failed to review property");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">All Properties</h1>
                <p className="text-muted-foreground">Review and manage listings</p>
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
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">Loading…</div>
            ) : (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>Rent</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.docs.map((prop: Property) => {
                                    const owner = typeof prop.ownerId === "object" ? (prop.ownerId as User) : null;
                                    return (
                                        <TableRow key={prop._id}>
                                            <TableCell className="font-medium">{prop.title}</TableCell>
                                            <TableCell>{owner?.name ?? "—"}</TableCell>
                                            <TableCell>{prop.city}</TableCell>
                                            <TableCell>₹{prop.rent.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant[prop.status]}>
                                                    {prop.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {prop.status === "review" && (
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleReview(prop._id, "approve")}
                                                            disabled={reviewMutation.isPending}
                                                        >
                                                            <Check className="mr-1 size-3.5" /> Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleReview(prop._id, "reject")}
                                                            disabled={reviewMutation.isPending}
                                                        >
                                                            <X className="mr-1 size-3.5" /> Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
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
