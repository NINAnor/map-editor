import { z } from 'zod';
import { RasterLegendSchema } from '../legend/raster';

/**
 * Titiler source schema for Cloud Optimized GeoTIFF (COG)
 * Matches rjsf/schemas/layer.ts TitilerSource definition
 *
 * Split into two variants so the type system enforces that `legend` is
 * required for single-band rendering and optional for RGB.
 */

const rescaleSchema = z.array(z.string().regex(/^[0-9.-]+,[0-9.-]+$/)).optional();

// Single-band: legend is required for colormap rendering
export const TitilerSingleBandSchema = z
  .object({
    type: z.literal('titiler'),
    titiler: z
      .object({
        url: z.string(),
        bidx: z.literal('single'),
        rescale: rescaleSchema,
      })
      .catchall(z.unknown()),
    legend: RasterLegendSchema,
  })
  .catchall(z.unknown());

// RGB: legend is optional
export const TitilerRGBSchema = z
  .object({
    type: z.literal('titiler'),
    titiler: z
      .object({
        url: z.string(),
        bidx: z.literal('rgb'),
        rescale: rescaleSchema,
      })
      .catchall(z.unknown()),
    legend: RasterLegendSchema.optional(),
  })
  .catchall(z.unknown());

export const TitilerSourceSchema = z.union([TitilerSingleBandSchema, TitilerRGBSchema]);

/**
 * Inferred types
 */

export type TitilerSingleBand = z.infer<typeof TitilerSingleBandSchema>;
export type TitilerRGB = z.infer<typeof TitilerRGBSchema>;
export type TitilerSource = z.infer<typeof TitilerSourceSchema>;
