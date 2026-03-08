import { useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTicketById, useAddMessage, useCloseTicket } from "@/hooks/use-tickets";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { User } from "@/types";

export default function AdminTicketDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: ticket, isLoading } = useTicketById(id!);
    const addMessage = useAddMessage();
    const closeMutation = useCloseTicket();
    const [msg, setMsg] = useState("");

    const handleSend = async (e: FormEvent) => {
        e.preventDefault();
        if (!msg.trim()) return;
        try {
            await addMessage.mutateAsync({ id: id!, message: msg.trim() });
            setMsg("");
            toast.success("Message sent");
        } catch {
            toast.error("Failed to send");
        }
    };

    const handleClose = async () => {
        try {
            await closeMutation.mutateAsync(id!);
            toast.success("Ticket closed");
        } catch {
            toast.error("Failed to close ticket");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!ticket) {
        return <div className="py-12 text-center text-muted-foreground">Ticket not found.</div>;
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-1 size-4" /> Back
            </Button>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-semibold">{ticket.title}</h1>
                    <p className="text-sm text-muted-foreground">
                        Created {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={ticket.status === "open" ? "default" : "secondary"}>
                        {ticket.status}
                    </Badge>
                    {ticket.status === "open" && (
                        <Button size="sm" variant="outline" onClick={handleClose}>
                            Close Ticket
                        </Button>
                    )}
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                {ticket.messages.map((m, i) => {
                    const sender = m.senderId as User;
                    const isMe = sender?._id === user?._id;
                    return (
                        <Card key={i} className={isMe ? "border-primary/30" : ""}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium">
                                        {sender?.name ?? "User"}
                                        {sender?.role && (
                                            <Badge variant="outline" className="ml-2 text-xs">
                                                {sender.role}
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(m.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {ticket.status === "open" && (
                <form onSubmit={handleSend} className="flex gap-2">
                    <Textarea
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        placeholder="Type your reply…"
                        rows={2}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={addMessage.isPending}>
                        Send
                    </Button>
                </form>
            )}
        </div>
    );
}
