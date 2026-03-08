import { useState } from "react";
import { Link } from "react-router-dom";
import { useMyTickets } from "@/hooks/use-tickets";
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
import { Plus } from "@phosphor-icons/react";
import type { Ticket } from "@/types";

export default function TenantTickets() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useMyTickets({ page, limit: 10 });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Support Tickets</h1>
                    <p className="text-muted-foreground">Get help and raise issues</p>
                </div>
                <Button asChild>
                    <Link to="/tenant/tickets/new">
                        <Plus className="mr-1 size-4" /> New Ticket
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">Loading…</div>
            ) : data?.docs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                    No tickets yet.
                </div>
            ) : (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Messages</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.docs.map((t: Ticket) => (
                                    <TableRow key={t._id}>
                                        <TableCell className="font-medium">{t.title}</TableCell>
                                        <TableCell>
                                            <Badge variant={t.status === "open" ? "default" : "secondary"}>
                                                {t.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{t.messages.length}</TableCell>
                                        <TableCell>
                                            {new Date(t.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button asChild variant="ghost" size="sm">
                                                <Link to={`/tenant/tickets/${t._id}`}>View</Link>
                                            </Button>
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
