"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './websocket-context';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'case' | 'workflow' | 'system' | 'team';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  severity?: 'info' | 'warning' | 'error' | 'success';
  link?: string;
  metadata?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    // Return a dummy context during SSR
    if (typeof window === 'undefined') {
      return {
        notifications: [],
        unreadCount: 0,
        addNotification: () => {},
        markAsRead: () => {},
        markAllAsRead: () => {},
        removeNotification: () => {},
        clearAll: () => {},
      };
    }
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { subscribe } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast notification
    const toastOptions = {
      description: notification.description,
      duration: 5000,
    };

    switch (notification.severity) {
      case 'error':
        toast.error(notification.title, toastOptions);
        break;
      case 'warning':
        toast.warning(notification.title, toastOptions);
        break;
      case 'success':
        toast.success(notification.title, toastOptions);
        break;
      default:
        toast.info(notification.title, toastOptions);
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Subscribe to WebSocket events
  useEffect(() => {
    const unsubscribeCase = subscribe('case.update', (data) => {
      addNotification({
        type: 'case',
        title: `Case ${data.caseId} Updated`,
        description: data.message || 'Case status has been updated',
        severity: data.severity || 'info',
        link: `/cases/${data.caseId}`,
        metadata: data,
      });
    });

    const unsubscribeWorkflow = subscribe('workflow.update', (data) => {
      addNotification({
        type: 'workflow',
        title: `Workflow ${data.workflowName} Updated`,
        description: data.message || 'Workflow has been modified',
        severity: data.severity || 'info',
        link: `/workflows/${data.workflowId}`,
        metadata: data,
      });
    });

    const unsubscribeSystem = subscribe('system.alert', (data) => {
      addNotification({
        type: 'system',
        title: data.title || 'System Alert',
        description: data.message,
        severity: data.severity || 'warning',
        metadata: data,
      });
    });

    const unsubscribeTeam = subscribe('team.update', (data) => {
      addNotification({
        type: 'team',
        title: data.title || 'Team Update',
        description: data.message,
        severity: 'info',
        link: '/settings/team',
        metadata: data,
      });
    });

    const unsubscribeHighRisk = subscribe('case.high_risk', (data) => {
      addNotification({
        type: 'case',
        title: 'High Risk Case Detected',
        description: `Case ${data.caseId} has been flagged with risk score ${data.riskScore}`,
        severity: 'warning',
        link: `/cases/${data.caseId}`,
        metadata: data,
      });
    });

    return () => {
      unsubscribeCase();
      unsubscribeWorkflow();
      unsubscribeSystem();
      unsubscribeTeam();
      unsubscribeHighRisk();
    };
  }, [subscribe, addNotification]);

  // Load initial notifications (mock data for demo)
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'case',
        title: 'New high-risk case requires review',
        description: 'Case #CASE-012 has been flagged with a risk score of 92',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: false,
        severity: 'warning',
        link: '/cases/CASE-012',
      },
      {
        id: '2',
        type: 'workflow',
        title: 'Workflow published successfully',
        description: 'Customer Onboarding v2.1 is now active',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: false,
        severity: 'success',
        link: '/workflows/1',
      },
      {
        id: '3',
        type: 'system',
        title: 'System maintenance scheduled',
        description: 'Planned maintenance on Jan 15, 2024 from 2:00 AM - 4:00 AM EST',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true,
        severity: 'info',
      },
    ];

    setNotifications(mockNotifications);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}