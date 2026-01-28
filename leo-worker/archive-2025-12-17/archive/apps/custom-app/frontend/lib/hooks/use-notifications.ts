import { useCallback } from 'react'
import useSWR, { mutate } from 'swr'
import { apiClient } from '@/lib/api-client'
import { useNotificationUpdates } from '@/lib/contexts/websocket-context'
import { useToast } from '@/components/ui/use-toast'
import type { Notification } from '@/lib/types'

export function useNotifications() {
  const { toast } = useToast()
  
  const { data, error, isLoading } = useSWR(
    'notifications',
    () => apiClient.getNotifications(),
    {
      refreshInterval: 30000, // Poll every 30 seconds
      revalidateOnFocus: true
    }
  )
  
  // Handle real-time notification updates
  useNotificationUpdates(useCallback((notification: Notification) => {
    // Update cache
    mutate('notifications', (current: Notification[] = []) => {
      return [notification, ...current]
    }, false)
    
    // Show toast for new notifications
    toast({
      title: notification.title,
      description: notification.message,
    })
  }, [toast]))
  
  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiClient.markNotificationRead(id)
      
      // Update cache
      mutate('notifications', (current: Notification[] = []) => {
        return current.map(n => 
          n.id === id ? { ...n, is_read: true } : n
        )
      }, false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }, [toast])
  
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.markAllNotificationsRead()
      
      // Update cache
      mutate('notifications', (current: Notification[] = []) => {
        return current.map(n => ({ ...n, is_read: true }))
      }, false)
      
      toast({
        title: "All Caught Up!",
        description: "All notifications marked as read.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      })
    }
  }, [toast])
  
  const unreadCount = (data || []).filter(n => !n.is_read).length
  
  return {
    notifications: data || [],
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: () => mutate('notifications')
  }
}