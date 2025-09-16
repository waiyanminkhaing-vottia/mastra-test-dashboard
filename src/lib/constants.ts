/**
 * Application-wide constants and configuration values
 */

// API and Request Limits
/**
 * API and request configuration limits
 * Used to prevent abuse and ensure system stability
 */
export const API_LIMITS = {
  REQUEST_SIZE_MAX: 50000, // 50KB
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 900000, // 15 minutes in ms
} as const;

// Text Editor Configuration
/**
 * Text editor configuration settings
 * Defines limits and defaults for Monaco editor instances
 */
export const TEXT_EDITOR = {
  HEIGHT: {
    MIN: 200,
    MAX: 800,
    DEFAULT: 400,
  },
  FONT_SIZE: {
    MIN: 10,
    MAX: 24,
    DEFAULT: 14,
  },
  TAB_SIZE: {
    MIN: 1,
    MAX: 8,
    DEFAULT: 2,
  },
} as const;

// Form Validation Limits
/**
 * Form validation limits for input fields
 * Ensures consistent validation across the application
 */
export const VALIDATION_LIMITS = {
  LABEL_NAME_MAX_LENGTH: 50,
  PROMPT_NAME_MAX_LENGTH: 100,
  MODEL_NAME_MAX_LENGTH: 100,
  CHANGE_NOTE_MAX_LENGTH: 500,
} as const;

// UI Configuration
/**
 * UI configuration constants
 * Controls layout, timing, and behavior settings
 */
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 320,
  NAVIGATION_HISTORY_LIMIT: 10,
  NOTIFICATION_AUTO_DISMISS_DELAY: 5000, // 5 seconds
  COPY_STATE_RESET_DELAY: 2000, // 2 seconds
  RECENT_PATHS_LIMIT: 5,
} as const;

// Table Configuration
/**
 * Data table configuration settings
 * Pagination and display options for tables
 */
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  SKELETON_ROWS: 5,
} as const;

// File Upload Limits
/**
 * File upload restrictions and settings
 * Security limits for user file uploads
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 5242880, // 5MB
  ALLOWED_TYPES: ['text/plain', 'application/json'] as const,
} as const;

// Database Pagination
/**
 * Database pagination defaults
 * Limits for database query result sets
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Cache Duration (in seconds)
/**
 * Cache duration settings in seconds
 * TTL values for different cache levels
 */
export const CACHE_DURATION = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
} as const;
