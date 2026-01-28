// User types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  dateOfBirth: string
  ssnLast4: string
  address: Address
  kycStatus: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  annualIncome?: string
  employmentStatus?: string
  intendedUse?: string[]
}

export interface Address {
  street: string
  apt?: string
  city: string
  state: string
  zipCode: string
  country: string
}

// Wallet types
export interface Wallet {
  id: string
  userId: string
  balance: number // in USDC
  currency: 'USDC'
  status: 'active' | 'frozen' | 'closed'
  createdAt: string
  updatedAt: string
}

// Recipient types
export interface Recipient {
  id: string
  userId: string
  firstName: string
  lastName: string
  phoneNumber: string
  country: string
  city: string
  mobileMoneyProvider?: string
  relationship?: 'family' | 'friend' | 'business' | 'other'
  isFavorite: boolean
  lastTransactionDate?: string
  createdAt: string
  updatedAt: string
}

// Transaction types
export interface Transaction {
  id: string
  userId: string
  recipientId: string
  recipient: Recipient
  amount: number // in USD
  fee: number
  totalAmount: number
  exchangeRate: number
  localAmount: number // amount in local currency
  localCurrency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  type: 'send' | 'receive' | 'deposit' | 'withdrawal'
  createdAt: string
  completedAt?: string
  failureReason?: string
  reference?: string
}

// Recurring transfer types
export interface RecurringTransfer {
  id: string
  userId: string
  recipientId: string
  recipient: Recipient
  amount: number
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom'
  customFrequency?: {
    interval: number
    unit: 'days' | 'weeks' | 'months'
  }
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  startDate: string
  endDate?: string
  nextPaymentDate: string
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  totalTransfers: number
  completedTransfers: number
  createdAt: string
  updatedAt: string
}

// Bank account types
export interface BankAccount {
  id: string
  userId: string
  accountName: string
  accountNumber: string // masked
  routingNumber: string // masked
  bankName: string
  accountType: 'checking' | 'savings'
  isVerified: boolean
  isDefault: boolean
  createdAt: string
}

// Mobile money provider types
export interface MobileMoneyProvider {
  id: string
  name: string
  country: string
  logo?: string
  isActive: boolean
  deliveryTime: string
  fee: number
}

// Country types
export interface Country {
  code: string
  name: string
  currency: string
  phoneCode: string
  flag: string
  isSupported: boolean
  mobileMoneyProviders: MobileMoneyProvider[]
}

// Notification types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'transaction' | 'security' | 'marketing' | 'system'
  isRead: boolean
  actionUrl?: string
  createdAt: string
}

// Form types
export interface RegistrationData {
  email: string
  password: string
  phoneNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  ssnLast4: string
  address: Address
  annualIncome: string
  employmentStatus: string
  intendedUse: string[]
}

export interface SendMoneyData {
  recipientId: string
  amount: number
  note?: string
}

export interface RecurringTransferData {
  recipientId: string
  amount: number
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom'
  customFrequency?: {
    interval: number
    unit: 'days' | 'weeks' | 'months'
  }
  startDate: string
  endDate?: string
  dayOfWeek?: number
  dayOfMonth?: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Auth types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

// Dashboard stats
export interface DashboardStats {
  totalSent: number
  totalRecipients: number
  activeRecurringTransfers: number
  walletBalance: number
  recentTransactions: Transaction[]
  upcomingRecurringPayments: RecurringTransfer[]
}

// Cash out types
export interface CashOutMethod {
  id: string
  type: 'mobile_money' | 'bank_transfer' | 'agent'
  name: string
  deliveryTime: string
  fee: number
  minAmount: number
  maxAmount: number
  isAvailable: boolean
}

export interface Agent {
  id: string
  name: string
  address: string
  city: string
  distance?: number
  hours: string
  phone: string
  latitude: number
  longitude: number
}