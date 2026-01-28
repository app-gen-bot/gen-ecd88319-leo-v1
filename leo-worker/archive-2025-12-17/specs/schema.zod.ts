import { z } from 'zod';

// Enums
export const ChapelStyleSchema = z.enum(['traditional', 'modern', 'rustic', 'garden', 'beach', 'vintage', 'gothic', 'contemporary']);

export const BookingStatusSchema = z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'rejected']);

export const PackageTypeSchema = z.enum(['basic', 'standard', 'premium', 'custom']);

export const MessageStatusSchema = z.enum(['sent', 'delivered', 'read']);

export const PaymentStatusSchema = z.enum(['pending', 'paid', 'partial', 'refunded', 'failed']);

export const UserRoleSchema = z.enum(['couple', 'chapel_coordinator', 'admin']);

export const ReviewRatingSchema = z.number().min(1).max(5);

// Base entity schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().optional(),
  role: UserRoleSchema,
  profileImageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CoupleProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  partnerFirstName: z.string().min(1).max(100),
  partnerLastName: z.string().min(1).max(100),
  partnerEmail: z.string().email().optional(),
  weddingDate: z.date().optional(),
  guestCount: z.number().min(1).max(1000).optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  preferredStyle: ChapelStyleSchema.optional(),
  specialRequirements: z.string().max(1000).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const ChapelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  zipCode: z.string().min(1).max(20),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  style: ChapelStyleSchema,
  capacity: z.number().min(1).max(1000),
  basePrice: z.number().min(0),
  pricePerGuest: z.number().min(0).optional(),
  amenities: z.array(z.string()).default([]),
  photoUrls: z.array(z.string().url()).default([]),
  virtualTourUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  coordinatorId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const AvailabilitySlotSchema = z.object({
  id: z.string().uuid(),
  chapelId: z.string().uuid(),
  date: z.date(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
  isAvailable: z.boolean().default(true),
  price: z.number().min(0).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const PackageSchema = z.object({
  id: z.string().uuid(),
  chapelId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  type: PackageTypeSchema,
  basePrice: z.number().min(0),
  duration: z.number().min(30).max(480), // Duration in minutes
  includedServices: z.array(z.string()).default([]),
  maxGuests: z.number().min(1).max(1000).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const AddOnSchema = z.object({
  id: z.string().uuid(),
  chapelId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(500),
  price: z.number().min(0),
  category: z.string().min(1).max(100), // e.g., 'photography', 'flowers', 'music'
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const BookingSchema = z.object({
  id: z.string().uuid(),
  coupleId: z.string().uuid(),
  chapelId: z.string().uuid(),
  packageId: z.string().uuid(),
  availabilitySlotId: z.string().uuid(),
  status: BookingStatusSchema,
  ceremonyDate: z.date(),
  ceremonyTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  guestCount: z.number().min(1).max(1000),
  totalPrice: z.number().min(0),
  depositAmount: z.number().min(0),
  notes: z.string().max(1000).optional(),
  specialRequests: z.string().max(1000).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const BookingAddOnSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  addOnId: z.string().uuid(),
  quantity: z.number().min(1).default(1),
  price: z.number().min(0), // Price at time of booking (for historical accuracy)
  createdAt: z.date(),
  updatedAt: z.date()
});

export const MessageSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  senderId: z.string().uuid(),
  receiverId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  status: MessageStatusSchema.default('sent'),
  attachmentUrls: z.array(z.string().url()).default([]),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  amount: z.number().min(0),
  currency: z.string().length(3).default('USD'), // ISO currency code
  status: PaymentStatusSchema,
  paymentMethod: z.string().min(1).max(100), // e.g., 'credit_card', 'bank_transfer'
  transactionId: z.string().optional(),
  paymentDate: z.date().optional(),
  dueDate: z.date().optional(),
  notes: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  coupleId: z.string().uuid(),
  chapelId: z.string().uuid(),
  rating: ReviewRatingSchema,
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  photoUrls: z.array(z.string().url()).default([]),
  isVerified: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Insert schemas (without auto-generated fields)
export const InsertUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const InsertCoupleProfileSchema = CoupleProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const InsertChapelSchema = ChapelSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const InsertAvailabilitySlotSchema = AvailabilitySlotSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const InsertPackageSchema = PackageSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const InsertAddOnSchema = AddOnSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const InsertBookingSchema = BookingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const InsertBookingAddOnSchema = BookingAddOnSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const InsertMessageSchema = MessageSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const InsertPaymentSchema = PaymentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const InsertReviewSchema = ReviewSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Update schemas (all fields optional except relationships)
export const UpdateUserSchema = InsertUserSchema.partial();

export const UpdateCoupleProfileSchema = InsertCoupleProfileSchema.partial().extend({
  userId: z.string().uuid() // Keep userId required for updates
});

export const UpdateChapelSchema = InsertChapelSchema.partial();

export const UpdateAvailabilitySlotSchema = InsertAvailabilitySlotSchema.partial().extend({
  chapelId: z.string().uuid() // Keep chapelId required for updates
});

export const UpdatePackageSchema = InsertPackageSchema.partial().extend({
  chapelId: z.string().uuid() // Keep chapelId required for updates
});

export const UpdateAddOnSchema = InsertAddOnSchema.partial().extend({
  chapelId: z.string().uuid() // Keep chapelId required for updates
});

export const UpdateBookingSchema = InsertBookingSchema.partial();

export const UpdateBookingAddOnSchema = InsertBookingAddOnSchema.partial().extend({
  bookingId: z.string().uuid(),
  addOnId: z.string().uuid()
});

export const UpdateMessageSchema = InsertMessageSchema.partial().extend({
  bookingId: z.string().uuid() // Keep bookingId required for updates
});

export const UpdatePaymentSchema = InsertPaymentSchema.partial().extend({
  bookingId: z.string().uuid() // Keep bookingId required for updates
});

export const UpdateReviewSchema = InsertReviewSchema.partial().extend({
  bookingId: z.string().uuid(),
  coupleId: z.string().uuid(),
  chapelId: z.string().uuid()
});

// TypeScript type exports
export type User = z.infer<typeof UserSchema>;
export type InsertUser = z.infer<typeof InsertUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export type CoupleProfile = z.infer<typeof CoupleProfileSchema>;
export type InsertCoupleProfile = z.infer<typeof InsertCoupleProfileSchema>;
export type UpdateCoupleProfile = z.infer<typeof UpdateCoupleProfileSchema>;

export type Chapel = z.infer<typeof ChapelSchema>;
export type InsertChapel = z.infer<typeof InsertChapelSchema>;
export type UpdateChapel = z.infer<typeof UpdateChapelSchema>;

export type AvailabilitySlot = z.infer<typeof AvailabilitySlotSchema>;
export type InsertAvailabilitySlot = z.infer<typeof InsertAvailabilitySlotSchema>;
export type UpdateAvailabilitySlot = z.infer<typeof UpdateAvailabilitySlotSchema>;

export type Package = z.infer<typeof PackageSchema>;
export type InsertPackage = z.infer<typeof InsertPackageSchema>;
export type UpdatePackage = z.infer<typeof UpdatePackageSchema>;

export type AddOn = z.infer<typeof AddOnSchema>;
export type InsertAddOn = z.infer<typeof InsertAddOnSchema>;
export type UpdateAddOn = z.infer<typeof UpdateAddOnSchema>;

export type Booking = z.infer<typeof BookingSchema>;
export type InsertBooking = z.infer<typeof InsertBookingSchema>;
export type UpdateBooking = z.infer<typeof UpdateBookingSchema>;

export type BookingAddOn = z.infer<typeof BookingAddOnSchema>;
export type InsertBookingAddOn = z.infer<typeof InsertBookingAddOnSchema>;
export type UpdateBookingAddOn = z.infer<typeof UpdateBookingAddOnSchema>;

export type Message = z.infer<typeof MessageSchema>;
export type InsertMessage = z.infer<typeof InsertMessageSchema>;
export type UpdateMessage = z.infer<typeof UpdateMessageSchema>;

export type Payment = z.infer<typeof PaymentSchema>;
export type InsertPayment = z.infer<typeof InsertPaymentSchema>;
export type UpdatePayment = z.infer<typeof UpdatePaymentSchema>;

export type Review = z.infer<typeof ReviewSchema>;
export type InsertReview = z.infer<typeof InsertReviewSchema>;
export type UpdateReview = z.infer<typeof UpdateReviewSchema>;

// Enum type exports
export type ChapelStyle = z.infer<typeof ChapelStyleSchema>;
export type BookingStatus = z.infer<typeof BookingStatusSchema>;
export type PackageType = z.infer<typeof PackageTypeSchema>;
export type MessageStatus = z.infer<typeof MessageStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;