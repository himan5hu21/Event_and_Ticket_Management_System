'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEvents, usePublishEvent, useRejectEvent, useUpdateEvent } from '@/hooks/api/events';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle, Calendar as CalendarIcon, MapPin, Ticket, User, Clock, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EventWithUser {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  subcategory?: string;
  imageUrl: string;
  verified: boolean;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'closed' | 'rejected' | 'approved';
  rejectionReason?: string;
  tickets: {
    type: 'general' | 'vip';
    price: number;
    quantity: number;
    sold: number;
  }[];
  createdBy: {
    _id: string;
    name: string;
    organization?: string;
  };
}

export default function EventVerificationPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventWithUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch events based on tab (pending/verified)
  const { data, isLoading, isError, error } = useEvents({
    search: searchTerm || undefined,
    // For "pending" tab, get status: 'pending' AND verified: false
    // For "verified" tab, get verified: true (and any status *except* pending/rejected)
    status: activeTab === 'pending' ? 'pending' : 'approved,active,completed,cancelled',
    verified: activeTab === 'pending' ? false : true,
    limit: 10,
  });

  // Mutation hooks
  const { mutateAsync: publishEvent, isPending: isPublishing } = usePublishEvent();
  const { mutateAsync: rejectEvent, isPending: isRejecting } = useRejectEvent();

  const handleApprove = async (id: string) => {
    try {
      await publishEvent(id);
      // await updateEvent({ id, data: { status: 'active' } });
      toast.success('Event approved and published successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve event');
    }
  };

  const handleReject = async (id: string) => {
    if (rejectionReason.trim() === '') {
      toast.error('Please provide a rejection reason.');
      return;
    }
    try {
      // FIX: Call the correct mutation
      await rejectEvent({ id, reason: rejectionReason });
      toast.success('Event rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsDialogOpen(false);
      setRejectionReason(''); // Clear reason
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject event');
    }
  };

  const handleViewDetails = (event: EventWithUser) => {
    setSelectedEvent(event);
    setRejectionReason(event.rejectionReason || ''); // Pre-fill reason if it was already rejected
    setIsDialogOpen(true);
  };

  // Clear rejection reason when dialog is closed
  const onDialogChange = (open: boolean) => {
    if (!open) {
      setRejectionReason('');
    }
    setIsDialogOpen(open);
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">
          Error loading events: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Event Verification</h1>
          <p className="text-muted-foreground">
            Review and manage event submissions
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="pending" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="verified">Verified Events</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-10 w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data?.data?.items?.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.data.items.map((event: EventWithUser) => (
                <Card
                  key={event._id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(event)}
                >
                  {event.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <Badge variant={event.verified ? 'default' : 'secondary'}>
                        {event.verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>
                        {format(new Date(event.startDate), 'MMM d, yyyy')}
                        {event.endDate && ` - ${format(new Date(event.endDate), 'MMM d, yyyy')}`}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      <span>{event.createdBy.name}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No events pending review</h3>
              <p className="text-sm text-muted-foreground">
                All events have been reviewed.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="verified" className="mt-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-10 w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data?.data?.items?.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.data.items.map((event: EventWithUser) => (
                <Card
                  key={event._id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(event)}
                >
                  {event.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <Badge variant={event.verified ? 'default' : 'secondary'}>
                        {event.verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>
                        {format(new Date(event.startDate), 'MMM d, yyyy')}
                        {event.endDate && ` - ${format(new Date(event.endDate), 'MMM d, yyyy')}`}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      <span>{event.createdBy.name}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No verified events found</h3>
              <p className="text-sm text-muted-foreground">
                There are no verified events to display.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Event Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent className="max-w-3xl">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedEvent.title}</DialogTitle>
                <DialogDescription>
                  <p className="flex items-center gap-2 mt-2">
                    <Badge variant={selectedEvent.verified ? 'default' : 'secondary'}>
                      {selectedEvent.verified ? 'Verified' : 'Pending Review'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Created by {selectedEvent.createdBy.name}
                      {selectedEvent.createdBy.organization && ` • ${selectedEvent.createdBy.organization}`}
                    </span>
                  </p>
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6">
                {selectedEvent.imageUrl && (
                  <div className="relative h-64 w-full rounded-lg overflow-hidden">
                    <img
                      src={selectedEvent.imageUrl}
                      alt={selectedEvent.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Event Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <CalendarIcon className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Date & Time</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(selectedEvent.startDate), 'EEEE, MMMM d, yyyy h:mm a')}
                              {selectedEvent.endDate && (
                                <>
                                  <br />
                                  to {format(new Date(selectedEvent.endDate), 'EEEE, MMMM d, yyyy h:mm a')}
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        {selectedEvent.location && (
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Location</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedEvent.location}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start">
                          <Ticket className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Category</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {selectedEvent.category}
                              {selectedEvent.subcategory && ` • ${selectedEvent.subcategory}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Description</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {selectedEvent.description}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Tickets</h3>
                    <div className="space-y-3">
                      {selectedEvent.tickets.map((ticket, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium capitalize">{ticket.type} Ticket</p>
                              <p className="text-sm text-muted-foreground">
                                ${ticket.price.toFixed(2)} each
                              </p>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {ticket.quantity - (ticket.sold || 0)} available
                            </Badge>
                          </div>
                          <div className="mt-2 pt-2 border-t">
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Total tickets:</span>
                              <span>{ticket.quantity}</span>
                            </div>
                            {ticket.sold > 0 && (
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Already sold:</span>
                                <span>{ticket.sold}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Show rejection reason input if event is pending */}
                {selectedEvent.status === 'pending' && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="rejectionReason">Rejection Reason (Required to reject)</Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="e.g., Event does not meet guidelines..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                )}

                {/* Show rejection reason if event was *already* rejected */}
                {selectedEvent.status === 'rejected' && selectedEvent.rejectionReason && (
                  <div className="space-y-2 col-span-2">
                    <Label>Rejection Reason</Label>
                    <p className="text-sm text-destructive border-l-4 border-destructive bg-destructive/10 p-3 rounded-md">
                      {selectedEvent.rejectionReason}
                    </p>
                  </div>
                )}

              </div>

              {/* Only show buttons if event is pending */}
              {selectedEvent.status === 'pending' && (
                <DialogFooter className="sm:justify-between mt-6">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedEvent._id);
                    }}
                    disabled={isRejecting || rejectionReason.trim() === ''} // Disable if no reason
                    className="gap-2"
                  >
                    {isRejecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Reject Event
                  </Button>
                  <Button
                    onClick={() => {
                      handleApprove(selectedEvent._id);
                    }}
                    // FIX: Use isPublishing for disabled and loader check
                    disabled={isPublishing || isRejecting}
                    className="gap-2"
                  >
                    {isPublishing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Approve & Publish
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}