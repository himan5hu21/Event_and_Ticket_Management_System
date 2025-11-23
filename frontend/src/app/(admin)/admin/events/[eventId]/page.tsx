"use client";

import { useParams, useRouter } from "next/navigation";
import { useEvent, usePublishEvent, useRejectEvent, useDeleteEvent } from "@/hooks/api/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Calendar,
    MapPin,
    Clock,
    Ticket,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowLeft,
    Trash2,
    Loader2,
    Users,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminEventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    const { data: eventResponse, isLoading, error } = useEvent(eventId);
    const publishMutation = usePublishEvent();
    const rejectMutation = useRejectEvent();
    const deleteMutation = useDeleteEvent();

    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const event = eventResponse?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h2 className="text-2xl font-semibold">Event not found</h2>
                <p className="text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => router.back()} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
            </div>
        );
    }

    const handleVerify = async () => {
        try {
            await publishMutation.mutateAsync(eventId);
            toast.success("Event verified successfully");
        } catch (error) {
            toast.error("Failed to verify event");
        }
    };

    const handleReject = async () => {
        try {
            await rejectMutation.mutateAsync({ id: eventId, reason: rejectionReason });
            setRejectDialogOpen(false);
            setRejectionReason("");
            toast.success("Event rejected successfully");
        } catch (error) {
            toast.error("Failed to reject event");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(eventId);
            toast.success("Event deleted successfully");
            router.push("/admin/events");
        } catch (error) {
            toast.error("Failed to delete event");
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "active":
            case "approved":
                return "default";
            case "pending":
                return "secondary";
            case "cancelled":
            case "rejected":
                return "destructive";
            case "completed":
                return "outline";
            default:
                return "outline";
        }
    };

    const totalTickets = event.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0);
    const soldTickets = event.tickets.reduce((sum: number, t: any) => sum + (t.sold || 0), 0);
    const availableTickets = totalTickets - soldTickets;

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-8 w-8" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
                        <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                            <Badge variant={getStatusBadgeVariant(event.status) as any} className="font-medium">
                                {event.status.toUpperCase()}
                            </Badge>
                            <span>•</span>
                            <span>Created by {event.createdBy?.name || "Unknown"}</span>
                            <span>•</span>
                            <span>{format(new Date(event.createdAt || Date.now()), "PPP")}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {event.status === "pending" && (
                            <>
                                <Button
                                    onClick={handleVerify}
                                    disabled={publishMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {publishMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                    )}
                                    Verify
                                </Button>
                                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive">
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Reject
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Reject Event</DialogTitle>
                                            <DialogDescription>
                                                Please provide a reason for rejecting this event. This will be sent to the organizer.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="reason">Rejection Reason</Label>
                                                <Textarea
                                                    id="reason"
                                                    placeholder="e.g., Inappropriate content, Missing details..."
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    rows={4}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={handleReject}
                                                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                                            >
                                                {rejectMutation.isPending && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Confirm Rejection
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}

                        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Delete Event</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete this event? This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={deleteMutation.isPending}
                                    >
                                        {deleteMutation.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Delete
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Image */}
                    <Card className="overflow-hidden">
                        <div className="relative aspect-[16/9] bg-muted">
                            <Image
                                src={event.imageUrl || "/images/event-placeholder.jpg"}
                                alt={event.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </Card>

                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">About This Event</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                                {event.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Tickets */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Ticket Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {event.tickets.map((ticket: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                                                <Ticket className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium capitalize">{ticket.type}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {ticket.quantity - (ticket.sold || 0)} available of {ticket.quantity}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-lg">
                                                ${ticket.price.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {ticket.sold || 0} sold
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total Tickets</span>
                                <span className="font-semibold">{totalTickets}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Sold</span>
                                <span className="font-semibold text-green-600">{soldTickets}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Available</span>
                                <span className="font-semibold">{availableTickets}</span>
                            </div>
                            <Separator />
                            <div className="pt-2">
                                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                    <span>Sales Progress</span>
                                    <span>{totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{
                                            width: `${totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Event Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Event Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium text-sm mb-1">Date & Time</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(event.startDate), "PPP 'at' p")}
                                    </p>
                                    {event.endDate && (
                                        <p className="text-sm text-muted-foreground">
                                            to {format(new Date(event.endDate), "PPP 'at' p")}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium text-sm mb-1">Location</p>
                                    <p className="text-sm text-muted-foreground">
                                        {event.location || "Online / To be announced"}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="font-medium text-sm mb-2">Category</p>
                                <Badge variant="secondary" className="capitalize">
                                    {event.category}
                                </Badge>
                            </div>

                            {(event as any).tags && (event as any).tags.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="font-medium text-sm mb-2">Tags</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(event as any).tags.map((tag: string) => (
                                                <Badge key={tag} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Organizer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Organizer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="font-medium">{event.createdBy?.name || "Unknown"}</p>
                                {event.createdBy?.organization && (
                                    <p className="text-sm text-muted-foreground">{event.createdBy.organization}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
