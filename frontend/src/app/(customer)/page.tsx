"use client";

import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Ticket, Star, CheckCircle2, Search, Music, Code2, Briefcase, Utensils, Trophy, Palette, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useEvents } from "@/hooks/api/events";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function HomePage() {

  const router = useRouter();

  // Fetch featured events
  const { data: eventsResponse, isLoading, error, isError } = useEvents({
    limit: 3,
  });

  // Debug logging
  React.useEffect(() => {
    if (isError) {
      console.error('Error fetching events:', error);
    }
    if (eventsResponse) {
      console.log('Events response:', eventsResponse);
      if (eventsResponse.data) {
        console.log('Events data:', eventsResponse.data);
      }
    }
  }, [eventsResponse, error, isError]);

  const featuredEvents = eventsResponse?.data?.items || [];

  const categories = [
    { name: "Music", icon: <Music className="h-6 w-6" />, count: 128 },
    { name: "Technology", icon: <Code2 className="h-6 w-6" />, count: 92 },
    { name: "Business", icon: <Briefcase className="h-6 w-6" />, count: 86 },
    { name: "Food & Drink", icon: <Utensils className="h-6 w-6" />, count: 64 },
    { name: "Sports", icon: <Trophy className="h-6 w-6" />, count: 57 },
    { name: "Arts", icon: <Palette className="h-6 w-6" />, count: 43 },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Event Organizer",
      content: "This platform made selling tickets for our conference incredibly easy. The analytics dashboard is a game-changer!",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Music Festival Attendee",
      content: "Found amazing events I wouldn't have discovered otherwise. The mobile check-in was super smooth.",
      rating: 5
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Small Business Owner",
      content: "As a local business, this platform helped us reach a whole new audience for our workshops.",
      rating: 4
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Find Events",
      description: "Browse through thousands of events in various categories.",
      icon: <Search className="h-8 w-8 text-primary" />,
      bgColor: "bg-blue-50"
    },
    {
      number: 2,
      title: "Book Tickets",
      description: "Secure your spot with our easy checkout process.",
      icon: <Ticket className="h-8 w-8 text-emerald-500" />,
      bgColor: "bg-emerald-50"
    },
    {
      number: 3,
      title: "Enjoy the Experience",
      description: "Attend amazing events and create unforgettable memories.",
      icon: <CheckCircle2 className="h-8 w-8 text-purple-500" />,
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="min-h-screen bg-customer-bg">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-customer-primary/5 to-customer-secondary/10 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Discover & Book Amazing Events
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Find the best concerts, workshops, and experiences in your city. Your next adventure starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-6 text-lg" onClick={() => router.push("/events")}>
              <Calendar className="mr-2 h-5 w-5" />
              Browse Events
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
              Create Event
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Featured Events</h2>
            <Link href="/events" className="text-primary hover:underline">View All</Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-customer-card rounded-xl overflow-hidden shadow-lg">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Error loading events. Please try again later.</p>
              {error && (
                <p className="text-sm text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
              )}
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                {/* Empty State Icon */}
                <div className="relative mb-8">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-customer-primary/10 to-customer-secondary/10 rounded-full flex items-center justify-center">
                    <Calendar className="h-16 w-16 text-customer-primary/60" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-customer-primary/20 rounded-full flex items-center justify-center">
                    <Search className="h-4 w-4 text-customer-primary" />
                  </div>
                </div>
                
                {/* Empty State Content */}
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  No Featured Events Yet
                </h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  We're working hard to bring you amazing events! Check back soon for exciting experiences, or be the first to create an event in your community.
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="px-8 py-3">
                    <Calendar className="mr-2 h-5 w-5" />
                    Browse All Events
                  </Button>
                  <Button variant="outline" size="lg" className="px-8 py-3">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Event
                  </Button>
                </div>
                
                {/* Coming Soon Section */}
                <div className="mt-12 p-6 bg-gradient-to-r from-customer-primary/5 to-customer-secondary/5 rounded-xl border border-customer-border">
                  <div className="flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-customer-primary mr-2" />
                    <h4 className="text-lg font-semibold text-foreground">Coming Soon</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    We're curating amazing events just for you. Stay tuned for:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <div className="w-2 h-2 bg-customer-primary rounded-full mr-2"></div>
                      Music Concerts
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <div className="w-2 h-2 bg-customer-primary rounded-full mr-2"></div>
                      Tech Workshops
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <div className="w-2 h-2 bg-customer-primary rounded-full mr-2"></div>
                      Food Festivals
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <div className="w-2 h-2 bg-customer-primary rounded-full mr-2"></div>
                      Art Exhibitions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => {
                // Get the lowest priced ticket for display
                const lowestPriceTicket = event.tickets.length > 0
                  ? event.tickets.reduce((min: { price: number }, ticket: { price: number }) => 
                      ticket.price < min.price ? ticket : min, event.tickets[0])
                  : null;
                  
                return (
                  <div key={event._id} className="bg-customer-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-customer-border">
                    <div className="h-48 relative">
                      <Image 
                        src={event.imageUrl || '/images/event-placeholder.jpg'} 
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {event.category && (
                        <div className="absolute top-4 right-4 bg-customer-card/90 text-foreground px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                          {event.category}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2 h-14">{event.title}</h3>
                      <div className="flex items-center text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {format(new Date(event.startDate), 'MMM d, yyyy')}
                          {event.endDate && ` - ${format(new Date(event.endDate), 'MMM d, yyyy')}`}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">
                          {lowestPriceTicket 
                            ? `From $${lowestPriceTicket.price.toFixed(2)}` 
                            : 'Free'}
                        </span>
                        <Button asChild size="sm">
                          <Link href={`/events/${event._id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link 
                key={category.name}
                href={`/events?category=${category.name.toLowerCase()}`}
                className="bg-card p-6 rounded-lg text-center hover:shadow-md transition-shadow"
              >
                <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                  {category.icon}
                </div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count} events</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full mb-4">
              Simple Steps
            </span>
            <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Getting started with Eventify is quick and easy. Follow these simple steps to find and book your next event.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-customer-primary/20 to-transparent -translate-y-1/2 z-0"></div>
            {steps.map((step, index) => (
              <div 
                key={step.number} 
                className="relative z-10 text-center p-8 rounded-2xl bg-customer-card border border-customer-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative flex justify-center mb-8">
                  <div className={`w-16 h-16 bg-customer-primary/10 group-hover:bg-customer-primary/20 rounded-2xl flex items-center justify-center mx-auto relative z-10 transition-colors duration-300`}>
                    {React.cloneElement(step.icon, { className: 'h-8 w-8 text-customer-primary transition-transform group-hover:scale-110' })}
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-customer-primary text-customer-card rounded-full flex items-center justify-center font-bold text-sm ring-4 ring-customer-bg">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-b from-customer-primary/5 to-customer-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 text-sm font-medium text-amber-500 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 rounded-full mb-4">
              Testimonials
            </span>
            <h2 className="text-4xl font-bold text-center mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Hear from our community of event organizers and attendees about their experiences.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => {
              const colors = [
                'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20',
                'from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20',
                'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20'
              ];
              const borderColors = [
                'border-blue-100 dark:border-blue-800/50',
                'border-emerald-100 dark:border-emerald-800/50',
                'border-purple-100 dark:border-purple-800/50'
              ];
              const textColors = [
                'text-blue-600 dark:text-blue-400',
                'text-emerald-600 dark:text-emerald-400',
                'text-purple-600 dark:text-purple-400'
              ];
              
              return (
                <div 
                  key={testimonial.id} 
                  className={`bg-gradient-to-br ${colors[index % 3]} p-6 rounded-xl border ${borderColors[index % 3]} hover:shadow-lg transition-shadow duration-300`}
                >
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-4 ${textColors[index % 3]} bg-white dark:bg-gray-800`}>
                      {testimonial.name.charAt(0)}
                    </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-foreground mb-4">"{testimonial.content}"</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating
                          ? 'text-amber-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-customer-primary/5 to-customer-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Next Event?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of event-goers discovering amazing experiences every day.
          </p>
          <Button size="lg" className="px-8 py-6 text-lg">
            <Calendar className="mr-2 h-5 w-5" />
            Browse Events
          </Button>
        </div>
      </section>
    </div>
  );
}
