import { z } from 'zod';
import { LayerConfigSchema } from '../source';

/**
 * Layer schema for individual map layers
 */

export const LayerSchema = z.object({
  type: z.literal('layer'),
  name: z.string(),
  description: z.string().optional(),
  popup: z.boolean().optional().describe('Whether features from this layer appear in info popups; defaults to true.'),
  layer: LayerConfigSchema,
  download_url: z.string().optional(),
});

/**
 * Update/Create variants for layer mutations
 */

export const UpdateLayerSchema = LayerSchema.omit({ type: true });

export const CreateLayerSchema = UpdateLayerSchema.extend({
  parent: z.string(),
  id: z.string(),
});

export const LayerWithIdSchema = LayerSchema.extend({
  id: z.string(),
});

/**
 * Inferred types
 */

export type Layer = z.infer<typeof LayerSchema>;
export type UpdateLayer = z.infer<typeof UpdateLayerSchema>;
export type CreateLayer = z.infer<typeof CreateLayerSchema>;
export type LayerWithId = z.infer<typeof LayerWithIdSchema>;
