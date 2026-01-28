import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/contexts/websocket-context';

export interface Metrics {
  totalVerifications: number;
  passRate: number;
  avgRiskScore: number;
  activeWorkflows: number;
  pendingCases: number;
  todayVerifications: number;
  trends: {
    verifications: { value: number; positive: boolean };
    passRate: { value: number; positive: boolean };
    riskScore: { value: number; positive: boolean };
  };
}

export function useRealTimeMetrics() {
  const { subscribe, connected } = useWebSocket();
  const [metrics, setMetrics] = useState<Metrics>({
    totalVerifications: 9747,
    passRate: 94.7,
    avgRiskScore: 32.5,
    activeWorkflows: 12,
    pendingCases: 23,
    todayVerifications: 247,
    trends: {
      verifications: { value: 12.5, positive: true },
      passRate: { value: 1.2, positive: true },
      riskScore: { value: 3.2, positive: false },
    },
  });
  const [loading, setLoading] = useState(false);

  // Update specific metric
  const updateMetric = useCallback((key: keyof Metrics, value: any) => {
    setMetrics(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Update trend
  const updateTrend = useCallback((key: keyof Metrics['trends'], trend: { value: number; positive: boolean }) => {
    setMetrics(prev => ({
      ...prev,
      trends: {
        ...prev.trends,
        [key]: trend,
      },
    }));
  }, []);

  // Subscribe to real-time metric updates
  useEffect(() => {
    if (!connected) return;

    const unsubscribeMetrics = subscribe('metrics.update', (data) => {
      if (data.totalVerifications !== undefined) {
        updateMetric('totalVerifications', data.totalVerifications);
      }
      if (data.passRate !== undefined) {
        updateMetric('passRate', data.passRate);
      }
      if (data.avgRiskScore !== undefined) {
        updateMetric('avgRiskScore', data.avgRiskScore);
      }
      if (data.activeWorkflows !== undefined) {
        updateMetric('activeWorkflows', data.activeWorkflows);
      }
      if (data.pendingCases !== undefined) {
        updateMetric('pendingCases', data.pendingCases);
      }
      if (data.todayVerifications !== undefined) {
        updateMetric('todayVerifications', data.todayVerifications);
      }
    });

    const unsubscribeTrends = subscribe('metrics.trends', (data) => {
      if (data.verifications) {
        updateTrend('verifications', data.verifications);
      }
      if (data.passRate) {
        updateTrend('passRate', data.passRate);
      }
      if (data.riskScore) {
        updateTrend('riskScore', data.riskScore);
      }
    });

    // Simulate real-time updates for demo
    const interval = setInterval(() => {
      // Random small changes to metrics
      setMetrics(prev => ({
        ...prev,
        todayVerifications: prev.todayVerifications + Math.floor(Math.random() * 3),
        pendingCases: Math.max(0, prev.pendingCases + Math.floor(Math.random() * 3) - 1),
        passRate: Math.min(100, Math.max(90, prev.passRate + (Math.random() - 0.5) * 0.5)),
        avgRiskScore: Math.min(50, Math.max(20, prev.avgRiskScore + (Math.random() - 0.5) * 2)),
      }));
    }, 5000);

    return () => {
      unsubscribeMetrics();
      unsubscribeTrends();
      clearInterval(interval);
    };
  }, [connected, subscribe, updateMetric, updateTrend]);

  // Refresh metrics manually
  const refresh = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  }, []);

  return {
    metrics,
    loading,
    connected,
    refresh,
  };
}