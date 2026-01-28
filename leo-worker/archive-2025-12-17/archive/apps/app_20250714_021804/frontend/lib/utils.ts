import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateFamilyCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function formatDueDate(date: string | Date): string {
  const dueDate = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  today.setHours(0, 0, 0, 0)
  tomorrow.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  
  if (dueDate.getTime() === today.getTime()) {
    return 'Today'
  } else if (dueDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  } else if (dueDate < today) {
    return 'Overdue'
  } else {
    return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      if (minutes === 0) return 'Just now'
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    }
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (days === 1) {
    return 'Yesterday'
  } else if (days < 7) {
    return `${days} days ago`
  } else {
    return d.toLocaleDateString()
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'text-red-500'
    case 'medium':
      return 'text-yellow-500'
    case 'low':
      return 'text-green-500'
    default:
      return 'text-gray-500'
  }
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    household: '🏠',
    kitchen: '🍳',
    kids: '👶',
    pets: '🐾',
    shopping: '🛒',
    outdoor: '🌳',
    chores: '🧹',
    homework: '📚',
    fun: '🎉',
    other: '📌'
  }
  return icons[category] || icons.other
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}