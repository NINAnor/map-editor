import { z } from 'zod';
import { TreeSchema } from './layer/tree';

/**
 * Map-related schemas
 */

export const FooterSchema = z.object({
  items: z.array(z.string()),
  justify: z
    .enum([
      'justify-center-safe',
      'justify-start',
      'justify-end-safe',
      'justify-between',
      'justify-normal',
      'justify-stretch',
    ])
    .optional(),
  align: z.enum(['items-center', 'items-start', 'items-end', 'items-baseline']).optional(),
});

export const MapSettingsSchema = z.object({
  titiler_api_url: z.string(),
  theme: z.string(),
  language: z.string(),
  footer: FooterSchema.optional(),
  menuOrientation: z.enum(['horizontal', 'vertical']).optional(),
  exclusiveLayers: z.boolean().optional(),
});

export const MapMetaSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const BaseMapStyleSchema = z.object({
  id: z.string(),
  style: z.string(),
  active: z.boolean(),
});

export const ViewStateSchema = z
  .object({
    longitude: z.number().min(-180).max(180).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    zoom: z.number().min(0).max(24).optional(),
    bearing: z.number().min(-180).max(180).optional(),
    pitch: z.number().min(0).max(85).optional(),
    padding: z
      .object({
        top: z.number(),
        bottom: z.number(),
        left: z.number(),
        right: z.number(),
      })
      .optional(),
  })
  .catchall(z.unknown());

export const MapConfigSchema = MapMetaSchema.extend({
  id: z.string(),
  baseMap: z.string(),
  styles: z.record(z.string(), z.string()).optional(),
  layerOrder: z.array(z.string()),
  viewState: ViewStateSchema,
  items: TreeSchema.nullable(),
  expandedItems: z.array(z.string()),
  config: MapSettingsSchema,
}).superRefine((data, ctx) => {
  // baseMap must be a key present in the styles record
  if (data.styles && !(data.baseMap in data.styles)) {
    ctx.addIssue({
      code: "custom",
      message: `baseMap '${data.baseMap}' is not defined in styles. Valid values: ${Object.keys(data.styles).join(', ')}`,
      path: ['baseMap'],
    });
  }

  if (data.items === null) return;

  // items must contain a 'root' folder (used as the tree root by LayerTree)
  if (!('root' in data.items)) {
    ctx.addIssue({
      code: "custom",
      message: "items must contain a 'root' key",
      path: ['items'],
    });
  } else if (data.items['root'].type !== 'folder') {
    ctx.addIssue({
      code: "custom",
      message: "items['root'] must be of type 'folder'",
      path: ['items', 'root', 'type'],
    });
  }

  // layerOrder entries must reference existing layer-type items (not folders)
  data.layerOrder.forEach((id, index) => {
    if (!(id in data.items!)) {
      ctx.addIssue({
        code: "custom",
        message: `layerOrder entry '${id}' does not exist in items`,
        path: ['layerOrder', index],
      });
    } else if (data.items![id].type !== 'layer') {
      ctx.addIssue({
        code: "custom",
        message: `layerOrder entry '${id}' must be a layer, not a folder`,
        path: ['layerOrder', index],
      });
    }
  });
});

/**
 * Inferred types
 */

export type Footer = z.infer<typeof FooterSchema>;
export type MapSettings = z.infer<typeof MapSettingsSchema>;
export type MapMeta = z.infer<typeof MapMetaSchema>;
export type BaseMapStyle = z.infer<typeof BaseMapStyleSchema>;
export type MapConfig = z.infer<typeof MapConfigSchema>;
