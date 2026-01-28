'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api-client';
import { handleApiError } from '@/lib/handle-api-error';
import useSWR from 'swr';
import { Bell, MessageSquare, AtSign, FileText, Hash, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/types/api';

interface NotificationsPopoverProps {
  onClose: () => void;
}

export function NotificationsPopover({ onClose }: NotificationsPopoverProps) {
  const router = useRouter();
  const { data: notifications = [], mutate } = useSWR(
    '/notifications',
    () => apiClient.getNotifications(),
    {
      onError: handleApiError,
    }
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read
      if (!notification.is_read) {
        await apiClient.markNotificationRead(notification.id);
        mutate();
      }

      // Navigate based on type
      switch (notification.type) {
        case 'mention':
        case 'channel':
          // Parse channel from source_id
          router.push(`/channel/general`); // In real app, parse from source_id
          break;
        case 'dm':
          router.push(`/dm/${notification.source_id}`);
          break;
        case 'file':
          // Navigate to file location
          break;
      }

      onClose();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDismiss = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await apiClient.markNotificationRead(notificationId);
      mutate(notifications.filter(n => n.id !== notificationId), false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
      mutate(notifications.map(n => ({ ...n, is_read: true })), false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'mention':
        return <AtSign className="h-4 w-4" />;
      case 'dm':
        return <MessageSquare className="h-4 w-4" />;
      case 'channel':
        return <Hash className="h-4 w-4" />;
      case 'file':
        return <FileText className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-80">
      <div className="flex items-center justify-between p-4">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs"
          >
            Mark all read
          </Button>
        )}
      </div>
      
      <Separator />
      
      <ScrollArea className="h-[400px]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-accent cursor-pointer transition-colors ${
                  !notification.is_read ? 'bg-accent/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 hover:opacity-100"
                    onClick={(e) => handleDismiss(e, notification.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      {notifications.length > 5 && (
        <>
          <Separator />
          <div className="p-2">
            <Button variant="ghost" className="w-full text-sm" onClick={onClose}>
              View all notifications
            </Button>
          </div>
        </>
      )}
    </div>
  );
}