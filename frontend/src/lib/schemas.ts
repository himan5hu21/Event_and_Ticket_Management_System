import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['customer', 'admin', 'event-manager']),
  organization: z.string().optional(),
  verified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
});

export const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(3),
  role: z.enum(['customer', 'admin', 'event-manager']),
  organization: z.string().optional(),
});

// Event schemas
export const EventSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  date: z.string(),
  time: z.string(),
  location: z.string(),
  category: z.string(),
  price: z.number(),
  totalTickets: z.number(),
  availableTickets: z.number(),
  image: z.string().optional(),
  organizer: z.string(),
  status: z.enum(['draft', 'published', 'cancelled']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string(),
  time: z.string(),
  location: z.string().min(1),
  category: z.string().min(1),
  price: z.number().min(0),
  totalTickets: z.number().min(1),
  image: z.string().optional(),
});

export const UpdateEventSchema = CreateEventSchema.partial();

// Ticket schemas
export const TicketSchema = z.object({
  _id: z.string(),
  eventId: z.string(),
  userId: z.string(),
  quantity: z.number(),
  totalPrice: z.number(),
  status: z.enum(['pending', 'confirmed', 'cancelled']),
  bookingDate: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateTicketSchema = z.object({
  eventId: z.string(),
  quantity: z.number().min(1),
});

// Order schemas
export const OrderSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  tickets: z.array(TicketSchema),
  totalAmount: z.number(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  paymentId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// API Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
});

export const PaginatedResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    items: z.array(z.any()),
    totalItems: z.number(),
    totalPages: z.number(),
    currentPage: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
  }),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type RegisterData = z.infer<typeof RegisterSchema>;
export type Event = z.infer<typeof EventSchema>;
export type CreateEventData = z.infer<typeof CreateEventSchema>;
export type UpdateEventData = z.infer<typeof UpdateEventSchema>;
export type Ticket = z.infer<typeof TicketSchema>;
export type CreateTicketData = z.infer<typeof CreateTicketSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & { data?: T };
export type PaginatedResponse<T = any> = z.infer<typeof PaginatedResponseSchema> & { 
  data: { 
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } 
};
