import { useState } from "react";
import { Link } from "react-router-dom";
import { useAllTickets, useCloseTicket } from "@/hooks/use-tickets";
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
import type { Ticket, User } from "@/types";

export default function AdminTickets() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useAllTickets({ page, limit: 10 });
    const closeMutation = useCloseTicket();

    const handleClose = async (id: string) => {
        try {
            await closeMutation.mutateAsync(id);
            toast.success("Ticket closed");
        } catch {
            toast.error("Failed to close ticket");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Support Tickets</h1>
                <p className="text-muted-foreground">Manage tenant support requests</p>
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">Loading…</div>
            ) : data?.docs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No tickets.</div>
            ) : (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Tenant</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Messages</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.docs.map((t: Ticket) => {
                                    const tenant = t.tenantId as User;
                                    return (
                                        <TableRow key={t._id}>
                                            <TableCell className="font-medium">{t.title}</TableCell>
                                            <TableCell>{tenant?.name ?? "—"}</TableCell>
                                            <TableCell>
                                                <Badge variant={t.status === "open" ? "default" : "secondary"}>
                                                    {t.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{t.messages.length}</TableCell>
                                            <TableCell>
                                                {new Date(t.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right space-x-1">
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link to={`/admin/tickets/${t._id}`}>View</Link>
                                                </Button>
                                                {t.status === "open" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleClose(t._id)}
                                                        disabled={closeMutation.isPending}
                                                    >
                                                        Close
                                                    </Button>
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
