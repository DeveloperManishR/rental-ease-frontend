import { useState } from "react";
import { useMyVisitRequests } from "@/hooks/use-visits";
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
import type { VisitRequest, Property } from "@/types";

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    requested: "outline",
    scheduled: "default",
    visited: "secondary",
    decision: "destructive",
};

export default function TenantVisits() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useMyVisitRequests({ page, limit: 10 });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">My Visit Requests</h1>
                <p className="text-muted-foreground">Track your property visit requests</p>
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">Loading…</div>
            ) : data?.docs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                    No visit requests yet. Browse properties and request a visit!
                </div>
            ) : (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Property</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>Preferred Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Note</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.docs.map((v: VisitRequest) => {
                                    const prop = v.propertyId as Property;
                                    return (
                                        <TableRow key={v._id}>
                                            <TableCell className="font-medium">
                                                {prop?.title ?? "—"}
                                            </TableCell>
                                            <TableCell>{prop?.city ?? "—"}</TableCell>
                                            <TableCell>
                                                {new Date(v.preferredDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant[v.status]}>
                                                    {v.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                {v.ownerNote || "—"}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!data?.hasPrevPage}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            Previous
                        </Button>
                        <span className="flex items-center text-sm text-muted-foreground">
                            Page {data?.page} of {data?.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!data?.hasNextPage}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
