import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTicket } from "@/hooks/use-tickets";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function CreateTicket() {
    const navigate = useNavigate();
    const mutation = useCreateTicket();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setIsSubmitting(true);
        try {
            await mutation.mutateAsync({
                title: fd.get("title") as string,
                message: fd.get("message") as string,
            });
            toast.success("Ticket created");
            navigate("/tenant/tickets");
        } catch {
            toast.error("Failed to create ticket");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-1 size-4" /> Back
            </Button>

            <Card className="max-w-lg">
                <CardHeader>
                    <CardTitle>New Support Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Brief issue summary"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Describe your issue</Label>
                            <Textarea
                                id="message"
                                name="message"
                                placeholder="Provide details…"
                                rows={5}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting…" : "Create Ticket"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
