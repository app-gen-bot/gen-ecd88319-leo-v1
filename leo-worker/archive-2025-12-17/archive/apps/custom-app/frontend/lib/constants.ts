// Authentication & Session Keys
export const AUTH_TOKEN_KEY = 'auth_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'
export const CURRENT_USER_KEY = 'current_user'
export const CURRENT_PROPERTY_KEY = 'current_property'

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'

// Routes
export const PUBLIC_ROUTES = [
  '/',
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/pricing',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/help'
]

// Property Types
export const PROPERTY_TYPES = [
  { value: 'single_family', label: 'Single Family Home', icon: 'Home' },
  { value: 'apartment', label: 'Apartment', icon: 'Building' },
  { value: 'condo', label: 'Condo', icon: 'Building2' },
  { value: 'townhouse', label: 'Townhouse', icon: 'Home' },
  { value: 'mobile_home', label: 'Mobile Home', icon: 'Truck' },
  { value: 'room', label: 'Room Rental', icon: 'BedDouble' }
] as const

// Dispute Types
export const DISPUTE_TYPES = [
  { 
    value: 'security_deposit', 
    label: 'Security Deposit', 
    description: 'Wrongful deductions or non-return',
    icon: 'DollarSign' 
  },
  { 
    value: 'repairs', 
    label: 'Repairs & Maintenance', 
    description: 'Maintenance issues not addressed',
    icon: 'Wrench' 
  },
  { 
    value: 'lease_violation', 
    label: 'Lease Violation', 
    description: 'False accusations or disputes',
    icon: 'FileX' 
  },
  { 
    value: 'rent_increase', 
    label: 'Rent Increase', 
    description: 'Illegal or improper increases',
    icon: 'TrendingUp' 
  },
  { 
    value: 'eviction', 
    label: 'Eviction', 
    description: 'Wrongful eviction attempts',
    icon: 'AlertTriangle' 
  },
  { 
    value: 'other', 
    label: 'Other', 
    description: 'Other disputes',
    icon: 'HelpCircle' 
  }
] as const

// Evidence Types
export const EVIDENCE_TYPES = [
  { value: 'photo', label: 'Photos', icon: 'Camera' },
  { value: 'video', label: 'Videos', icon: 'Video' },
  { value: 'document', label: 'Documents', icon: 'FileText' },
  { value: 'communication', label: 'Communications', icon: 'MessageSquare' },
  { value: 'receipt', label: 'Receipts', icon: 'Receipt' }
] as const

// Issue Severity
export const ISSUE_SEVERITY = {
  minor: { label: 'Minor', color: 'blue', className: 'issue-minor' },
  moderate: { label: 'Moderate', color: 'orange', className: 'issue-moderate' },
  severe: { label: 'Severe', color: 'red', className: 'issue-severe' }
} as const

// Lease Issue Types
export const LEASE_ISSUE_TYPES = {
  illegal: { label: 'Illegal Clauses', icon: 'XCircle', color: 'red' },
  concerning: { label: 'Concerning Terms', icon: 'AlertTriangle', color: 'orange' },
  missing: { label: 'Missing Disclosures', icon: 'Info', color: 'blue' }
} as const

// Room Types for Documentation
export const ROOM_TYPES = [
  'Living Room',
  'Kitchen',
  'Master Bedroom',
  'Bedroom',
  'Bathroom',
  'Dining Room',
  'Garage',
  'Basement',
  'Attic',
  'Office',
  'Laundry Room',
  'Hallway',
  'Closet',
  'Exterior',
  'Other'
] as const

// Error Codes
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE'
} as const

// Validation Rules
export const VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 8,
  PHONE_PATTERN: /^\(\d{3}\) \d{3}-\d{4}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PROPERTY_ADDRESS_MAX_LENGTH: 200,
  UNIT_NUMBER_MAX_LENGTH: 10,
  DISPUTE_DESCRIPTION_MIN_LENGTH: 50,
  DISPUTE_DESCRIPTION_MAX_LENGTH: 5000,
  DISPUTE_OUTCOME_MIN_LENGTH: 20,
  DISPUTE_OUTCOME_MAX_LENGTH: 1000,
  MESSAGE_MAX_LENGTH: 10000,
  FILE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'mp4', 'mov']
} as const

// Legal Timelines (in days)
export const LEGAL_TIMELINES = {
  SECURITY_DEPOSIT_RETURN: 21,
  REPAIR_NOTICE_RESPONSE: 30,
  RENT_INCREASE_NOTICE: 30, // For < 10% increase
  RENT_INCREASE_NOTICE_LARGE: 90, // For >= 10% increase
  EVICTION_NOTICE_NONPAYMENT: 3,
  EVICTION_NOTICE_CURE: 3,
  EVICTION_NOTICE_QUIT: 30,
  SMALL_CLAIMS_LIMIT: 10000 // Dollar amount
} as const

// Knowledge Base Categories
export const KNOWLEDGE_CATEGORIES = [
  'Security Deposits',
  'Repairs & Maintenance',
  'Eviction Protection',
  'Rent Control',
  'Lease Agreements',
  'Discrimination',
  'Privacy Rights',
  'Utilities',
  'Moving In/Out',
  'Roommates',
  'Subsidized Housing',
  'Emergency Situations'
] as const

// Notification Types
export const NOTIFICATION_TYPES = {
  deadline_reminder: { label: 'Deadline Reminder', icon: 'Clock' },
  dispute_update: { label: 'Dispute Update', icon: 'FileText' },
  message_received: { label: 'New Message', icon: 'MessageSquare' },
  document_processed: { label: 'Document Processed', icon: 'FileCheck' },
  legal_notice: { label: 'Legal Notice', icon: 'AlertTriangle' },
  system_update: { label: 'System Update', icon: 'Info' }
} as const

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'AI Legal Advisor (5 questions/month)',
      'Basic document storage',
      '1 active dispute',
      'Knowledge base access'
    ]
  },
  pro: {
    name: 'Pro',
    price: 19.99,
    features: [
      'Unlimited AI Legal Advisor',
      'Unlimited document storage',
      'Unlimited disputes',
      'Priority support',
      'Letter templates',
      'Advanced analytics'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 49.99,
    features: [
      'Everything in Pro',
      'Multiple properties',
      'Team collaboration',
      'API access',
      'Custom integrations',
      'Dedicated support'
    ]
  }
} as const

// Message Styles (for compatibility with old pages)
export const MESSAGE_STYLES = {
  professional: { label: 'Professional', icon: 'Briefcase' },
  casual: { label: 'Casual', icon: 'Coffee' },
  formal: { label: 'Formal', icon: 'FileText' }
} as const

// Personality Traits (for compatibility with old pages)
export const PERSONALITY_TRAITS = [
  'organized',
  'flexible',
  'detail-oriented',
  'collaborative'
] as const