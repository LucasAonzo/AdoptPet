/**
 * Central export for all type definitions
 */

// Re-export all types
export * from './animal';
export * from './user';
export * from './theme';
export * from './navigation';

// Export additional common types 

/**
 * Common API response type
 */
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Common error response
 */
export interface ErrorResponse {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Form field error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Form validation errors
 */
export interface ValidationErrors {
  message: string;
  errors: FieldError[];
} 