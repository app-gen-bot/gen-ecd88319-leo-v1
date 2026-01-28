import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, CheckCircle2, XCircle } from 'lucide-react';
import { useGenerationLogs } from '@/hooks/useGenerationLogs';

interface LogViewerProps {
  requestId: number;
  status: string;
  onStatusChange?: (status: string) => void;
}

export function LogViewer({ requestId, status, onStatusChange }: LogViewerProps) {
  const { logs, isConnected } = useGenerationLogs(requestId, onStatusChange);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = () => {
    if (status === 'completed') {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    if (status === 'failed') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
  };

  const getConnectionStatus = () => {
    if (status === 'completed' || status === 'failed') {
      return null;
    }
    return (
      <div className="flex items-center gap-2 text-xs">
        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
        <span className="text-muted-foreground">
          {isConnected ? 'Live' : 'Disconnected'}
        </span>
      </div>
    );
  };

  return (
    <Card className="mt-4" data-testid="log-viewer">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">Generation Logs</CardTitle>
          </div>
          {getConnectionStatus()}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full rounded-md border bg-black/50 p-4">
          <div ref={scrollRef} className="space-y-1 font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                {status === 'queued' ? 'Waiting for generation to start...' : 'No logs yet...'}
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex gap-3">
                  <span className="text-muted-foreground shrink-0">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className="text-foreground whitespace-pre-wrap break-all">
                    {log.line}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
