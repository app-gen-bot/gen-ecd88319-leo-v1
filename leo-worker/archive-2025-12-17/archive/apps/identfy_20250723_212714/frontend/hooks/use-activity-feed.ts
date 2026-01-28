import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/contexts/websocket-context';

export interface ActivityItem {
  id: string;
  type: 'case' | 'workflow' | 'team' | 'system';
  action: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  details: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export function useActivityFeed(limit: number = 10) {
  const { subscribe } = useWebSocket();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add new activity
  const addActivity = useCallback((activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setActivities(prev => [newActivity, ...prev].slice(0, limit));
  }, [limit]);

  // Load initial activities
  useEffect(() => {
    // Mock initial activities
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'case',
        action: 'approved',
        user: {
          name: 'Sarah Chen',
          email: 'sarah.chen@acme.com',
        },
        details: 'Approved case #CASE-011 after manual review',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: '2',
        type: 'workflow',
        action: 'published',
        user: {
          name: 'Mike Johnson',
          email: 'mike.johnson@acme.com',
        },
        details: 'Published new version of Customer Onboarding workflow',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
      },
      {
        id: '3',
        type: 'team',
        action: 'joined',
        user: {
          name: 'Emily Davis',
          email: 'emily.davis@acme.com',
        },
        details: 'Joined the team as Compliance Analyst',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: '4',
        type: 'case',
        action: 'flagged',
        user: {
          name: 'System',
          email: 'system@identfy.com',
        },
        details: 'Flagged case #CASE-010 for high risk score (89)',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
      },
      {
        id: '5',
        type: 'system',
        action: 'updated',
        user: {
          name: 'System',
          email: 'system@identfy.com',
        },
        details: 'Updated risk scoring algorithm to v2.3',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
      },
    ];

    setActivities(mockActivities);
    setLoading(false);
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribeCaseActivity = subscribe('activity.case', (data) => {
      addActivity({
        type: 'case',
        action: data.action,
        user: data.user,
        details: data.details,
        metadata: data.metadata,
      });
    });

    const unsubscribeWorkflowActivity = subscribe('activity.workflow', (data) => {
      addActivity({
        type: 'workflow',
        action: data.action,
        user: data.user,
        details: data.details,
        metadata: data.metadata,
      });
    });

    const unsubscribeTeamActivity = subscribe('activity.team', (data) => {
      addActivity({
        type: 'team',
        action: data.action,
        user: data.user,
        details: data.details,
        metadata: data.metadata,
      });
    });

    const unsubscribeSystemActivity = subscribe('activity.system', (data) => {
      addActivity({
        type: 'system',
        action: data.action || 'updated',
        user: {
          name: 'System',
          email: 'system@identfy.com',
        },
        details: data.details,
        metadata: data.metadata,
      });
    });

    return () => {
      unsubscribeCaseActivity();
      unsubscribeWorkflowActivity();
      unsubscribeTeamActivity();
      unsubscribeSystemActivity();
    };
  }, [subscribe, addActivity]);

  return {
    activities,
    loading,
    addActivity,
  };
}