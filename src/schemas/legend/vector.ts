import { z } from 'zod';

/**
 * Vector legend schemas
 */

export const VectorFillValueSchema = z.object({
  value: z.string().or(z.number()),
  description: z.string().optional(),
  color: z.string(),
  borderColor: z.string().optional(),
  opacity: z.number().optional(),
});

export const VectorFillLegendSchema = z
  .object({
    default: VectorFillValueSchema.omit({ value: true }).optional(),
    field: z.string().optional(),
    values: z.array(VectorFillValueSchema).optional(),
  })
  .refine(data => !data.values?.length || !!data.field, {
    message: "'field' is required when 'values' is provided",
    path: ['field'],
  });

export const VectorLineValueSchema = z.object({
  value: z.string().or(z.number()),
  description: z.string().optional(),
  color: z.string(),
  opacity: z.number().optional(),
  width: z.number().optional(),
  dasharray: z.array(z.number()).optional(),
});

export const VectorLineLegendSchema = z
  .object({
    default: VectorLineValueSchema.omit({ value: true }).optional(),
    field: z.string().optional(),
    values: z.array(VectorLineValueSchema).optional(),
  })
  .refine(data => !data.values?.length || !!data.field, {
    message: "'field' is required when 'values' is provided",
    path: ['field'],
  });

export const VectorCircleValueSchema = z.object({
  value: z.string().or(z.number()),
  description: z.string().optional(),
  color: z.string(),
  opacity: z.number().optional(),
  radius: z.number().optional(),
  strokeColor: z.string().optional(),
  strokeWidth: z.number().optional(),
});

export const VectorCircleLegendSchema = z
  .object({
    default: VectorCircleValueSchema.omit({ value: true }).optional(),
    field: z.string().optional(),
    values: z.array(VectorCircleValueSchema).optional(),
  })
  .refine(data => !data.values?.length || !!data.field, {
    message: "'field' is required when 'values' is provided",
    path: ['field'],
  });

/**
 * Inferred types
 */

export type VectorFillValue = z.infer<typeof VectorFillValueSchema>;
export type VectorFillLegend = z.infer<typeof VectorFillLegendSchema>;
export type VectorLineValue = z.infer<typeof VectorLineValueSchema>;
export type VectorLineLegend = z.infer<typeof VectorLineLegendSchema>;
export type VectorCircleValue = z.infer<typeof VectorCircleValueSchema>;
export type VectorCircleLegend = z.infer<typeof VectorCircleLegendSchema>;
