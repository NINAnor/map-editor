import type { z } from 'zod';
import { FolderSchema, LayerSchema, MapConfigSchema, MapSettingsSchema, StoreConfigSchema } from './schemas';

/**
 * Validation result type
 */
export type ValidationResult<T> = { success: true; data: T } | { success: false; errors: z.ZodIssue[] };

/**
 * Safe validation wrapper that returns a result object instead of throwing
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.issues };
}

/**
 * Validate map configuration
 */
export function validateMapConfig(data: unknown) {
  return safeValidate(MapConfigSchema, data);
}

/**
 * Validate store configuration
 */
export function validateStoreConfig(data: unknown) {
  return safeValidate(StoreConfigSchema, data);
}

/**
 * Validate layer configuration
 */
export function validateLayer(data: unknown) {
  return safeValidate(LayerSchema, data);
}

/**
 * Validate folder configuration
 */
export function validateFolder(data: unknown) {
  return safeValidate(FolderSchema, data);
}

/**
 * Validate map settings
 */
export function validateMapSettings(data: unknown) {
  return safeValidate(MapSettingsSchema, data);
}

/**
 * Format Zod errors into a readable string
 */
export function formatZodErrors(errors: z.core.$ZodIssue[]): string {
  return errors
    .map(err => {
      const path = err.path.length > 0 ? err.path.join(' › ') : '(root)';
      return `${path}: ${err.message}`;
    })
    .join('\n');
}
