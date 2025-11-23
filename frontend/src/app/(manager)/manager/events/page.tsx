import RouteProtection from "@/components/auth/RouteProtection";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { lazy, Suspense } from "react"

const EventPageLayout = lazy(() => import("@/components/events/EventPageLayout"))



const EventPage = () => {
  return (
    <RouteProtection allowedRoles={["event-manager"]}>
      <Suspense fallback={<div>Loading...</div>}>
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
            asChild
            variant="outline"
            className="mt-4 md:mt-0 bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white shadow-md font-medium transition-colors"
          >
            <Link href="/manager/events/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Link>
          </Button>
        </div>
        <EventPageLayout />
        </div>
      </Suspense>
    </RouteProtection>
  )
}

export default EventPage;