# Chapel Eternal - Frontend Interaction Specification

## Table of Contents
1. [Application Overview & Design Philosophy](#application-overview--design-philosophy)
2. [Navigation Architecture](#navigation-architecture)
3. [Page-by-Page Specifications](#page-by-page-specifications)
4. [Form Specifications](#form-specifications)
5. [State Management & Data Flow](#state-management--data-flow)
6. [Error Handling & Loading States](#error-handling--loading-states)
7. [ASTOUNDING Design System Implementation](#astounding-design-system-implementation)
8. [Responsive Design Patterns](#responsive-design-patterns)
9. [API Integration Patterns](#api-integration-patterns)
10. [Performance & Accessibility Considerations](#performance--accessibility-considerations)

---

## Application Overview & Design Philosophy

### Application Vision
Chapel Eternal transforms wedding chapel discovery and booking into an elegant, romantic digital experience. The application embodies timeless romance through cutting-edge design, creating an emotional connection between couples and their perfect wedding venue.

### Core User Journey
**Discover → Explore → Book → Manage**
1. **Discover**: Browse and search chapels with advanced filtering
2. **Explore**: Deep dive into chapel details, packages, galleries, and reviews
3. **Book**: Complete booking flow with payment processing
4. **Manage**: Handle bookings, guests, and communication post-booking

### Target Personas
- **Primary**: Engaged couples planning their wedding ceremony
- **Secondary**: Chapel administrators managing their venue
- **Tertiary**: System administrators overseeing the platform

---

## Navigation Architecture

### Primary Navigation Structure
```
Header Navigation:
├── Logo (Home Link)
├── Discover Chapels
├── Popular Packages
├── My Bookings (Authenticated)
└── Profile/Login

Footer Navigation:
├── About Chapel Eternal
├── Support Center
├── Terms & Privacy
└── Contact Us
```

### Contract Mappings for Navigation
- **Discover Chapels**: `chapelsContract.getChapels` with filters
- **Popular Packages**: `packagesContract.getPopularPackages`
- **My Bookings**: `bookingsContract.getUserBookings`
- **Profile**: `usersContract.getUserProfile`

---

## Page-by-Page Specifications

### 1. Home Page (`/`)

#### Visual Design
- **Hero Section**: Dark gradient background with glassmorphism overlay
- **Search Component**: Prominent search with location, date, and guest count
- **Featured Chapels**: Carousel of top-rated venues
- **Popular Packages**: Grid of trending wedding packages
- **Reviews Section**: Testimonials with star ratings and photos

#### Components & Contract Mappings

##### Hero Search Component
```typescript
// Contract: chapelsContract.searchChapels
interface HeroSearchProps {
  onSearch: (params: {
    location: string;
    ceremonyDate: string;
    guestCount: number;
  }) => void;
}

// Form validation matches contract query schema
const searchSchema = z.object({
  location: z.string().min(1, "Location is required"),
  ceremonyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Valid date required"),
  guestCount: z.number().min(1, "Guest count must be at least 1")
});
```

##### Featured Chapels Carousel
```typescript
// Contract: chapelsContract.getChapels
// Query: { sortBy: 'rating', sortOrder: 'desc', limit: 8, isActive: true }
interface FeaturedChapel {
  id: string;
  name: string;
  location: string;
  heroImage: string;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
}
```

##### Popular Packages Grid
```typescript
// Contract: packagesContract.getPopularPackages
// Query: { limit: 6, priceRange: 'all' }
interface PopularPackage {
  id: string;
  name: string;
  price: number;
  chapel: {
    name: string;
    location: string;
    heroImage: string;
  };
  bookingCount: number;
  popularityScore: number;
}
```

#### Interactions & States
- **Search Form Submit**: Navigates to `/chapels` with search parameters
- **Chapel Card Click**: Navigates to `/chapels/:id`
- **Package Card Click**: Navigates to `/packages/:id`
- **Loading States**: Shimmer effects for all data-loading components
- **Error States**: Graceful fallbacks with retry buttons

### 2. Chapel Discovery Page (`/chapels`)

#### Visual Design
- **Filter Sidebar**: Glassmorphism panel with advanced filters
- **Results Grid**: Masonry layout of chapel cards
- **Map View Toggle**: Interactive map with chapel markers
- **Sort Controls**: Dropdown with sorting options

#### Components & Contract Mappings

##### Filter Sidebar Component
```typescript
// Contract: chapelsContract.getChapels
interface ChapelFilters {
  search?: string;
  city?: string;
  state?: string;
  country?: string;
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  minRating?: number;
  sortBy?: 'createdAt' | 'name' | 'pricePerHour' | 'rating' | 'capacity';
  sortOrder?: 'asc' | 'desc';
}

// Filter options populated from getChapels response filters
interface FilterOptions {
  cities: string[];
  states: string[];
  amenities: string[];
  priceRange: { min: number; max: number };
}
```

##### Chapel Card Component
```typescript
// Data from chapelsContract.getChapels response
interface ChapelCard {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  heroImage: string;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  capacity: number;
  amenities: string[];
}

// Actions
const handleChapelClick = (chapelId: string) => {
  navigate(`/chapels/${chapelId}`);
};

const handleCompareToggle = (chapelId: string) => {
  // Add/remove from comparison state (max 4 chapels)
  // Uses chapelsContract.compareChapels when 2+ selected
};
```

##### Pagination Component
```typescript
// Handles pagination from getChapels response
interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

#### Interactions & States
- **Filter Changes**: Real-time URL updates and API calls
- **Sort Changes**: Immediate re-fetch with new sort parameters
- **Compare Mode**: Multi-select up to 4 chapels for comparison
- **Infinite Scroll**: Load more results on scroll
- **Map Toggle**: Switch between grid and map view

### 3. Chapel Detail Page (`/chapels/:id`)

#### Visual Design
- **Hero Gallery**: Full-width image carousel with thumbnails
- **Information Tabs**: Details, Packages, Availability, Reviews, Gallery
- **Booking Widget**: Sticky sidebar with package selection
- **Related Chapels**: Suggested similar venues

#### Components & Contract Mappings

##### Hero Gallery Component
```typescript
// Contract: galleryContract.getChapelGallery
// Query: { isActive: true }
interface GalleryImage {
  id: string;
  imageUrl: string;
  title: string;
  category?: string;
  altText?: string;
  isHero: boolean;
}
```

##### Chapel Information Component
```typescript
// Contract: chapelsContract.getChapel
interface ChapelDetails {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  capacity: number;
  amenities: string[];
  pricePerHour: number;
  rating: number;
  reviewCount: number;
}
```

##### Packages Tab Component
```typescript
// Contract: chapelsContract.getChapelPackages
// Query: { isActive: true }
interface ChapelPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  inclusions: string[];
  maxGuests: number;
  image?: string;
}

const handlePackageSelect = (packageId: string) => {
  // Update booking widget state
  setSelectedPackage(packageId);
};
```

##### Availability Calendar Component
```typescript
// Contract: availabilityContract.getChapelAvailability
// Query: { startDate: currentMonth, endDate: nextMonth }
interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isRecurring: boolean;
}

const handleDateSelect = (date: string) => {
  // Populate available time slots for selected date
  setSelectedDate(date);
};
```

##### Reviews Tab Component
```typescript
// Contract: reviewsContract.getChapelReviews
// Query: { status: 'approved', sortBy: 'createdAt', sortOrder: 'desc' }
interface ChapelReview {
  id: string;
  rating: number;
  title: string;
  content: string;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  booking?: {
    ceremonyDate: string;
    packageName: string;
  };
  images: string[];
  helpful: {
    count: number;
    userHasMarkedHelpful?: boolean;
  };
}
```

##### Booking Widget Component
```typescript
// Combines multiple contracts for booking flow
interface BookingWidget {
  selectedPackage?: string;
  selectedDate?: string;
  selectedTime?: string;
  guestCount: number;
  addons: Array<{ addonId: string; quantity: number }>;
}

// Contract: bookingsContract.checkAvailability
const checkAvailability = async (params: {
  chapelId: string;
  packageId: string;
  ceremonyDate: string;
  ceremonyTime: string;
  duration: number;
}) => {
  // Returns availability status and suggested slots
};

// Contract: addonsContract.getChapelAddons
const loadAddons = (chapelId: string) => {
  // Load available add-ons for the chapel
};
```

#### Interactions & States
- **Gallery Navigation**: Smooth transitions between images
- **Tab Switching**: Lazy load content with skeleton states
- **Package Selection**: Updates booking widget and availability
- **Date/Time Selection**: Real-time availability checking
- **Booking Initiation**: Validates selection and starts booking flow

### 4. Booking Flow Pages (`/book/:chapelId`)

#### Visual Design
- **Multi-Step Progress**: Visual progress indicator
- **Form Sections**: Glassmorphism panels for each step
- **Summary Sidebar**: Persistent booking details
- **Secure Payment**: Trust indicators and SSL badges

#### Booking Flow Steps

##### Step 1: Event Details (`/book/:chapelId/details`)
```typescript
// Form validation matches InsertBookingSchema
interface EventDetailsForm {
  ceremonyDate: string; // YYYY-MM-DD
  ceremonyTime: string; // HH:MM
  guestCount: number;
  specialRequests?: string;
  contactEmail: string;
  contactPhone: string;
  partnerName: string;
}

// Contract: bookingsContract.checkAvailability
const validateAvailability = async (formData: EventDetailsForm) => {
  // Real-time availability checking as user types
};
```

##### Step 2: Package & Add-ons (`/book/:chapelId/packages`)
```typescript
// Contract: chapelsContract.getChapelPackages
interface PackageSelection {
  selectedPackageId: string;
  selectedAddons: Array<{
    addonId: string;
    quantity: number;
  }>;
}

// Contract: addonsContract.getChapelAddons
// Contract: addonsContract.getRecommendedAddons based on package
```

##### Step 3: Guest Management (`/book/:chapelId/guests`)
```typescript
// Contract: guestsContract.bulkInviteGuests
interface GuestInvitation {
  name: string;
  email: string;
  phone?: string;
  relationship: string;
  isSpecial: boolean; // VIP guest
}

const handleGuestImport = (guestList: GuestInvitation[]) => {
  // Bulk import with email validation
};
```

##### Step 4: Payment (`/book/:chapelId/payment`)
```typescript
// Contract: paymentsContract.createPaymentIntent
interface PaymentForm {
  paymentMethod: 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal';
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  saveCard?: boolean;
}

// Contract: bookingsContract.createBooking
const submitBooking = async (bookingData: InsertBookingSchema) => {
  // Creates booking and processes payment
};
```

##### Step 5: Confirmation (`/book/:chapelId/confirmation`)
```typescript
// Contract: bookingsContract.getBooking to display complete details
interface BookingConfirmation {
  confirmationNumber: string;
  booking: BookingDetails;
  paymentReceipt: PaymentDetails;
  nextSteps: string[];
}
```

#### Interactions & States
- **Form Validation**: Real-time validation with contract schemas
- **Step Navigation**: Prevent forward navigation if current step invalid
- **Auto-Save**: Save form progress to local storage
- **Payment Processing**: Loading states with progress indicators
- **Error Recovery**: Clear error messages and retry mechanisms

### 5. User Dashboard (`/dashboard`)

#### Visual Design
- **Overview Cards**: Booking statistics and quick actions
- **Upcoming Events**: Timeline view of confirmed bookings
- **Recent Activity**: Notifications and updates
- **Quick Actions**: Common tasks and shortcuts

#### Components & Contract Mappings

##### Dashboard Overview Component
```typescript
// Contract: bookingsContract.getUserBookings
interface DashboardOverview {
  upcomingBookings: number;
  pastBookings: number;
  totalSpent: number;
  favoriteChapels: number;
}

// Contract: notificationsContract.getUserNotifications
// Query: { limit: 5, type: 'in_app' }
```

##### Booking Timeline Component
```typescript
// Contract: bookingsContract.getUserBookings
// Query: { upcoming: true, sortBy: 'ceremonyDate', sortOrder: 'asc' }
interface TimelineBooking {
  id: string;
  ceremonyDate: string;
  ceremonyTime: string;
  status: BookingStatus;
  chapel: {
    name: string;
    location: string;
    heroImage: string;
  };
  package: {
    name: string;
    price: number;
  };
  daysUntil: number;
}
```

#### Interactions & States
- **Booking Actions**: Cancel, modify, view details
- **Notification Management**: Mark as read, dismiss
- **Quick Navigation**: Jump to specific booking sections

### 6. Booking Management Pages

#### Booking Detail Page (`/bookings/:id`)
```typescript
// Contract: bookingsContract.getBooking
interface BookingDetailView {
  booking: BookingDetails;
  chapel: ChapelInfo;
  package: PackageInfo;
  addons: BookingAddon[];
  payments: PaymentInfo[];
  guests: GuestInfo[];
  timeline: BookingEvent[];
}

// Available actions based on booking status
const getAvailableActions = (status: BookingStatus) => {
  switch (status) {
    case 'pending':
      return ['cancel', 'modify', 'confirm'];
    case 'confirmed':
      return ['cancel', 'view_contract', 'manage_guests'];
    case 'completed':
      return ['download_invoice', 'leave_review'];
    default:
      return [];
  }
};
```

#### Guest Management (`/bookings/:id/guests`)
```typescript
// Contract: guestsContract.getBookingGuests
// Contract: guestsContract.bulkInviteGuests
// Contract: guestsContract.sendRSVPReminders

interface GuestManagement {
  invitedGuests: Guest[];
  confirmedCount: number;
  declinedCount: number;
  pendingCount: number;
  rsvpDeadline: string;
}

const handleRSVPReminder = (guestIds: string[]) => {
  // Send reminder emails to selected guests
};
```

### 7. Chapel Comparison Page (`/compare`)

#### Visual Design
- **Side-by-side Layout**: Up to 4 chapels in comparison table
- **Feature Matrix**: Checkmarks for amenities and inclusions
- **Photo Gallery**: Thumbnail previews for each chapel
- **Action Buttons**: Book now, remove from comparison

#### Contract Mapping
```typescript
// Contract: chapelsContract.compareChapels
interface ChapelComparison {
  chapels: Array<{
    id: string;
    name: string;
    location: string;
    heroImage: string;
    rating: number;
    reviewCount: number;
    capacity: number;
    pricePerHour: number;
    amenities: string[];
    packages: PackageInfo[];
    totalReviews: number;
    averageRating: number;
  }>;
}

const removeFromComparison = (chapelId: string) => {
  // Update comparison state and re-fetch if needed
};
```

### 8. Search Results Page (`/search`)

#### Visual Design
- **Search Header**: Display search query and filters
- **Results Grid**: Combined chapel and package results
- **Filter Refinement**: Quick filter chips and advanced options
- **Sort Options**: Relevance, price, rating, distance

#### Contract Mappings
```typescript
// Contract: chapelsContract.searchChapels
// Contract: packagesContract.searchPackages

interface SearchResults {
  chapels: SearchChapel[];
  packages: SearchPackage[];
  totalResults: number;
  searchQuery: string;
  appliedFilters: SearchFilters;
}

interface SearchChapel {
  id: string;
  name: string;
  location: string;
  heroImage: string;
  rating: number;
  pricePerHour: number;
  distance?: number; // if location-based search
  availableSlots?: string[]; // if date-based search
}
```

---

## Form Specifications

### Universal Form Patterns

#### Validation Strategy
All forms use Zod schemas that mirror the API contract schemas, ensuring client-side validation matches server expectations.

```typescript
// Base form configuration
interface FormConfig<T> {
  schema: z.ZodSchema<T>;
  contractMethod: ContractMethod;
  onSuccess: (data: T) => void;
  onError: (error: ApiError) => void;
  autoSave?: boolean;
  validateOnChange?: boolean;
}
```

#### Form Field Components
```typescript
// Standard field types with consistent styling
interface FormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// Specific field implementations
<TextInput {...fieldProps} />
<EmailInput {...fieldProps} />
<PhoneInput {...fieldProps} />
<DatePicker {...fieldProps} />
<TimePicker {...fieldProps} />
<NumberInput {...fieldProps} min={1} max={500} />
<TextArea {...fieldProps} rows={4} />
<Select {...fieldProps} options={options} />
<MultiSelect {...fieldProps} options={options} />
<ImageUpload {...fieldProps} accept="image/*" />
```

### Specific Form Implementations

#### Registration Form
```typescript
// Contract: usersContract.register
const registrationSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  phone: z.string().optional(),
  role: z.literal('couple').default('couple')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
```

#### Login Form
```typescript
// Contract: usersContract.login
const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required")
});

// Additional features
interface LoginFormState {
  rememberMe: boolean;
  showPassword: boolean;
  isLoading: boolean;
  error: string | null;
}
```

#### Chapel Search Form
```typescript
// Contract: chapelsContract.searchChapels
const searchSchema = z.object({
  q: z.string().min(1, "Search query required"),
  location: z.string().optional(),
  ceremonyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  guestCount: z.number().min(1).optional(),
  maxPrice: z.number().min(0).optional(),
  amenities: z.array(z.string()).optional()
});
```

#### Booking Form (Multi-step)
```typescript
// Contract: bookingsContract.createBooking
const bookingStepSchemas = {
  details: z.object({
    ceremonyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    ceremonyTime: z.string().regex(/^\d{2}:\d{2}$/),
    guestCount: z.number().min(1).max(1000),
    contactEmail: z.string().email(),
    contactPhone: z.string().min(10),
    partnerName: z.string().min(1),
    specialRequests: z.string().optional()
  }),

  packages: z.object({
    packageId: z.string().uuid(),
    addonIds: z.array(z.object({
      addonId: z.string().uuid(),
      quantity: z.number().min(1)
    })).optional()
  }),

  payment: z.object({
    paymentMethod: z.enum(['credit_card', 'debit_card', 'bank_transfer', 'paypal']),
    billingAddress: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      zipCode: z.string().min(1),
      country: z.string().min(1)
    })
  })
};
```

#### Review Form
```typescript
// Contract: reviewsContract.createReview
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Review must be at least 20 characters"),
  images: z.array(z.string().url()).max(5, "Maximum 5 images allowed"),
  recommend: z.boolean(),
  tags: z.array(z.string()).optional()
});
```

---

## State Management & Data Flow

### Architecture Overview
The application uses TanStack Query for server state management and Zustand for client state, following the contracts as the single source of truth for data structures.

### Store Structure
```typescript
// Auth Store
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegistrationData) => Promise<void>;
  refreshToken: () => Promise<void>;
}

// Booking Store (for booking flow)
interface BookingStore {
  selectedChapel: Chapel | null;
  selectedPackage: Package | null;
  selectedDate: string | null;
  selectedTime: string | null;
  guestCount: number;
  addons: BookingAddon[];
  contactInfo: ContactInfo | null;

  // Actions
  setChapel: (chapel: Chapel) => void;
  setPackage: (packageId: string) => void;
  setDateTime: (date: string, time: string) => void;
  addAddon: (addon: BookingAddon) => void;
  removeAddon: (addonId: string) => void;
  clearBooking: () => void;
}

// Comparison Store
interface ComparisonStore {
  chapels: Chapel[];
  addChapel: (chapel: Chapel) => void;
  removeChapel: (chapelId: string) => void;
  clearComparison: () => void;
}

// UI Store
interface UIStore {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  notifications: Notification[];
  loading: Record<string, boolean>;

  // Actions
  toggleTheme: () => void;
  toggleSidebar: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  setLoading: (key: string, isLoading: boolean) => void;
}
```

### Query Hooks (TanStack Query)
```typescript
// Chapel Queries
export const useChapels = (filters?: ChapelFilters) =>
  useQuery({
    queryKey: ['chapels', filters],
    queryFn: () => apiClient.chapels.getChapels({ query: filters }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useChapel = (id: string) =>
  useQuery({
    queryKey: ['chapel', id],
    queryFn: () => apiClient.chapels.getChapel({ params: { id } }),
    enabled: !!id,
  });

// Booking Queries
export const useUserBookings = (userId: string, filters?: BookingFilters) =>
  useQuery({
    queryKey: ['bookings', 'user', userId, filters],
    queryFn: () => apiClient.bookings.getUserBookings({
      params: { userId },
      query: filters
    }),
    enabled: !!userId,
  });

// Mutations
export const useCreateBooking = () =>
  useMutation({
    mutationFn: (bookingData: InsertBookingSchema) =>
      apiClient.bookings.createBooking({ body: bookingData }),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });

export const useUpdateBooking = () =>
  useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & UpdateBookingSchema) =>
      apiClient.bookings.updateBooking({ params: { id }, body: updates }),
    onSuccess: (data, variables) => {
      // Update specific booking in cache
      queryClient.setQueryData(['booking', variables.id], data);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
```

### Data Flow Patterns
```typescript
// 1. Component receives props/route params
const ChapelDetailPage = ({ chapelId }: { chapelId: string }) => {
  // 2. Query hooks fetch data using contracts
  const { data: chapel, isLoading, error } = useChapel(chapelId);
  const { data: packages } = useChapelPackages(chapelId);
  const { data: reviews } = useChapelReviews(chapelId);

  // 3. Derived state and interactions
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // 4. Event handlers using mutations
  const bookingMutation = useCreateBooking();

  const handleBookingStart = () => {
    if (chapel && selectedPackage) {
      // Update booking store
      useBookingStore.getState().setChapel(chapel);
      useBookingStore.getState().setPackage(selectedPackage);

      // Navigate to booking flow
      navigate(`/book/${chapelId}/details`);
    }
  };

  // 5. Render with loading/error states
  if (isLoading) return <ChapelDetailSkeleton />;
  if (error) return <ErrorBoundary error={error} />;

  return <ChapelDetailView chapel={chapel} onBookingStart={handleBookingStart} />;
};
```

---

## Error Handling & Loading States

### Error Classification
```typescript
interface ApiError {
  status: number;
  message: string;
  code: string;
  details?: Record<string, any>;
}

// Error types based on HTTP status codes
type ErrorType =
  | 'validation' // 400
  | 'unauthorized' // 401
  | 'forbidden' // 403
  | 'not_found' // 404
  | 'conflict' // 409
  | 'server_error' // 500
  | 'network_error'; // No response
```

### Error Handling Patterns
```typescript
// Global Error Boundary
interface ErrorBoundaryProps {
  error: ApiError | Error;
  reset?: () => void;
  fallback?: React.ComponentType<{ error: any }>;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ error, reset }) => {
  const getErrorMessage = (error: ApiError | Error) => {
    if ('status' in error) {
      switch (error.status) {
        case 400:
          return "Please check your input and try again.";
        case 401:
          return "Please sign in to continue.";
        case 403:
          return "You don't have permission to perform this action.";
        case 404:
          return "The requested resource was not found.";
        case 409:
          return "This action conflicts with existing data.";
        case 500:
          return "A server error occurred. Please try again later.";
        default:
          return error.message || "An unexpected error occurred.";
      }
    }
    return error.message || "An unexpected error occurred.";
  };

  return (
    <div className="error-boundary">
      <h2>Something went wrong</h2>
      <p>{getErrorMessage(error)}</p>
      {reset && <button onClick={reset}>Try Again</button>}
    </div>
  );
};

// Query Error Handling
const useErrorHandler = () => {
  const { addNotification } = useUIStore();

  return (error: ApiError) => {
    // Log error for debugging
    console.error('API Error:', error);

    // Show user-friendly notification
    addNotification({
      type: 'error',
      title: 'Error',
      message: getErrorMessage(error),
      duration: 5000,
    });

    // Handle specific error types
    if (error.status === 401) {
      // Redirect to login
      useAuthStore.getState().logout();
    }
  };
};
```

### Loading State Management
```typescript
// Component-level loading states
interface LoadingStates {
  chapels: boolean;
  packages: boolean;
  bookings: boolean;
  availability: boolean;
  payment: boolean;
}

// Skeleton Components
const ChapelCardSkeleton = () => (
  <div className="chapel-card-skeleton">
    <div className="skeleton-image" />
    <div className="skeleton-content">
      <div className="skeleton-line w-3/4" />
      <div className="skeleton-line w-1/2" />
      <div className="skeleton-line w-1/4" />
    </div>
  </div>
);

// Global loading overlay for critical operations
const useGlobalLoading = () => {
  const { setLoading } = useUIStore();

  return {
    start: (key: string) => setLoading(key, true),
    stop: (key: string) => setLoading(key, false),
    wrap: async <T>(key: string, operation: Promise<T>): Promise<T> => {
      setLoading(key, true);
      try {
        return await operation;
      } finally {
        setLoading(key, false);
      }
    }
  };
};
```

---

## ASTOUNDING Design System Implementation

### Design Philosophy: Timeless Romance in 2035
The ASTOUNDING design system creates an emotional connection through sophisticated visual storytelling, combining dark elegance with romantic warmth.

### Color System
```css
:root {
  /* Primary Palette - Deep Romance */
  --primary-900: #1a0b1a; /* Deep plum background */
  --primary-800: #2d1b2d; /* Rich plum surfaces */
  --primary-700: #4a2c4a; /* Medium plum accents */
  --primary-600: #7a4a7a; /* Light plum highlights */
  --primary-500: #a366a3; /* Rose gold accent */

  /* Secondary Palette - Warm Metals */
  --accent-gold: #d4af37; /* Champagne gold */
  --accent-rose: #e8b4cb; /* Rose gold */
  --accent-pearl: #f8f6f0; /* Pearl white */

  /* Neutral Palette - Sophisticated Grays */
  --neutral-900: #0f0f0f; /* True black */
  --neutral-800: #1a1a1a; /* Charcoal */
  --neutral-700: #2a2a2a; /* Dark gray */
  --neutral-600: #404040; /* Medium gray */
  --neutral-500: #737373; /* Light gray */
  --neutral-400: #a3a3a3; /* Silver */
  --neutral-300: #d4d4d4; /* Light silver */
  --neutral-200: #e5e5e5; /* Very light gray */
  --neutral-100: #f5f5f5; /* Off white */

  /* Status Colors */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

### Glassmorphism System
```css
/* Base glassmorphism effects */
.glass-primary {
  background: rgba(29, 27, 29, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.glass-secondary {
  background: rgba(42, 42, 42, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.glass-subtle {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

### Typography Scale
```css
/* Font Family */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

:root {
  --font-display: 'Playfair Display', serif; /* For headlines */
  --font-body: 'Inter', sans-serif; /* For body text */
}

/* Typography Scale */
.text-display-1 {
  font-family: var(--font-display);
  font-size: 4.5rem; /* 72px */
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.text-display-2 {
  font-family: var(--font-display);
  font-size: 3.75rem; /* 60px */
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.text-heading-1 {
  font-family: var(--font-display);
  font-size: 3rem; /* 48px */
  font-weight: 600;
  line-height: 1.2;
}

.text-heading-2 {
  font-family: var(--font-display);
  font-size: 2.25rem; /* 36px */
  font-weight: 500;
  line-height: 1.25;
}

.text-heading-3 {
  font-family: var(--font-body);
  font-size: 1.875rem; /* 30px */
  font-weight: 600;
  line-height: 1.3;
}

.text-body-large {
  font-family: var(--font-body);
  font-size: 1.125rem; /* 18px */
  font-weight: 400;
  line-height: 1.6;
}

.text-body {
  font-family: var(--font-body);
  font-size: 1rem; /* 16px */
  font-weight: 400;
  line-height: 1.5;
}

.text-body-small {
  font-family: var(--font-body);
  font-size: 0.875rem; /* 14px */
  font-weight: 400;
  line-height: 1.4;
}
```

### Animation System
```css
/* Easing Functions */
:root {
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Micro-interactions */
.hover-lift {
  transition: transform 0.3s var(--ease-out-quart);
}

.hover-lift:hover {
  transform: translateY(-4px);
}

.hover-glow {
  transition: box-shadow 0.3s var(--ease-out-quart);
}

.hover-glow:hover {
  box-shadow:
    0 0 20px rgba(212, 175, 55, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Page transitions */
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.4s var(--ease-out-quart),
              transform 0.4s var(--ease-out-quart);
}

.page-exit {
  opacity: 1;
  transform: translateY(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.3s var(--ease-out-quart),
              transform 0.3s var(--ease-out-quart);
}
```

---

## Responsive Design Patterns

### Breakpoint System
```css
:root {
  --breakpoint-sm: 640px;  /* Small devices */
  --breakpoint-md: 768px;  /* Tablets */
  --breakpoint-lg: 1024px; /* Small laptops */
  --breakpoint-xl: 1280px; /* Desktops */
  --breakpoint-2xl: 1536px; /* Large screens */
}
```

### Layout Patterns
```css
/* Container system */
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
    padding: 0 1.5rem;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

/* Grid system */
.grid {
  display: grid;
  gap: 1rem;
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
```

---

## API Integration Patterns

### API Client Setup
```typescript
// api/client.ts
import { initClient } from '@ts-rest/core';
import { apiContract } from '../shared/contracts';

const apiClient = initClient(apiContract, {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  baseHeaders: {
    'Content-Type': 'application/json',
  },
});

// Auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { apiClient };
```

### Contract-Based Hooks
```typescript
// hooks/api/chapels.ts
export const useChapels = (filters?: ChapelFilters) => {
  return useQuery({
    queryKey: ['chapels', filters],
    queryFn: async () => {
      const response = await apiClient.chapels.getChapels({ query: filters });
      if (response.status !== 200) {
        throw new Error(response.body.error);
      }
      return response.body;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: InsertBookingSchema) => {
      const response = await apiClient.bookings.createBooking({ body: bookingData });
      if (response.status !== 201) {
        throw new Error(response.body.error);
      }
      return response.body;
    },
    onSuccess: (newBooking) => {
      // Invalidate and refetch bookings list
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};
```

---

## Performance & Accessibility Considerations

### Performance Optimization

#### Code Splitting Strategy
```typescript
// Router with lazy loading
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('@/pages/HomePage'));
const ChapelDetailPage = lazy(() => import('@/pages/ChapelDetailPage'));

const AppRoutes = () => (
  <Suspense fallback={<PageSkeleton />}>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chapels/:id" element={<ChapelDetailPage />} />
    </Routes>
  </Suspense>
);
```

#### Image Optimization
```typescript
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`image-container ${className}`}>
      {!isLoaded && <div className="image-skeleton" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        loading={priority ? 'eager' : 'lazy'}
        style={{ opacity: isLoaded ? 1 : 0 }}
      />
    </div>
  );
};
```

### Accessibility Implementation

#### Semantic HTML Structure
```typescript
const ChapelDetailPage = ({ chapelId }: { chapelId: string }) => {
  return (
    <main role="main" aria-labelledby="chapel-title">
      <header>
        <h1 id="chapel-title">{chapel.name}</h1>
      </header>

      <nav aria-label="Chapel information tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'details'}
          aria-controls="details-panel"
        >
          Details
        </button>
      </nav>

      <section
        role="tabpanel"
        aria-labelledby="details-tab"
        id="details-panel"
        hidden={activeTab !== 'details'}
      >
        {/* Details content */}
      </section>
    </main>
  );
};
```

#### Keyboard Navigation
```typescript
export const useKeyboardNavigation = (items: any[], onSelect: (item: any) => void) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => Math.min(prev + 1, items.length - 1));
          break;
        case 'Enter':
          if (focusedIndex >= 0) {
            onSelect(items[focusedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, focusedIndex, onSelect]);

  return { focusedIndex };
};
```

---

This comprehensive Frontend Interaction Specification provides implementation-ready guidance for building Chapel Eternal. Every component, interaction, and state is mapped to specific API contracts, ensuring a seamless integration between frontend and backend systems while maintaining the ASTOUNDING design aesthetic and excellent user experience.

The specification covers all essential aspects:
- Complete page-by-page component breakdown
- Contract-specific API integration patterns
- Form validation matching backend schemas
- Responsive design with mobile-first approach
- Performance optimizations for large datasets
- Full accessibility compliance
- Error handling and loading states
- State management with real-time updates

Developers can use this specification to build a production-ready wedding chapel booking platform that delivers both technical excellence and emotional connection for couples planning their special day.