/**
 * IterationComparisonModal Component
 *
 * Modal dialog for comparing two iteration snapshots side-by-side.
 * Shows prompt diffs, file changes, and metadata comparisons.
 */

import { ArrowRight, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import type { IterationSnapshot } from '@shared/schema.zod';

interface IterationComparisonModalProps {
  snapshotA: IterationSnapshot | null;
  snapshotB: IterationSnapshot | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function IterationComparisonModal({
  snapshotA,
  snapshotB,
  isOpen,
  onClose,
}: IterationComparisonModalProps) {
  if (!snapshotA || !snapshotB) {
    return null;
  }

  // Parse file snapshots
  const filesA = extractFileList(snapshotA);
  const filesB = extractFileList(snapshotB);

  // Calculate diff
  const filesAdded = filesB.filter((f) => !filesA.includes(f));
  const filesRemoved = filesA.filter((f) => !filesB.includes(f));
  const filesModified = filesB.filter((f) => filesA.includes(f));

  // Simple text diff for prompts
  const promptChanged = snapshotA.promptUsed !== snapshotB.promptUsed;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Compare Iterations</span>
            <Badge variant="outline">
              {snapshotA.iterationNumber}
            </Badge>
            <ArrowRight className="w-4 h-4 text-leo-text-tertiary" />
            <Badge variant="outline">
              {snapshotB.iterationNumber}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* What Changed Summary */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-leo-text mb-3">What Changed</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-500">{filesAdded.length}</div>
                  <div className="text-xs text-leo-text-tertiary">Files Added</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">{filesModified.length}</div>
                  <div className="text-xs text-leo-text-tertiary">Files Modified</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">{filesRemoved.length}</div>
                  <div className="text-xs text-leo-text-tertiary">Files Removed</div>
                </div>
              </div>
            </Card>

            {/* Side-by-side comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left: Snapshot A */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-leo-text">
                    Iteration {snapshotA.iterationNumber}
                  </h3>
                  <Badge variant="secondary">{snapshotA.snapshotType}</Badge>
                </div>

                {/* Metadata A */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-leo-text-tertiary">Timestamp:</span>
                    <span className="text-leo-text-secondary">
                      {new Date(snapshotA.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {snapshotA.metadata?.tokensUsed && (
                    <div className="flex justify-between text-xs">
                      <span className="text-leo-text-tertiary">Tokens:</span>
                      <span className="text-leo-text-secondary">
                        {snapshotA.metadata.tokensUsed.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {snapshotA.metadata?.duration && (
                    <div className="flex justify-between text-xs">
                      <span className="text-leo-text-tertiary">Duration:</span>
                      <span className="text-leo-text-secondary">
                        {Math.round(snapshotA.metadata.duration / 1000)}s
                      </span>
                    </div>
                  )}
                </div>

                {/* Prompt A */}
                <div className="pt-3 border-t border-leo-border">
                  <h4 className="text-xs font-medium text-leo-text-tertiary mb-2">Prompt</h4>
                  <p className="text-xs text-leo-text-secondary whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                    {snapshotA.promptUsed}
                  </p>
                </div>
              </Card>

              {/* Right: Snapshot B */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-leo-text">
                    Iteration {snapshotB.iterationNumber}
                  </h3>
                  <Badge variant="secondary">{snapshotB.snapshotType}</Badge>
                </div>

                {/* Metadata B */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-leo-text-tertiary">Timestamp:</span>
                    <span className="text-leo-text-secondary">
                      {new Date(snapshotB.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {snapshotB.metadata?.tokensUsed && (
                    <div className="flex justify-between text-xs">
                      <span className="text-leo-text-tertiary">Tokens:</span>
                      <span className="text-leo-text-secondary">
                        {snapshotB.metadata.tokensUsed.toLocaleString()}
                        {snapshotA.metadata?.tokensUsed && (
                          <span className={`ml-2 ${
                            snapshotB.metadata.tokensUsed > snapshotA.metadata.tokensUsed
                              ? 'text-red-500'
                              : 'text-green-500'
                          }`}>
                            ({snapshotB.metadata.tokensUsed > snapshotA.metadata.tokensUsed ? '+' : ''}
                            {snapshotB.metadata.tokensUsed - snapshotA.metadata.tokensUsed})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  {snapshotB.metadata?.duration && (
                    <div className="flex justify-between text-xs">
                      <span className="text-leo-text-tertiary">Duration:</span>
                      <span className="text-leo-text-secondary">
                        {Math.round(snapshotB.metadata.duration / 1000)}s
                        {snapshotA.metadata?.duration && (
                          <span className={`ml-2 ${
                            snapshotB.metadata.duration > snapshotA.metadata.duration
                              ? 'text-red-500'
                              : 'text-green-500'
                          }`}>
                            ({snapshotB.metadata.duration > snapshotA.metadata.duration ? '+' : ''}
                            {Math.round((snapshotB.metadata.duration - snapshotA.metadata.duration) / 1000)}s)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Prompt B */}
                <div className="pt-3 border-t border-leo-border">
                  <h4 className="text-xs font-medium text-leo-text-tertiary mb-2">
                    Prompt {promptChanged && <span className="text-yellow-500">(Changed)</span>}
                  </h4>
                  <p className={`text-xs whitespace-pre-wrap break-words max-h-32 overflow-y-auto ${
                    promptChanged ? 'text-yellow-500' : 'text-leo-text-secondary'
                  }`}>
                    {snapshotB.promptUsed}
                  </p>
                </div>
              </Card>
            </div>

            {/* File Changes */}
            {(filesAdded.length > 0 || filesRemoved.length > 0 || filesModified.length > 0) && (
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-leo-text mb-3">File Changes</h3>
                <div className="space-y-3">
                  {filesAdded.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-green-500 mb-2">
                        Added ({filesAdded.length})
                      </h4>
                      <ul className="space-y-1">
                        {filesAdded.map((file, index) => (
                          <li
                            key={index}
                            className="text-xs text-green-500 font-mono flex items-center gap-2"
                          >
                            <FileText className="w-3 h-3" />
                            {file}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {filesModified.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-blue-500 mb-2">
                        Modified ({filesModified.length})
                      </h4>
                      <ul className="space-y-1">
                        {filesModified.slice(0, 10).map((file, index) => (
                          <li
                            key={index}
                            className="text-xs text-blue-500 font-mono flex items-center gap-2"
                          >
                            <FileText className="w-3 h-3" />
                            {file}
                          </li>
                        ))}
                        {filesModified.length > 10 && (
                          <li className="text-xs text-leo-text-tertiary italic">
                            ...and {filesModified.length - 10} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {filesRemoved.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-red-500 mb-2">
                        Removed ({filesRemoved.length})
                      </h4>
                      <ul className="space-y-1">
                        {filesRemoved.map((file, index) => (
                          <li
                            key={index}
                            className="text-xs text-red-500 font-mono flex items-center gap-2 line-through"
                          >
                            <FileText className="w-3 h-3" />
                            {file}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Extract file list from snapshot
 */
function extractFileList(snapshot: IterationSnapshot): string[] {
  // Use metadata.changedFiles if available
  if (snapshot.metadata?.changedFiles) {
    return snapshot.metadata.changedFiles;
  }

  // Otherwise parse filesSnapshot
  try {
    const filesSnapshot = typeof snapshot.filesSnapshot === 'string'
      ? JSON.parse(snapshot.filesSnapshot)
      : snapshot.filesSnapshot;

    return extractFilePaths(filesSnapshot);
  } catch (error) {
    console.error('Failed to parse filesSnapshot:', error);
    return [];
  }
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
