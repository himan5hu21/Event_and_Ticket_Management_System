"use client";

import RouteProtection from "@/components/auth/RouteProtection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
  Plus,
  ArrowRight,
  MapPin,
  X,
  Check,
  SlidersHorizontal
} from "lucide-react";
import { DateRange } from "react-date-range";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { useEvents } from "@/hooks/api/events";
import { motion, AnimatePresence } from "framer-motion";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

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
  status: 'draft' | 'pending' | 'active' | 'cancelled' | 'completed';
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
  // Add other event properties as needed
}

export default function AdminEventsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showFeatured, setShowFeatured] = useState(false);

  // Format query parameters to match the expected API format
  const queryParams = {
    search: search || undefined,
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    startDate: dateRange[0]?.startDate ? dateRange[0].startDate.toISOString() : undefined,
    endDate: dateRange[0]?.endDate ? dateRange[0].endDate.toISOString() : undefined,
    page: 1, // Default page
    limit: 20,
    // Note: minPrice, maxPrice, tags, and featured filters would need to be handled
    // by the API or filtered client-side if not supported by the API
  };
  
  // Filter events client-side if needed for unsupported filters
  const filterEvents = (events: Event[]) => {
    return events.filter(event => {
      // Filter by price range if specified
      if (minPrice || maxPrice) {
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        const eventMinPrice = Math.min(...event.tickets.map(t => t.price));
        if (eventMinPrice < min || eventMinPrice > max) return false;
      }
      
      // Filter by tags if specified
      if (tags.length > 0 && event.category && !tags.includes(event.category)) {
        return false;
      }
      
      // Filter by featured if specified
      if (showFeatured && !event.featured) {
        return false;
      }
      
      return true;
    });
  };

  const { data: eventsResponse, isLoading, error, refetch: refetchEvents } = useEvents(queryParams);

  useEffect(() => {
    if (eventsResponse) refetchEvents();
  }, [JSON.stringify(queryParams)]);

  // Get events from API response and apply client-side filters if needed
  const allEvents: Event[] = eventsResponse?.data?.items || [];
  const filteredEvents = filterEvents(allEvents);

  // Helper function to get badge variant based on status
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
            <h1 className="text-4xl font-extrabold text-white mb-1">Event Management</h1>
            <p className="text-indigo-100 dark:text-indigo-200">Search, filter, and manage all events</p>
          </div>
          <Button
            variant="outline"
            className="mt-4 md:mt-0 bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:hover:text-white shadow-md font-medium transition-colors"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Export Events
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-9 h-10 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span>
                    {statusFilter 
                      ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) 
                      : 'All Status'}
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
                      setStatusFilter('');
                    }}
                  >
                    Reset
                  </Button>
                </div>
                <DropdownMenuSeparator />
                {['draft', 'pending', 'active', 'cancelled', 'completed'].map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter === status}
                    onCheckedChange={() => setStatusFilter(statusFilter === status ? '' : status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span>
                    {categoryFilter || 'All Categories'}
                  </span>
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
                      setCategoryFilter('');
                    }}
                  >
                    Reset
                  </Button>
                </div>
                <DropdownMenuSeparator />
                {['music', 'sports', 'conference', 'workshop', 'exhibition', 'festival', 'other'].map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={categoryFilter === category}
                    onCheckedChange={() => setCategoryFilter(categoryFilter === category ? '' : category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Date Range Picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {dateRange[0]?.startDate 
                      ? `${format(dateRange[0].startDate, 'MMM d')} - ${dateRange[0]?.endDate ? format(dateRange[0].endDate, 'MMM d, yyyy') : ''}`
                      : 'Select date range'}
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
                  className="border-0 dark:bg-card dark:text-foreground"
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Price Range */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Price:</span>
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-8 w-24 text-sm"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-8 w-24 text-sm"
              />
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tags:</span>
              <div className="flex items-center gap-1 flex-wrap">
                {tags.map((tag, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="flex items-center gap-1 text-xs h-6 px-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((_, i) => i !== idx))}
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
                    if (e.key === 'Enter' && tagInput.trim()) {
                      if (!tags.includes(tagInput.trim())) {
                        setTags([...tags, tagInput.trim()]);
                      }
                      setTagInput('');
                      e.preventDefault();
                    }
                  }}
                  className="h-8 w-32 text-sm"
                />
              </div>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Featured:</span>
              <Switch
                id="featured-filter"
                checked={showFeatured}
                onCheckedChange={setShowFeatured}
                className="h-4 w-8"
              />
              <Label htmlFor="featured-filter" className="text-sm">
                {showFeatured ? 'Yes' : 'No'}
              </Label>
            </div>

            {/* Clear All Filters */}
            {(search || statusFilter || categoryFilter || dateRange[0]?.startDate || minPrice || maxPrice || tags.length > 0 || showFeatured) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs ml-auto"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  setCategoryFilter('');
                  setDateRange([{ startDate: null, endDate: null, key: 'selection' }]);
                  setMinPrice('');
                  setMaxPrice('');
                  setTags([]);
                  setShowFeatured(false);
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        </div>

        {/* 🎟️ Event Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/80 rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full"></div>
                    <div className="h-3 bg-gray-100 rounded w-5/6"></div>
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
          ) : filteredEvents.length === 0 ? (
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
            filteredEvents.map((event) => {
              const lowestPriceTicket = event.tickets.length > 0
                ? event.tickets.reduce((min, t) => t.price < min.price ? t : min, event.tickets[0])
                : null;

              return (
                <Card
                  key={event._id}
                  className="overflow-hidden rounded-2xl shadow-sm hover:shadow-lg bg-white border border-gray-100 group transition-all duration-300 hover:-translate-y-1"
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
                            <div key={i} className="h-7 w-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                              {String.fromCharCode(65 + i)}
                            </div>
                          ))}
                          <div className="h-7 w-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                            +{Math.max(0, (event as any).attendees?.length - 3 || 0)}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-200 hover:bg-gray-50 text-gray-700"
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
      </div>
    </RouteProtection>
  );
}
