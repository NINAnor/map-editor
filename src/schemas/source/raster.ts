import { z } from 'zod';
import { RasterLegendSchema } from '../legend/raster';

/**
 * Raster source schema for tile-based raster layers
 */

export const RasterSourceSchema = z
  .object({
    type: z.literal('raster'),
    tiles: z.array(z.string()).min(1, 'At least one tile URL is required'),
    tileSize: z.number().optional(),
    minzoom: z.number().optional(),
    maxzoom: z.number().optional(),
    bounds: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
    attribution: z.string().optional(),
    legend: RasterLegendSchema.optional(),
  })
  .catchall(z.unknown()); // Allow partial Source properties

/**
 * Inferred type
 */

export type RasterSource = z.infer<typeof RasterSourceSchema>;
