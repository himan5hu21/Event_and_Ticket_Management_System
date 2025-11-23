"use client";

import RouteProtection from "@/components/auth/RouteProtection";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  DollarSign,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  X,
  Check,
} from "lucide-react";
import { DateRange, Range } from "react-date-range";
import { useState, useEffect, lazy, Suspense, useRef } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { useEvents } from "@/hooks/api/events";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
// import EventCardGrid from "@/components/events/EventCardGrid";

const EventCardsGrid = lazy(() => import("@/components/events/EventCardGrid"));

interface Ticket {
  type: string;
  price: number;
  quantity: number;
  sold: number;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  status: "draft" | "pending" | "active" | "cancelled" | "completed";
  startDate: string;
  endDate?: string;
  location: string;
  tickets: Ticket[];
  imageUrl: string;
  category: string;
  featured?: boolean;
  organizer?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminEventsPage() {
  const eventGridRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateRange, setDateRange] = useState<Range[]>([
    {
      startDate: undefined,
      endDate: undefined,
      key: "selection",
    },
  ]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showFeatured, setShowFeatured] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryParams = {
    search: search || undefined,
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    startDate: dateRange[0]?.startDate
      ? dateRange[0].startDate.toISOString()
      : undefined,
    endDate: dateRange[0]?.endDate
      ? dateRange[0].endDate.toISOString()
      : undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    tags: tags.length > 0 ? tags.join(",") : undefined,
    featured: showFeatured ? true : undefined,
    page: currentPage,
    limit: pageSize,
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
       // Scroll to top of the event grid
   // Scroll to the top of the event grid
   eventGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const {
    data: eventsResponse,
    isLoading,
    error,
    refetch: refetchEvents,
  } = useEvents(queryParams);

  useEffect(() => {
    if (eventsResponse) refetchEvents();
  }, [JSON.stringify(queryParams)]);

  const allEvents: Event[] = eventsResponse?.data?.items || [];
  const totalItems = eventsResponse?.data?.totalItems || 0;
  const totalPages = eventsResponse?.data?.totalPages || 1;
  const hasNextPage = eventsResponse?.data?.hasNextPage || false;
  const hasPrevPage = eventsResponse?.data?.hasPrevPage || false;

  const prevPageRef = useRef<number>(currentPage);

  useEffect(() => {
    if (prevPageRef.current !== currentPage) {
      // Only scroll if page changed (pagination), not filters
      eventGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      prevPageRef.current = currentPage;
    }
  }, [currentPage]);
  

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
    <RouteProtection allowedRoles={["admin"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 dark:from-indigo-600 dark:to-blue-600 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-1">
              Event Management
            </h1>
            <p className="text-indigo-100 dark:text-indigo-200">
              Search, filter, and manage all events
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-4 md:mt-0 bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white shadow-md font-medium transition-colors"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Export Events
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card p-6 rounded-xl shadow-md border border-border">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Filters</h2>
              <div className="flex items-center space-x-2">

              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search Input */}
              <div className="relative col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  className="pl-9 h-10 text-sm rounded-lg"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 gap-2 justify-between rounded-lg"
                  >
                    <Filter className="h-4 w-4" />
                    <span>
                      {statusFilter
                        ? statusFilter.charAt(0).toUpperCase() +
                        statusFilter.slice(1)
                        : "All Status"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatusFilter("");
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                  <DropdownMenuSeparator />
                  {[
                    "draft",
                    "pending",
                    "active",
                    "cancelled",
                    "completed",
                  ].map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilter === status}
                      onCheckedChange={() =>
                        setStatusFilter(
                          statusFilter === status ? "" : status
                        )
                      }
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Category Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 gap-2 justify-between rounded-lg"
                  >
                    <Filter className="h-4 w-4" />
                    <span>{categoryFilter || "All Categories"}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoryFilter("");
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                  <DropdownMenuSeparator />
                  {[
                    "music",
                    "sports",
                    "conference",
                    "workshop",
                    "exhibition",
                    "festival",
                    "other",
                  ].map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={categoryFilter === category}
                      onCheckedChange={() =>
                        setCategoryFilter(
                          categoryFilter === category ? "" : category
                        )
                      }
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center justify-between gap-4 col-span-1">
                {/* Date Range Picker */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 gap-2 justify-between rounded-lg min-w-[200px]"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>
                        {dateRange[0]?.startDate
                          ? `${format(dateRange[0].startDate, "MMM d")} - ${dateRange[0]?.endDate
                            ? format(dateRange[0].endDate, "MMM d, yyyy")
                            : ""
                          }`
                          : "Select date range"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-auto p-0" align="end">
                    <DateRange
                      editableDateInputs={true}
                      onChange={(item: any) => setDateRange([item.selection])}
                      moveRangeOnFirstSelection={false}
                      ranges={dateRange}
                      className="border-0 dark:bg-card dark:text-foreground rounded-lg"
                    />
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Items per page */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 flex items-center gap-2 justify-between rounded-lg w-[120px]"
                    >
                      <span className="text-sm">{pageSize} per page</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40">
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                      Rows per page
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {[5, 10, 20, 50].map((count) => (
                      <DropdownMenuItem
                        key={count}
                        className={`text-sm cursor-pointer ${pageSize === count ? "bg-accent" : ""}`}
                        onClick={() => {
                          setPageSize(count);
                          setCurrentPage(1);
                        }}
                      >
                        <div className="flex items-center w-full justify-between">
                          <span>{count} rows</span>
                          {pageSize === count && (
                            <svg
                              className="h-4 w-4 text-primary"
                              fill="none"
                              height="24"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              width="24"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

            </div>

            {/* Advanced Filters */}
            <div className="flex flex-wrap items-center gap-4 border-t pt-4 mt-4">
              {/* Price Range */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Price:</span>
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-8 w-24 text-sm rounded-lg"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-8 w-24 text-sm rounded-lg"
                />
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Tags:</span>
                {tags.map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="flex items-center gap-1 text-xs h-6 px-2 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        setTags(tags.filter((_, i) => i !== idx))
                      }
                      className="ml-0.5 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                <Input
                  type="text"
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tagInput.trim()) {
                      if (!tags.includes(tagInput.trim())) {
                        setTags([...tags, tagInput.trim()]);
                      }
                      setTagInput("");
                      e.preventDefault();
                    }
                  }}
                  className="h-8 w-32 text-sm rounded-lg"
                />
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Featured:</span>
                <Switch
                  id="featured-filter"
                  checked={showFeatured}
                  onCheckedChange={setShowFeatured}
                // className="h-4 w-8"
                />
                <Label
                  htmlFor="featured-filter"
                  className="text-sm text-foreground"
                >
                  {showFeatured ? "Yes" : "No"}
                </Label>
              </div>

              {/* Clear All Filters */}
              {(search ||
                statusFilter ||
                categoryFilter ||
                dateRange[0]?.startDate ||
                minPrice ||
                maxPrice ||
                tags.length > 0 ||
                showFeatured) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs ml-auto"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("");
                      setCategoryFilter("");
                      setDateRange([
                        { startDate: undefined, endDate: undefined, key: "selection" },
                      ]);
                      setMinPrice("");
                      setMaxPrice("");
                      setTags([]);
                      setShowFeatured(false);
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
            </div>
          </div>
        </div>

        {/* 🎟️ Event Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div> */}

        <Suspense fallback={<div className="flex items-center justify-center p-4">Loading events...</div>}>
        <div ref={eventGridRef}>
    <EventCardsGrid
      isLoading={isLoading}
      error={error}
      allEvents={allEvents}
      search={search}
      statusFilter={statusFilter}
      categoryFilter={categoryFilter}
      dateRange={dateRange}
      minPrice={minPrice}
      maxPrice={maxPrice}
      tags={tags}
    />
  </div>
        </Suspense>

        {/* Pagination */}
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between px-6 py-4 border-t mt-6">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  if (i === 3 && currentPage < totalPages - 3) {
                    return <span key="ellipsis" className="px-2">...</span>;
                  }
                  if (i === 1 && currentPage > 4) {
                    return <span key="ellipsis-start" className="px-2">...</span>;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className={`w-10 h-10 p-0 ${currentPage === pageNum ? 'bg-primary text-primary-foreground' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardFooter>
        )}
      </div>
    </RouteProtection>
  );
}
