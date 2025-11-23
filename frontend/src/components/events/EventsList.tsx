"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Plus, XCircle, CheckCircle, MapPin, RefreshCw, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DateRange } from "react-date-range";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { useEvents } from "@/hooks/api";

type UserRole = 'admin' | 'event-manager' | 'customer';

type StatusOption = {
  value: string;
  label: string;
};

type Filters = {
  search: string;
  status: string[];
  category: string;
  startDate: Date | null;
  endDate: Date | null;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

export interface EventsListProps {
  userRole?: UserRole;
  showCreateButton?: boolean;
  showStatusFilter?: boolean;
  defaultFilters?: {
    status?: string;
    createdBy?: string;
  };
  title?: string;
  description?: string;
  showStats?: boolean;
}

export function EventsList({
  userRole = 'customer',
  showCreateButton = false,
  showStatusFilter = true,
  defaultFilters = {},
  title = 'Events',
  description = 'Browse our upcoming events',
  showStats = false,
}: EventsListProps) {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10); // Default page size
  
  // Initialize filters based on user role
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: userRole === 'customer' ? ['active'] : [],
    category: '',
    startDate: null,
    endDate: null,
    minPrice: '',
    maxPrice: '',
    sortBy: 'date',
    sortOrder: 'asc',
  });

  // Status options based on user role
  const statusOptions: StatusOption[] = useMemo(() => {
    const baseOptions: StatusOption[] = [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
    ];

    if (userRole === 'admin') {
      return [
        ...baseOptions,
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'completed', label: 'Completed' },
        { value: 'draft', label: 'Draft' },
      ];
    }

    if (userRole === 'event-manager') {
      return baseOptions;
    }

    return [{ value: 'active', label: 'Active' }];
  }, [userRole]);

  const queryParams = {
    page: currentPage,
    limit: limit,
    search: filters.search || undefined,
    status: filters.status.length > 0 ? filters.status.join(',') : defaultFilters.status || undefined,
    category: filters.category || undefined,
    startDate: filters.startDate ? filters.startDate.toISOString() : undefined,
    endDate: filters.endDate ? (() => {
      const endOfDay = new Date(filters.endDate!);
      endOfDay.setHours(23, 59, 59, 999);
      return endOfDay.toISOString();
    })() : undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    sort: filters.sortBy ? `${filters.sortOrder === 'desc' ? '-' : ''}${filters.sortBy}` : undefined,
    organizer: defaultFilters.createdBy || undefined,
  };

  // Fetch events with current filters
  const { data, isLoading, error, refetch } = useEvents(queryParams);
  // Handle filter changes
  const handleFilterChange = (name: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: '',
      status: userRole === 'customer' ? ['active'] : [],
      category: '',
      startDate: null,
      endDate: null,
      minPrice: '',
      maxPrice: '',
      sortBy: 'date',
      sortOrder: 'asc',
    });
    setCurrentPage(1);
  };

  // Get status badge with icon
  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium";

    switch (status) {
      case 'active':
        return (
          <Badge className={`${baseClasses} bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/40`}>
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        );
      case 'pending':
        return (
          <Badge className={`${baseClasses} bg-amber-100 text-amber-800 hover:bg-amber-100/80 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/40`}>
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className={`${baseClasses} bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/40`}>
            <XCircle className="h-3 w-3" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
    }
  };

  // Get minimum ticket price
  const getMinPrice = (tickets: Array<{ price: number }>): string => {
    if (!tickets || tickets.length === 0) return 'Free';
    const minPrice = Math.min(...tickets.map(t => t.price));
    return minPrice === 0 ? 'Free' : `$${minPrice}`;
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Unable to load events</h3>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {showCreateButton && (
          <Button onClick={() => router.push('/admin/events/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Status Filter */}
          {showStatusFilter && (
            <Select
              value={filters.status[0] || 'all'}
              onValueChange={(value) => {
                if (value === 'all') {
                  handleFilterChange('status', []);
                } else {
                  handleFilterChange('status', [value]);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Sort */}
          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split('-') as [string, 'asc' | 'desc'];
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Date: Oldest first</SelectItem>
              <SelectItem value="date-desc">Date: Newest first</SelectItem>
              <SelectItem value="title-asc">Title: A to Z</SelectItem>
              <SelectItem value="title-desc">Title: Z to A</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={resetFilters}
            className="whitespace-nowrap"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate && filters.endDate ? (
                  `${format(filters.startDate, 'MMM d, yyyy')} - ${format(filters.endDate, 'MMM d, yyyy')}`
                ) : (
                  <span>Select date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DateRange
                ranges={[{
                  startDate: filters.startDate || new Date(),
                  endDate: filters.endDate || new Date(),
                  key: 'selection'
                }]}
                onChange={(ranges) => {
                  const range = ranges.selection;
                  handleFilterChange('startDate', range.startDate);
                  handleFilterChange('endDate', range.endDate);
                }}
                moveRangeOnFirstSelection={false}
                months={2}
                direction="horizontal"
              />
            </PopoverContent>
          </Popover>

          {/* Price Range */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="w-full"
            />
            <Input
              type="number"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Category */}
          <Input
            placeholder="Filter by category"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          />
        </div>
      </div>

      {/* Events Grid */}
      {data?.data?.items && data.data.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.data.items.map((event) => (
            <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src={event.imageUrl || '/placeholder.svg'}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(event.status)}
                </div>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <span className="text-sm font-medium text-muted-foreground">
                    {getMinPrice(event.tickets)}
                  </span>
                </div>
                <CardDescription className="line-clamp-2">
                  {event.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(new Date(event.startDate), 'MMM d, yyyy')}
                </div>
                {event.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/events/${event._id}`}>View Details</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/events/${event._id}/book`}>Book Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters to find what you're looking for.
          </p>
          <Button variant="outline" onClick={resetFilters}>
            Clear all filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {data?.data && data.data.totalItems > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">
              {((currentPage - 1) * limit) + 1}
            </span> to{' '}
            <span className="font-medium">
              {Math.min(
                currentPage * limit,
                data.data.totalItems
              )}
            </span>{' '}
            of <span className="font-medium">{data.data.totalItems}</span> events
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!data.data.hasPrevPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!data.data.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}