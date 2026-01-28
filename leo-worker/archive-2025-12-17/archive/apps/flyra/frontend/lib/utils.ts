import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format phone number
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{1,3})(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`
  }
  return phoneNumber
}

// Mask sensitive data
export function maskPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '')
  if (cleaned.length >= 4) {
    return `****${cleaned.slice(-4)}`
  }
  return '****'
}

export function maskSSN(ssn: string): string {
  return `***-**-${ssn.slice(-4)}`
}

// Date formatting
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string): boolean {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export function getPasswordStrength(password: string): 'weak' | 'fair' | 'strong' {
  if (password.length < 8) return 'weak'
  
  let strength = 0
  if (password.match(/[a-z]/)) strength++
  if (password.match(/[A-Z]/)) strength++
  if (password.match(/[0-9]/)) strength++
  if (password.match(/[^a-zA-Z0-9]/)) strength++
  
  if (strength < 3) return 'weak'
  if (strength < 4) return 'fair'
  return 'strong'
}

// Generate initials from name
export function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Generate mock transaction ID
export function generateTransactionId(): string {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase()
}

// Calculate fees
export function calculateFees(amount: number): {
  transferFee: number
  total: number
} {
  const transferFee = 2.99 // Fixed fee for MVP
  return {
    transferFee,
    total: amount + transferFee,
  }
}

// Exchange rate mock (in real app, this would call an API)
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  const rates: Record<string, number> = {
    'USD-KES': 156.50, // Kenya Shilling
    'USD-INR': 83.25,  // Indian Rupee
    'USD-NGN': 1520.00, // Nigerian Naira
    'USD-GHS': 15.20,  // Ghana Cedi
    'USD-ZAR': 18.95,  // South African Rand
  }
  
  const key = `${fromCurrency}-${toCurrency}`
  return rates[key] || 1
}

// Get local currency symbol
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    KES: 'KSh',
    INR: '₹',
    NGN: '₦',
    GHS: 'GH₵',
    ZAR: 'R',
  }
  return symbols[currencyCode] || currencyCode
}