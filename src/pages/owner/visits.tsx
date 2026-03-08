import { useState } from "react";
import { useOwnerVisitRequests, useUpdateVisitStatus } from "@/hooks/use-visits";
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

import { toast } from "sonner";
import type { VisitRequest, Property, User, VisitStatus } from "@/types";

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    requested: "outline",
    scheduled: "default",
    visited: "secondary",
    decision: "destructive",
};

const nextStatusMap: Record<string, VisitStatus | null> = {
    requested: "scheduled",
    scheduled: "visited",
    visited: "decision",
    decision: null,
};

export default function OwnerVisits() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useOwnerVisitRequests({ page, limit: 10 });
    const updateMutation = useUpdateVisitStatus();

    const handleAdvance = async (visit: VisitRequest) => {
        const next = nextStatusMap[visit.status];
        if (!next) return;
        try {
            await updateMutation.mutateAsync({ id: visit._id, status: next });
            toast.success(`Status updated to ${next}`);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Visit Requests</h1>
                <p className="text-muted-foreground">
                    Manage visit requests from tenants
                </p>
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">Loading…</div>
            ) : data?.docs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                    No visit requests yet.
                </div>
            ) : (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tenant</TableHead>
                                    <TableHead>Property</TableHead>
                                    <TableHead>Preferred Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.docs.map((v: VisitRequest) => {
                                    const tenant = v.tenantId as User;
                                    const prop = v.propertyId as Property;
                                    const nextStatus = nextStatusMap[v.status];
                                    return (
                                        <TableRow key={v._id}>
                                            <TableCell>
                                                <div className="font-medium">{tenant?.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {tenant?.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>{prop?.title ?? "—"}</TableCell>
                                            <TableCell>
                                                {new Date(v.preferredDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant[v.status]}>
                                                    {v.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {nextStatus ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleAdvance(v)}
                                                        disabled={updateMutation.isPending}
                                                    >
                                                        → {nextStatus}
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        Complete
                                                    </span>
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
