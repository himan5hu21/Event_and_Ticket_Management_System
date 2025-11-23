import RouteProtection from "@/components/auth/RouteProtection";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { lazy, Suspense } from "react"

const EventPageLayout = lazy(() => import("@/components/events/EventPageLayout"))



const EventPage = () => {
  return (
    <RouteProtection allowedRoles={["customer"]}>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 dark:from-indigo-600 dark:to-blue-600 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-1">
                Discover Events
              </h1>
              <p className="text-indigo-100 dark:text-indigo-200">
                Find amazing events happening near you and around the world
              </p>
            </div>
          </div>
          <EventPageLayout />
        </div>
      </Suspense>
    </RouteProtection>
  )
}

export default EventPage;