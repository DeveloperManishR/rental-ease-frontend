import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminProperties } from "@/hooks/use-admin";
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
import type { Property, User } from "@/types";

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
    review: "secondary",
    published: "default",
    rejected: "outline",
    cancelled: "outline",
};

export default function AdminProperties() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("all");

    const { data, isLoading } = useAdminProperties({
        page,
        limit: 10,
        status: status === "all" ? undefined : status,
    });

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
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
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
                                    <TableHead>Image</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>Rent</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.docs.map((prop: Property) => {
                                    const owner = typeof prop.ownerId === "object" ? (prop.ownerId as User) : null;
                                    return (
                                        <TableRow key={prop._id}>
                                            <TableCell>
                                                {prop.images?.[0] ? (
                                                    <img
                                                        src={prop.images[0]}
                                                        alt={prop.title}
                                                        className="h-12 w-20 rounded object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No image</span>
                                                )}
                                            </TableCell>
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
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => navigate(`/admin/properties/${prop._id}`)}
                                                >
                                                    View Details
                                                </Button>
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
