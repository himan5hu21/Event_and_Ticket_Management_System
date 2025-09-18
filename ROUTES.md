# Event Management System - Route Structure

## Overview
This document outlines the complete route structure for the Event Management System, including frontend routes, backend API endpoints, and role-based access control.

## User Roles
- **Customer**: Browse and book events
- **Event Manager**: Create and manage events
- **Admin**: Full system management

## Frontend Routes

### Public Routes (No Authentication Required)
```
/                           - Homepage (Featured Events)
/auth/signin               - User Login
/auth/signup               - User Registration
/events                    - Browse All Events
/events/[id]               - Event Details
```

### Customer Routes (Customer Role Required)
```
/                          - Homepage (Customer Layout)
/events                    - Browse Events
/events/[id]               - Event Details
/events/[id]/book          - Book Event Tickets
/profile                   - User Profile
/orders                    - User's Orders
/tickets                   - User's Tickets
```

### Event Manager Routes (Event Manager Role Required)
```
/manager/dashboard         - Manager Dashboard
/manager/events            - My Events List
/manager/events/create     - Create New Event
/manager/events/[id]/edit  - Edit Event
/manager/events/[id]       - Event Details
/manager/tickets           - Ticket Management
/manager/attendees         - Attendee Management
/manager/analytics         - Event Analytics
/manager/analytics/events  - Event Performance
/manager/analytics/attendees - Attendee Insights
/manager/analytics/revenue - Revenue Reports
/manager/settings          - Manager Settings
```

### Admin Routes (Admin Role Required)
```
/admin/dashboard           - Admin Dashboard
/admin/users               - User Management
/admin/users/verify        - Verify Users
/admin/users/managers      - Event Managers
/admin/events              - All Events Management
/admin/events/verify       - Verify Events
/admin/events/categories   - Event Categories
/admin/tickets             - Ticket Management
/admin/orders              - Order Management
/admin/analytics           - System Analytics
/admin/analytics/revenue   - Revenue Reports
/admin/analytics/users     - User Analytics
/admin/analytics/events    - Event Performance
/admin/settings            - System Settings
```

## Backend API Routes

### Authentication Routes (`/auth`)
```
POST /auth/sign-in         - User Login
POST /auth/sign-up         - User Registration
GET  /auth/logout          - User Logout
GET  /auth/me              - Get Current User (Protected)
```

### User Routes (`/users`)
```
GET    /users              - Get All Users (Admin Only)
GET    /users/:userId      - Get User by ID (Admin Only)
PUT    /users/:userId      - Update User (Admin Only)
PUT    /users/verify/:userId - Verify User (Admin Only)
GET    /users/profile      - Get User Profile (Protected)
PUT    /users/profile/update - Update User Profile (Protected)
```

### Event Routes (`/event`)
```
GET    /event/list         - Get All Events (Public)
GET    /event/list/:eventId - Get Single Event (Public)
POST   /event/create       - Create Event (Event Manager/Admin)
PUT    /event/update/:eventId - Update Event (Event Manager/Admin)
DELETE /event/delete/:eventId - Delete Event (Event Manager/Admin)
GET    /event/owner/       - Get Owned Events (Event Manager/Admin)
PUT    /event/verify/:eventId - Verify Event (Admin Only)
```

### Order Routes (`/orders`)
```
POST   /orders/:eventId    - Create Order (Protected)
POST   /orders/verify      - Verify Payment (Protected)
GET    /orders/:orderId    - Get Order Details (Protected)
GET    /orders/            - Get All Orders (Protected)
```

## Route Protection

### Frontend Protection
- **RouteProtection Component**: Wraps protected routes
- **Role-based Access**: Different layouts for different roles
- **Authentication Check**: Redirects to login if not authenticated
- **Role Validation**: Redirects to appropriate dashboard based on role

### Backend Protection
- **authMiddleware**: Validates JWT tokens
- **checkAdmin**: Ensures admin role
- **checkEventPermission**: Ensures event manager or admin role
- **optionalAuth**: Optional authentication for public routes

## Navigation Structure

### Admin Sidebar Navigation
- Dashboard
- User Management (All Users, Verify Users, Event Managers)
- Event Management (All Events, Verify Events, Event Categories)
- Ticket Management
- Orders
- Analytics (Revenue Reports, User Analytics, Event Performance)
- System Settings

### Manager Sidebar Navigation
- Dashboard
- My Events (All Events, Create Event, Drafts)
- Event Types
- Tickets
- Attendees
- Analytics (Event Analytics, Attendee Insights, Revenue Reports)
- Settings

### Customer Navigation
- Home
- Browse Events
- My Profile
- My Orders
- My Tickets

## Route Parameters

### Event Routes
- `[id]` - Event ID (MongoDB ObjectId)

### User Routes
- `[userId]` - User ID (MongoDB ObjectId)

### Order Routes
- `[orderId]` - Order ID (MongoDB ObjectId)
- `[eventId]` - Event ID for creating orders

## Query Parameters

### Event Listings
- `page` - Page number for pagination
- `limit` - Number of items per page
- `category` - Filter by event category
- `status` - Filter by event status
- `search` - Search term
- `sortBy` - Sort field (title, date, price)
- `order` - Sort order (asc, desc)

### User Management
- `role` - Filter by user role
- `verified` - Filter by verification status
- `search` - Search term

## Error Handling

### Frontend
- 404 pages for non-existent routes
- Route protection redirects
- Loading states for async operations
- Error boundaries for component errors

### Backend
- 404 for non-existent resources
- 401 for unauthorized access
- 403 for forbidden actions
- 400 for validation errors
- 500 for server errors

## Security Considerations

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Role-based access control
3. **Input Validation**: Zod schemas for data validation
4. **CORS**: Configured for specific origins
5. **Rate Limiting**: Implemented for API endpoints
6. **File Upload**: Secure image upload with Cloudinary

## Development Notes

- All routes use TypeScript for type safety
- React Query for data fetching and caching
- Next.js App Router for file-based routing
- Express.js for backend API routes
- MongoDB for data persistence
- Cloudinary for image storage
