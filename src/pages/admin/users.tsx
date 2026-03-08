import { useState } from "react";
import { useAllUsers } from "@/hooks/use-admin";
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
import type { User } from "@/types";

export default function AdminUsers() {
    const [page, setPage] = useState(1);
    const [roleFilter, setRoleFilter] = useState("all");

    const { data, isLoading } = useAllUsers({
        page,
        limit: 10,
        role: roleFilter === "all" ? undefined : roleFilter,
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">All Users</h1>
                <p className="text-muted-foreground">Manage platform users</p>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Role:</span>
                <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="tenant">Tenant</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
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
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.docs.map((u: User) => (
                                    <TableRow key={u._id}>
                                        <TableCell className="font-medium">{u.name}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {u.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{u.phone || "—"}</TableCell>
                                        <TableCell>
                                            {new Date(u.createdAt).toLocaleDateString()}
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
