import { useState } from "react";
import { Link } from "react-router-dom";
import { useMyMoveIns } from "@/hooks/use-move-in";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MoveIn, Property } from "@/types";

export default function TenantMoveIns() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useMyMoveIns({ page, limit: 10 });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">My Move-Ins</h1>
                <p className="text-muted-foreground">Manage your move-in processes</p>
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">Loading…</div>
            ) : data?.docs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                    No move-ins yet.
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2">
                        {data?.docs.map((mi: MoveIn) => {
                            const prop = mi.propertyId as Property;
                            return (
                                <Card key={mi._id}>
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            {prop?.title ?? "Property"}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex gap-2 text-sm text-muted-foreground">
                                            <span>{prop?.city}</span>
                                            <span>•</span>
                                            <span>₹{prop?.rent?.toLocaleString()}/mo</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge variant={mi.agreementAccepted ? "default" : "outline"}>
                                                {mi.agreementAccepted ? "Agreement Signed" : "Pending Agreement"}
                                            </Badge>
                                            <Badge variant="secondary">
                                                {mi.documents.length} Doc(s)
                                            </Badge>
                                        </div>
                                        <Button asChild size="sm" variant="outline">
                                            <Link to={`/tenant/move-ins/${mi._id}`}>
                                                Manage Move-In
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
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
