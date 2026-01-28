/**
 * IterationDetails Component
 *
 * Displays detailed information about a selected iteration snapshot,
 * including prompt, files changed, metadata, and action buttons.
 */

import { useState } from 'react';
import { RotateCcw, GitCompare, Trash2, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import type { IterationSnapshot } from '@shared/schema.zod';

interface IterationDetailsProps {
  snapshot: IterationSnapshot | null;
  onRollback: (snapshotId: number) => void;
  onCompare: (snapshotId: number) => void;
  onDelete: (snapshotId: number) => void;
}

export default function IterationDetails({
  snapshot,
  onRollback,
  onCompare,
  onDelete,
}: IterationDetailsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);

  if (!snapshot) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-leo-text-secondary">
        <FileText className="w-12 h-12 mb-3 text-leo-text-tertiary" />
        <p className="text-sm">Select an iteration to view details</p>
      </div>
    );
  }

  // Parse files snapshot if it's a JSON string
  let filesChanged: string[] = [];
  try {
    const filesSnapshot = typeof snapshot.filesSnapshot === 'string'
      ? JSON.parse(snapshot.filesSnapshot)
      : snapshot.filesSnapshot;

    // Extract file paths from the snapshot structure
    if (filesSnapshot && typeof filesSnapshot === 'object') {
      // If it's a file tree structure, extract file paths
      filesChanged = extractFilePaths(filesSnapshot);
    }
  } catch (error) {
    console.error('Failed to parse filesSnapshot:', error);
  }

  // Use metadata.changedFiles if available, otherwise use parsed files
  const files = snapshot.metadata?.changedFiles || filesChanged;

  const handleRollback = () => {
    if (showRollbackConfirm) {
      onRollback(snapshot.id);
      setShowRollbackConfirm(false);
    } else {
      setShowRollbackConfirm(true);
      setTimeout(() => setShowRollbackConfirm(false), 3000);
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(snapshot.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-leo-border">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-leo-text mb-1">
              Iteration {snapshot.iterationNumber}
            </h3>
            <p className="text-xs text-leo-text-tertiary">
              {new Date(snapshot.timestamp).toLocaleString()}
            </p>
          </div>
          <Badge
            variant={
              snapshot.snapshotType === 'manual'
                ? 'default'
                : snapshot.snapshotType === 'checkpoint'
                ? 'outline'
                : 'secondary'
            }
          >
            {snapshot.snapshotType}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Prompt */}
          <Card className="p-4">
            <h4 className="text-sm font-medium text-leo-text mb-2">Prompt</h4>
            <p className="text-sm text-leo-text-secondary whitespace-pre-wrap break-words">
              {snapshot.promptUsed}
            </p>
          </Card>

          {/* Metadata */}
          {snapshot.metadata && (
            <Card className="p-4">
              <h4 className="text-sm font-medium text-leo-text mb-3">Metadata</h4>
              <div className="grid grid-cols-2 gap-3">
                {snapshot.metadata.tokensUsed && (
                  <div>
                    <p className="text-xs text-leo-text-tertiary mb-1">Tokens Used</p>
                    <p className="text-sm font-medium text-leo-text">
                      {snapshot.metadata.tokensUsed.toLocaleString()}
                    </p>
                  </div>
                )}
                {snapshot.metadata.duration && (
                  <div>
                    <p className="text-xs text-leo-text-tertiary mb-1">Duration</p>
                    <p className="text-sm font-medium text-leo-text">
                      {Math.round(snapshot.metadata.duration / 1000)}s
                    </p>
                  </div>
                )}
              </div>
              {snapshot.metadata.summary && (
                <div className="mt-3 pt-3 border-t border-leo-border">
                  <p className="text-xs text-leo-text-tertiary mb-1">Summary</p>
                  <p className="text-sm text-leo-text-secondary">{snapshot.metadata.summary}</p>
                </div>
              )}
            </Card>
          )}

          {/* Files Changed */}
          {files.length > 0 && (
            <Card className="p-4">
              <h4 className="text-sm font-medium text-leo-text mb-2">
                Files Changed ({files.length})
              </h4>
              <ul className="space-y-1">
                {files.map((file, index) => (
                  <li key={index} className="text-xs text-leo-text-secondary font-mono">
                    {file}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="flex-shrink-0 p-4 border-t border-leo-border space-y-2">
        {/* Rollback Warning */}
        {showRollbackConfirm && (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-500">
              Click again to confirm rollback. This will restore the generation to this iteration.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleRollback}
            variant={showRollbackConfirm ? 'destructive' : 'default'}
            size="sm"
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {showRollbackConfirm ? 'Confirm Rollback' : 'Rollback'}
          </Button>
          <Button onClick={() => onCompare(snapshot.id)} variant="outline" size="sm" className="flex-1">
            <GitCompare className="w-4 h-4 mr-2" />
            Compare
          </Button>
        </div>

        {/* Delete button for manual snapshots */}
        {snapshot.snapshotType === 'manual' && (
          <>
            {showDeleteConfirm && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-500">
                  Click again to permanently delete this snapshot.
                </p>
              </div>
            )}
            <Button
              onClick={handleDelete}
              variant={showDeleteConfirm ? 'destructive' : 'outline'}
              size="sm"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {showDeleteConfirm ? 'Confirm Delete' : 'Delete Snapshot'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Extract file paths from a nested file tree structure
 */
function extractFilePaths(obj: any, prefix: string = ''): string[] {
  const paths: string[] = [];

  if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}/${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively extract from nested objects
        paths.push(...extractFilePaths(value, path));
      } else {
        // It's a file
        paths.push(path);
      }
    }
  }

  return paths;
}
