"use client";

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Archive,
  Trash2,
  Clock,
  MoreVertical,
  Filter,
  Check,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime, getInitials } from "@/lib/utils";
import { useNotifications } from "@/contexts/notification-context";
import { useRouter } from "next/navigation";

// Icon mapping for notification types
const iconMap = {
  case: AlertTriangle,
  workflow: CheckCircle,
  system: Info,
  team: Users,
} as const;

export default function NotificationsPage() {
  const router = useRouter();
  const { 
    notifications: contextNotifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    clearAll 
  } = useNotifications();
  
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");

  // Map context notifications to component format
  const notifications = contextNotifications.map(n => ({
    id: n.id,
    type: n.type,
    title: n.title,
    description: n.description,
    timestamp: n.timestamp,
    read: n.read,
    icon: iconMap[n.type] || Info,
    iconColor: n.severity === 'error' ? 'text-red-500' : 
               n.severity === 'warning' ? 'text-amber-500' :
               n.severity === 'success' ? 'text-green-500' : 'text-blue-500',
    link: n.link,
  }));

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (ids: string[]) => {
    ids.forEach(id => markAsRead(id));
  };

  const deleteNotifications = (ids: string[]) => {
    ids.forEach(id => removeNotification(id));
    setSelectedNotifications([]);
  };

  const archiveNotifications = (ids: string[]) => {
    // In a real app, this would move to archive
    deleteNotifications(ids);
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const toggleSelectNotification = (id: string) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(prev => prev.filter(nId => nId !== id));
    } else {
      setSelectedNotifications(prev => [...prev, id]);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Stay updated with important events and activities
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>
                You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedNotifications.length > 0 ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsRead(selectedNotifications)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => archiveNotifications(selectedNotifications)}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteNotifications(selectedNotifications)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark All as Read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="case">Cases</TabsTrigger>
              <TabsTrigger value="workflow">Workflows</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-2">
              {filteredNotifications.length > 0 && (
                <div className="flex items-center gap-3 pb-2 border-b">
                  <Checkbox
                    checked={selectedNotifications.length === filteredNotifications.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    Select all {filteredNotifications.length} notifications
                  </span>
                </div>
              )}

              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No notifications</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filter === "unread" 
                      ? "You're all caught up!"
                      : "No notifications in this category"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                          !notification.read ? "bg-accent/50" : ""
                        } ${
                          selectedNotifications.includes(notification.id)
                            ? "border-primary"
                            : ""
                        }`}
                      >
                        <Checkbox
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={() => toggleSelectNotification(notification.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className={`mt-0.5 ${notification.iconColor}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            if (!notification.read) {
                              markAsRead(notification.id);
                            }
                            if (notification.link) {
                              router.push(notification.link);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDateTime(notification.timestamp)}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-primary rounded-full" />
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.read && (
                              <DropdownMenuItem
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Mark as Read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => archiveNotifications([notification.id])}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteNotifications([notification.id])}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}