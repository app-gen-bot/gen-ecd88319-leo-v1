/**
 * Message Types for Leo V2 WebSocket REPL
 */

// Base message types
export interface BaseMessage {
  id?: string;
  sessionId?: string;
  timestamp?: string;
}

// REPL message types
export interface REPLOutput extends BaseMessage {
  type: 'repl_output';
  output: string;
  stream?: 'stdout' | 'stderr';
}

export interface REPLLog extends BaseMessage {
  type: 'log';
  line?: string;
  content?: string;
  level?: 'info' | 'warn' | 'error' | 'success';
}

export interface REPLProgress extends BaseMessage {
  type: 'progress';
  progress?: number;
  percentage?: number;
  message?: string;
  currentTask?: string;
}

export interface REPLError extends BaseMessage {
  type: 'error';
  error?: string;
  message?: string;
  stack?: string;
}

export interface REPLSuggestion extends BaseMessage {
  type: 'suggestion';
  text?: string;
  content?: string;
}

export interface REPLAwaitingInput extends BaseMessage {
  type: 'awaiting_input';
  prompt?: string;
}

export interface REPLCompleted extends BaseMessage {
  type: 'completed';
  message?: string;
  stats?: Record<string, any>;
}

export interface GenerationStarted extends BaseMessage {
  type: 'generation_started';
  mode?: string;
}

export interface GeneratorMessage extends BaseMessage {
  type: 'generator_message';
  generatorMessage?: {
    type: string;
    data?: any;
  };
}

// Control/status messages
export interface StatusChangeMessage extends BaseMessage {
  type: 'status_change';
  previousStatus?: string;
  newStatus?: string;
  reason?: string;
}

export interface ControlCommandMessage {
  type: 'control_command';
  sessionId: string;
  command: 'pause' | 'resume' | 'cancel' | 'checkpoint' | 'restore';
  payload?: {
    checkpointName?: string;
    checkpointId?: string;
    reason?: string;
  };
}

// Interactive mode messages
export interface InteractiveQuestion extends BaseMessage {
  type: 'interactive_question';
  questionId?: string;
  question?: string;
  options?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
}

export interface InteractiveResponse {
  type: 'interactive_response';
  sessionId: string;
  questionId: string;
  response: string | string[];
  customValue?: string;
}

// Suggestion messages
export interface SuggestionGroup extends BaseMessage {
  type: 'ai_suggestions';
  suggestionGroupId?: string;
  groupName?: string;
  suggestions?: any[];
}

export interface SuggestionResponse {
  type: 'suggestion_response';
  sessionId: string;
  suggestionGroupId: string;
  action: 'approve_all' | 'reject_all' | 'modify' | 'request_alternative';
  modifications?: Array<{
    suggestionId: string;
    changes: Record<string, any>;
  }>;
  feedback?: string;
}

export interface ProgressUpdate extends BaseMessage {
  type: 'progress_update';
  phase?: string;
  currentTask?: string;
  progress?: number;
}

// Union types
export type Message =
  | REPLOutput
  | REPLLog
  | REPLProgress
  | REPLError
  | REPLSuggestion
  | REPLAwaitingInput
  | REPLCompleted
  | GenerationStarted
  | GeneratorMessage
  | StatusChangeMessage
  | InteractiveQuestion
  | SuggestionGroup
  | ProgressUpdate;
