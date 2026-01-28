// Auth Storage Keys
export const AUTH_TOKEN_KEY = "auth_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const CURRENT_USER_KEY = "current_user";
export const CURRENT_WORKSPACE_KEY = "current_workspace";

// UI Constants
export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 60;
export const HEADER_HEIGHT = 64;
export const RIGHT_PANEL_WIDTH = 320;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MESSAGE_PAGE_SIZE = 50;

// Real-time
export const TYPING_INDICATOR_TIMEOUT = 3000;
export const PRESENCE_UPDATE_INTERVAL = 30000;
export const MESSAGE_POLL_INTERVAL = 30000;

// Validation
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_NAME_LENGTH = 50;
export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_TASK_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 5000;
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Plan Limits
export const FREE_PLAN_USER_LIMIT = 10;
export const FREE_PLAN_PROJECT_LIMIT = 5;
export const FREE_PLAN_STORAGE_LIMIT = 10 * 1024 * 1024 * 1024; // 10GB

// Error Codes
export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  SERVER_ERROR: "SERVER_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  DUPLICATE_RESOURCE: "DUPLICATE_RESOURCE",
} as const;

// Task Statuses
export const TASK_STATUSES = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  DONE: "done",
} as const;

// Task Priorities
export const TASK_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

// Default Routes
export const DEFAULT_CHANNEL = "general";
export const DEFAULT_ROUTE = `/app/channel/${DEFAULT_CHANNEL}`;

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  GLOBAL_SEARCH: "cmd+k,ctrl+k",
  SEND_MESSAGE: "cmd+enter,ctrl+enter",
  GO_TO_CHANNELS: "g c",
  GO_TO_PROJECTS: "g p",
  SHOW_SHORTCUTS: "cmd+/,ctrl+/",
} as const;