"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Search, 
  Filter, 
  MapPin,
  Users,
  DollarSign,
  Clock,
  Star
} from "lucide-react";
import { useEvents } from "@/hooks/api/events";
import { format } from "date-fns";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");

  const { data: eventsResponse, isLoading, error } = useEvents({
    search,
    category: categoryFilter || undefined,
    limit: 20,
  });

  const events = eventsResponse?.data?.items || [];

  const categories = [
    { value: "", label: "All Categories" },
    { value: "music", label: "Music" },
    { value: "technology", label: "Technology" },
    { value: "business", label: "Business" },
    { value: "food", label: "Food & Drink" },
    { value: "sports", label: "Sports" },
    { value: "arts", label: "Arts" },
    { value: "education", label: "Education" },
    { value: "health", label: "Health & Wellness" },
  ];

  const priceRanges = [
    { value: "", label: "All Prices" },
    { value: "free", label: "Free" },
    { value: "0-25", label: "$0 - $25" },
    { value: "25-50", label: "$25 - $50" },
    { value: "50-100", label: "$50 - $100" },
    { value: "100+", label: "$100+" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Discover Events</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find amazing events happening near you and around the world
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <Button variant="outline" className="h-10">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">
            {events.length} Events Found
          </h2>
          <p className="text-muted-foreground">
            {search && `Results for "${search}"`}
            {categoryFilter && ` in ${categories.find(c => c.value === categoryFilter)?.label}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Sort by Date
          </Button>
          <Button variant="outline" size="sm">
            <DollarSign className="h-4 w-4 mr-2" />
            Sort by Price
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-full text-center py-8">
            <p className="text-destructive">Error loading events</p>
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or check back later for new events
            </p>
            <Button onClick={() => {
              setSearch("");
              setCategoryFilter("");
              setPriceFilter("");
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          events.map((event) => {
            const lowestPriceTicket = event.tickets.length > 0
              ? event.tickets.reduce((min: { price: number }, ticket: { price: number }) => 
                  ticket.price < min.price ? ticket : min, event.tickets[0])
              : null;

            const totalSold = event.tickets.reduce((total: number, ticket: { sold: number }) => total + ticket.sold, 0);
            const totalCapacity = event.tickets.reduce((total: number, ticket: { quantity: number }) => total + ticket.quantity, 0);
            const soldPercentage = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;

            return (
              <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="h-48 relative overflow-hidden">
                  <Image 
                    src={event.imageUrl || '/images/event-placeholder.jpg'} 
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {event.category && (
                    <div className="absolute top-4 left-4">
                      <Badge variant="outline" className="bg-white/90">
                        {event.category}
                      </Badge>
                    </div>
                  )}
                  {soldPercentage > 80 && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="destructive">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2 mb-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(event.startDate), 'MMM d, yyyy')}
                          {event.endDate && ` - ${format(new Date(event.endDate), 'MMM d, yyyy')}`}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">
                          {lowestPriceTicket 
                            ? `From $${lowestPriceTicket.price.toFixed(2)}` 
                            : 'Free'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {totalSold} / {totalCapacity} sold
                          </span>
                        </div>
                        <span className="font-medium">{soldPercentage}% sold</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${soldPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Created by {event.createdBy?.name || 'Unknown'}</span>
                      </div>
                      <Button asChild>
                        <Link href={`/events/${event._id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Load More */}
      {events.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Events
          </Button>
        </div>
      )}
    </div>
  );
}
