// Export all schemas and types from schemas directory
export * from './schemas';

declare global {
  interface Window {
    DEFAULT_CONFIGURATION: string;
    SENTRY_DSN?: string;
    SENTRY_ENV?: string;
  }
}
