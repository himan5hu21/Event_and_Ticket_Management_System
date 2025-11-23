import { XCircle, Plus, Calendar, DollarSign, ArrowRight, Check, CheckCircle, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import Image from "next/image";
import Link from "next/link";

interface Ticket {
  price: number;
  sold: number;
  quantity: number;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: string;
  startDate: string;
  endDate?: string;
  location?: string;
  tickets: Ticket[];
  attendees?: any[];
}

interface EventCardGridProps {
  isLoading: boolean;
  error: any;
  allEvents: Event[];
  search: string;
  statusFilter: string;
  categoryFilter: string;
  dateRange: any;
  minPrice: string;
  maxPrice: string;
  tags: string[];
}

const EventCardGrid = ({ isLoading, error, allEvents, search, statusFilter, categoryFilter, dateRange, minPrice, maxPrice, tags }: EventCardGridProps) => {

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "active";
      case "pending":
        return "pending";
      case "cancelled":
      case "rejected":
        return "destructive";
      case "draft":
        return "draft";
      case "completed":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "h-3.5 w-3.5";
    switch (status) {
      case "active":
      case "approved":
        return <CheckCircle className={iconClass} />;
      case "pending":
        return <Clock className={iconClass} />;
      case "cancelled":
      case "rejected":
        return <XCircle className={iconClass} />;
      case "completed":
        return <Check className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
            <div className="h-48 bg-muted"></div>
            <div className="p-5 space-y-4">
              <div className="h-5 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))
      ) : error ? (
        <div className="col-span-full bg-destructive/10 border-l-4 border-destructive p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-destructive">
                Error loading events. Please try again later.
              </p>
            </div>
          </div>
        </div>
      ) : allEvents.length === 0 ? (
        <div className="col-span-full text-center py-16 bg-card/50 rounded-xl border-2 border-dashed border-border">
          <div className="mx-auto h-24 w-24 text-muted-foreground mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground">No events found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || statusFilter || categoryFilter || dateRange?.from || dateRange?.to || minPrice || maxPrice || tags.length > 0
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by creating a new event.'}
          </p>
          <div className="mt-6">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
      ) : (
        allEvents.map((event) => {
          const lowestPriceTicket = event.tickets.length > 0
            ? event.tickets.reduce((min: Ticket, t: Ticket) => t.price < min.price ? t : min, event.tickets[0])
            : null;

          const totalSold = event.tickets.reduce((total: number, t: Ticket) => total + t.sold, 0);
          const totalQuantity = event.tickets.reduce((total: number, t: Ticket) => total + t.quantity, 0);
          const soldPercentage = totalQuantity > 0 ? (totalSold / totalQuantity) * 100 : 0;

          return (
            <Card
              key={event._id}
              className="overflow-hidden rounded-xl border border-border group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative h-48">
                <Image
                  src={event.imageUrl || "/images/event-placeholder.jpg"}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={getStatusBadgeVariant(event.status) as any}
                    className="gap-1.5 py-1 px-2.5 font-medium backdrop-blur-sm"
                  >
                    {getStatusIcon(event.status)}
                    <span className="capitalize">{event.status}</span>
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground leading-tight line-clamp-2 mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">
                        {format(new Date(event.startDate), "MMM d, yyyy")}
                        {event.endDate &&
                          ` - ${format(new Date(event.endDate), "MMM d, yyyy")}`}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-foreground line-clamp-1">{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground font-medium">
                        {lowestPriceTicket
                          ? `From $${lowestPriceTicket.price.toFixed(2)}`
                          : "Free"}
                      </span>
                    </div>
                  </div>

                  {/* Tickets Progress */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{totalSold} sold</span>
                      <span>{totalQuantity} total</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, soldPercentage)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex -space-x-2">
                      {Array.from({ length: Math.min(3, (event as any).attendees?.length || 3) }).map((_, i) => (
                        <div
                          key={i}
                          className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-foreground"
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                      {((event as any).attendees?.length || 0) > 3 && (
                        <div className="h-7 w-7 rounded-full bg-muted/70 border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                          +{(event as any).attendees.length - 3}
                        </div>
                      )}
                    </div>

                    <Link href={`/admin/events/${event._id}`} passHref>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-accent"
                      >
                        View Details
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>

                </div>
              </CardContent>
            </Card>
          );
        }))}
    </div>
  );
};

export default EventCardGrid;
