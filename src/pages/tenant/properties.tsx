import { useState } from "react";
import { Link } from "react-router-dom";
import { usePublishedProperties } from "@/hooks/use-properties";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, CurrencyDollar } from "@phosphor-icons/react";
import type { Property } from "@/types";

export default function TenantProperties() {
    const [page, setPage] = useState(1);
    const [city, setCity] = useState("");
    const [minRent, setMinRent] = useState("");
    const [maxRent, setMaxRent] = useState("");

    const { data, isLoading } = usePublishedProperties({
        page,
        limit: 12,
        city: city || undefined,
        minRent: minRent ? Number(minRent) : undefined,
        maxRent: maxRent ? Number(maxRent) : undefined,
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Explore Properties
                </h1>
                <p className="text-muted-foreground">
                    Find your perfect rental property
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-1">
                    <Label htmlFor="city" className="text-xs">City</Label>
                    <Input
                        id="city"
                        placeholder="e.g. Mumbai"
                        value={city}
                        onChange={(e) => { setCity(e.target.value); setPage(1); }}
                        className="w-40"
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="minRent" className="text-xs">Min Rent</Label>
                    <Input
                        id="minRent"
                        type="number"
                        placeholder="₹0"
                        value={minRent}
                        onChange={(e) => { setMinRent(e.target.value); setPage(1); }}
                        className="w-28"
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="maxRent" className="text-xs">Max Rent</Label>
                    <Input
                        id="maxRent"
                        type="number"
                        placeholder="₹50,000"
                        value={maxRent}
                        onChange={(e) => { setMaxRent(e.target.value); setPage(1); }}
                        className="w-28"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setCity(""); setMinRent(""); setMaxRent(""); setPage(1); }}
                >
                    Clear
                </Button>
            </div>

            {/* Property Grid */}
            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-4 w-3/4 rounded bg-muted" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-3 w-1/2 rounded bg-muted" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : data?.docs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                    No properties found. Try adjusting your filters.
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {data?.docs.map((prop: Property) => (
                            <Card key={prop._id} className="flex flex-col">
                                {prop.images?.[0] && (
                                    <div className="aspect-video overflow-hidden rounded-t-lg">
                                        <img
                                            src={prop.images[0]}
                                            alt={prop.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base line-clamp-1">
                                        {prop.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-2 pb-2">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <MapPin className="size-3.5" />
                                        {prop.city}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm font-medium">
                                        <CurrencyDollar className="size-3.5" />
                                        ₹{prop.rent.toLocaleString()}/mo
                                    </div>
                                    {prop.amenities.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {prop.amenities.slice(0, 3).map((a) => (
                                                <Badge key={a} variant="secondary" className="text-xs">
                                                    {a}
                                                </Badge>
                                            ))}
                                            {prop.amenities.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{prop.amenities.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button asChild variant="outline" size="sm" className="w-full">
                                        <Link to={`/tenant/properties/${prop._id}`}>View Details</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
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
