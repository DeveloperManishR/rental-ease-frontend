import { useNavigate, useParams } from "react-router-dom";
import { useAdminPropertyById, useReviewProperty } from "@/hooks/use-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CurrencyDollar, MapPin, User } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { User as UserType } from "@/types";

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  review: "secondary",
  published: "default",
  rejected: "outline",
  cancelled: "outline",
};

export default function AdminPropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: property, isLoading } = useAdminPropertyById(id || "");
  const reviewMutation = useReviewProperty();

  const owner =
    property && typeof property.ownerId === "object"
      ? (property.ownerId as UserType)
      : null;

  const handleReview = async (action: "approve" | "reject") => {
    if (!id) return;

    try {
      await reviewMutation.mutateAsync({ id, action });
      toast.success(
        action === "approve"
          ? "Property approved and published"
          : "Property rejected"
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to review property");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 size-4" /> Back
        </Button>
        <div className="py-12 text-center text-muted-foreground">Property not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-1 size-4" /> Back
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{property.title}</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          {property.location}, {property.city}
        </p>
      </div>

      {property.images.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {property.images.map((img, i) => (
            <div key={i} className="aspect-video overflow-hidden rounded-lg border">
              <img
                src={img}
                alt={`${property.title} ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No images uploaded for this property.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={statusVariant[property.status]}>{property.status}</Badge>
            <div className="flex items-center gap-1 text-lg font-semibold">
              <CurrencyDollar className="size-5" />₹{property.rent.toLocaleString()}/mo
            </div>
            {property.deposit > 0 && (
              <div className="text-sm text-muted-foreground">
                Deposit: Rs {property.deposit.toLocaleString()}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 font-medium">Description</h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {property.description}
            </p>
          </div>

          {property.amenities.length > 0 && (
            <div>
              <h3 className="mb-2 font-medium">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {property.rules.length > 0 && (
            <div>
              <h3 className="mb-2 font-medium">Rules</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {property.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => handleReview("approve")}
                disabled={property.status !== "review" || reviewMutation.isPending}
              >
                Approve Property
              </Button>
              <Button
                className="w-full"
                variant="destructive"
                onClick={() => handleReview("reject")}
                disabled={property.status !== "review" || reviewMutation.isPending}
              >
                Reject Property
              </Button>
              {property.status !== "review" && (
                <p className="text-xs text-muted-foreground">
                  Review actions are only available when status is "review".
                </p>
              )}
            </CardContent>
          </Card>

          {owner && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Owner Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  {owner.name}
                </div>
                <div className="text-muted-foreground">{owner.email}</div>
                {owner.phone && <div className="text-muted-foreground">{owner.phone}</div>}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              {property.availableFrom && (
                <div>
                  Available from: {new Date(property.availableFrom).toLocaleDateString()}
                </div>
              )}
              <div>Created: {new Date(property.createdAt).toLocaleDateString()}</div>
              <div>Updated: {new Date(property.updatedAt).toLocaleDateString()}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
