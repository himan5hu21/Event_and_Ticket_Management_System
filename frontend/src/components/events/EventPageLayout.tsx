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
import { type DateRange } from "react-day-picker";
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
  CalendarIcon,
} from "lucide-react";
import { useState, useEffect, lazy, Suspense, useRef } from "react";
import { PopoverClose } from "@radix-ui/react-popover";
import Image from "next/image";
import { format } from "date-fns";
import { useEvents } from "@/hooks/api/events";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "../ui/calendar";
// import EventCardGrid from "@/components/events/EventCardGrid";

const EventCardsGrid = lazy(() => import("@/components/events/EventCardGrid"));

// function Calendar23() {
//   const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
//   const [isOpen, setIsOpen] = useState(false);

//   return (

//   );
// }

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
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
    startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
    endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
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

  const allEvents: Event[] = eventsResponse?.data?.items || [];
  const totalItems = eventsResponse?.data?.totalItems || 0;
  const totalPages = eventsResponse?.data?.totalPages || 1;
  const hasNextPage = eventsResponse?.data?.hasNextPage || false;
  const hasPrevPage = eventsResponse?.data?.hasPrevPage || false;

  const prevPageRef = useRef<number>(currentPage);
  const popoverTriggerRef = useRef<HTMLButtonElement>(null);

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

      <>


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
                <div className="flex items-center">
                  <div className="relative">
                  <Popover>
      <PopoverTrigger asChild ref={popoverTriggerRef}>
        <Button
          variant="outline"
          className="w-64 justify-between font-normal h-10 gap-2 text-left"
        >
          <CalendarIcon className="h-4 w-4" />
          <span>
            {dateRange?.from && dateRange?.to
              ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`
              : 'Select date range'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 z-[100]" align="start" sideOffset={5} style={{zIndex: 100}}>
        <div className="flex flex-col">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(newRange) => {
              setDateRange(newRange);
              
              // Only close if both dates are selected and the selection is complete
              // (i.e., the user has clicked two different dates)
              if (newRange?.from && newRange?.to && 
                  newRange.from.getTime() !== newRange.to.getTime()) {
                setTimeout(() => {
                  popoverTriggerRef.current?.click();
                }, 10);
              }
            }}
            className="w-full border-0 dark:bg-card dark:text-foreground rounded-t-lg"
          />
          {(dateRange?.from || dateRange?.to) && (
            <div className="p-2 border-t flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-destructive hover:text-destructive/90"
                onClick={(e) => {
                  e.stopPropagation();
                  setDateRange({ from: undefined, to: undefined });
                }}
              >
                Clear selection
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
                  </div>
                </div>

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
                dateRange?.from ||
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
                      setDateRange(undefined);
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
      </>
  );
}
