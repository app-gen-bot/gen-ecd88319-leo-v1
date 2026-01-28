"use client"

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { websocketStore } from '@/lib/store'
import { useAuth } from './auth-context'
import type { Message, Notification, Dispute } from '@/lib/types'

interface WebSocketContextValue {
  isConnected: boolean
  subscribe: (event: string, handler: (data: any) => void) => () => void
  emit: (event: string, data: any) => void
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()
  const [eventHandlers, setEventHandlers] = useState<Map<string, Set<(data: any) => void>>>(new Map())
  
  useEffect(() => {
    if (!user) {
      setIsConnected(false)
      return
    }
    
    // Simulate connection
    setIsConnected(true)
    
    // In a real app, this would establish WebSocket connection
    // For now, we'll use the websocketStore to simulate events
    
    return () => {
      setIsConnected(false)
    }
  }, [user])
  
  const subscribe = useCallback((event: string, handler: (data: any) => void) => {
    setEventHandlers(prev => {
      const map = new Map(prev)
      if (!map.has(event)) {
        map.set(event, new Set())
      }
      map.get(event)!.add(handler)
      return map
    })
    
    // Return unsubscribe function
    return () => {
      setEventHandlers(prev => {
        const map = new Map(prev)
        const handlers = map.get(event)
        if (handlers) {
          handlers.delete(handler)
          if (handlers.size === 0) {
            map.delete(event)
          }
        }
        return map
      })
    }
  }, [])
  
  const emit = useCallback((event: string, data: any) => {
    // In a real app, this would send data through WebSocket
    // For now, we'll add to store and trigger local handlers
    websocketStore.addMessage({
      id: `ws-${Date.now()}`,
      type: event,
      timestamp: Date.now(),
      data
    })
    
    // Trigger local handlers
    const handlers = eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }, [eventHandlers])
  
  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe, emit }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

// Convenience hooks for specific events
export function useDisputeUpdates(onDisputeUpdate: (dispute: Dispute) => void) {
  const { subscribe } = useWebSocket()
  
  useEffect(() => {
    return subscribe('dispute.updated', onDisputeUpdate)
  }, [subscribe, onDisputeUpdate])
}

export function useMessageUpdates(onMessage: (message: Message) => void) {
  const { subscribe } = useWebSocket()
  
  useEffect(() => {
    return subscribe('message.received', onMessage)
  }, [subscribe, onMessage])
}

export function useNotificationUpdates(onNotification: (notification: Notification) => void) {
  const { subscribe } = useWebSocket()
  
  useEffect(() => {
    return subscribe('notification.new', onNotification)
  }, [subscribe, onNotification])
}