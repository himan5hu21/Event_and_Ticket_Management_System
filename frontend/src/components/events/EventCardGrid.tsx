import { error } from "console";
import { XCircle, Plus, Calendar, DollarSign, ArrowRight, Check, CheckCircle, Clock } from "lucide-react";
import { format } from "path";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import Image from "next/image";

const EventCardGrid = ({ isLoading, error, allEvents, search, statusFilter, categoryFilter, dateRange, minPrice, maxPrice, tags }: any) => {

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "active";
      case "pending":
        return "pending";
      case "cancelled":
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
        return <CheckCircle className={iconClass} />;
      case "pending":
        return <Clock className={iconClass} />;
      case "cancelled":
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
          <div key={i} className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden animate-pulse">
            <div className="h-48 bg-muted"></div>
            <div className="p-6 space-y-4">
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
        <div className="col-span-full bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading events. Please try again later.
              </p>
            </div>
          </div>
        </div>
      ) : allEvents.length === 0 ? (
        <div className="col-span-full text-center py-16 bg-white/80 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {search || statusFilter || categoryFilter || dateRange[0].startDate || minPrice || maxPrice || tags.length > 0
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by creating a new event.'}
          </p>
          <div className="mt-6">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
      ) : (
        allEvents.map((event) => {
          const lowestPriceTicket = event.tickets.length > 0
            ? event.tickets.reduce((min, t) => t.price < min.price ? t : min, event.tickets[0])
            : null;

          return (
            <Card
              key={event._id}
              className="overflow-hidden rounded-2xl shadow-sm hover:shadow-lg bg-card border border-border group transition-all duration-300 hover:-translate-y-1"
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
                <div className="absolute top-4 right-4">
                  <Badge
                    variant={getStatusBadgeVariant(event.status) as any}
                    className="gap-1.5 py-1 px-2.5 font-medium"
                  >
                    {getStatusIcon(event.status)}
                    <span className="capitalize">{event.status}</span>
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-foreground leading-tight line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
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
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground">
                        {lowestPriceTicket
                          ? `From $${lowestPriceTicket.price.toFixed(2)}`
                          : "Free"}
                      </span>
                    </div>
                  </div>

                  {/* Tickets Progress */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>
                        {event.tickets.reduce((total, t) => total + t.sold, 0)} sold
                      </span>
                      <span>
                        {event.tickets.reduce((total, t) => total + t.quantity, 0)} total
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{
                          width: (() => {
                            const totalSold = event.tickets.reduce((total, t) => total + t.sold, 0);
                            const totalQuantity = event.tickets.reduce((total, t) => total + t.quantity, 0);
                            const percentage = totalQuantity > 0 ? (totalSold / totalQuantity) * 100 : 0;
                            return `${Math.min(100, percentage)}%`;
                          })(),
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex -space-x-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-foreground"
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                      <div className="h-7 w-7 rounded-full bg-muted/70 border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                        +{Math.max(0, (event as any).attendees?.length - 3 || 0)}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border hover:bg-accent hover:text-accent-foreground text-foreground"
                    >
                      View Details
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
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
