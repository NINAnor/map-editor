import { z } from 'zod';

/**
 * Raster legend schemas
 */

export const RasterSequentialLegendSchema = z.object({
  type: z.literal('linear'),
  colormap_name: z.string(),
  min: z.string(),
  max: z.string(),
  orientation: z.enum(['horizontal', 'vertical']).optional(),
});

export const RasterIntervalLegendSchema = z.object({
  type: z.literal('interval'),
  intervals: z
    .array(
      z.object({
        min: z.number(),
        max: z.number(),
        color: z.string(),
        description: z.string(),
      }),
    )
    .min(1, 'At least one interval is required'),
});

export const RasterImageLegendSchema = z.object({
  type: z.literal('image'),
  url: z.string(),
});

export const RasterLegendSchema = z.union([
  RasterSequentialLegendSchema,
  RasterIntervalLegendSchema,
  RasterImageLegendSchema,
]);

/**
 * Inferred types
 */

export type RasterSequentialLegend = z.infer<typeof RasterSequentialLegendSchema>;
export type RasterIntervalLegend = z.infer<typeof RasterIntervalLegendSchema>;
export type RasterImageLegend = z.infer<typeof RasterImageLegendSchema>;
