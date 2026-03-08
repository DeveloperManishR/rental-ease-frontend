import { useDashboardStats } from "@/hooks/use-admin";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Property, User as UserType } from "@/types";

export default function AdminDashboard() {
    const { data, isLoading } = useDashboardStats();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!data) {
        return <div className="py-12 text-center text-muted-foreground">No data.</div>;
    }

    const statCards = [
        { label: "Total Tenants", value: data.totalTenants },
        { label: "Total Owners", value: data.totalOwners },
        { label: "Total Properties", value: data.totalProperties },
        { label: "Visit Requests", value: data.totalVisitRequests },
        { label: "Total Tickets", value: data.totalTickets },
        { label: "Open Tickets", value: data.openTickets },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Platform overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {statCards.map((s) => (
                    <Card key={s.label}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {s.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{s.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Property Status Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Property Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">Draft</Badge>
                            <span className="font-medium">{data.propertyStats.draft}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">Review</Badge>
                            <span className="font-medium">{data.propertyStats.review}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="default">Published</Badge>
                            <span className="font-medium">{data.propertyStats.published}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">Rejected</Badge>
                            <span className="font-medium">{data.propertyStats.rejected}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">Cancelled</Badge>
                            <span className="font-medium">{data.propertyStats.cancelled}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pending Review */}
            {data.pendingReview.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Pending Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.pendingReview.map((prop: Property) => {
                                const owner = typeof prop.ownerId === "object" ? (prop.ownerId as UserType) : null;
                                return (
                                    <div
                                        key={prop._id}
                                        className="flex items-center justify-between rounded-md border p-3"
                                    >
                                        <div>
                                            <p className="font-medium">{prop.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                by {owner?.name ?? "Unknown"} • {prop.city} • ₹{prop.rent.toLocaleString()}/mo
                                            </p>
                                        </div>
                                        <Badge variant="secondary">review</Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
