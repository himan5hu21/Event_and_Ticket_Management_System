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
  startDate: z.string(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  category: z.string(),
  subcategory: z.string().optional(),
  tickets: z.array(z.object({
    type: z.string(),
    price: z.number(),
    quantity: z.number(),
    sold: z.number().optional(),
  })),
  imageUrl: z.string().optional(),
  imageId: z.string().optional(),
  createdBy: z.object({
    _id: z.string(),
    name: z.string(),
    organization: z.string().nullable().optional(),
  }),
  verified: z.boolean().optional(),
  status: z.enum(['draft', 'pending', 'active', 'cancelled']),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number().optional(),
});

export const CreateEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  tickets: z.array(z.object({
    type: z.string().min(1, 'Ticket type is required'),
    price: z.number().min(0, 'Price must be 0 or more'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one ticket type is required'),
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
  data: z.any().optional().nullable(),
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
export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & { 
  data: T | null | undefined;
  success: boolean;
  message: string;
};
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
