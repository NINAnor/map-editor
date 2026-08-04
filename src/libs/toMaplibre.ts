import hexRgb from 'hex-rgb';
import type { SourceProps } from 'react-map-gl/maplibre';
import type { LayerErrorInput } from '../hooks/errors';
import type {
  LayerWithId,
  PMTileSource,
  RasterSource,
  TitilerSource,
  VectorCircleLegend,
  VectorCircleValue,
  VectorFillLegend,
  VectorFillValue,
  VectorLineLegend,
  VectorLineValue,
  WMSSource,
  WMTSSource,
} from '../types';

/**
 * Generic type for extracting specific values from vector legend value objects
 */
type ValueExtractor<T> = (value: T) => [string, unknown];

/**
 * Union type for all vector legend value types
 */
type VectorValue = VectorFillValue | VectorLineValue | VectorCircleValue;

/**
 * Union type for all vector legend types
 */
type VectorLegend = VectorFillLegend | VectorLineLegend | VectorCircleLegend;

/**
 * Band selection constants for raster layers
 */
const BAND_TYPES = {
  SINGLE: 'single',
  RGB: 'rgb',
} as const;

/**
 * Builds a MapLibre raster layer configuration for TiTiler sources
 * @param layer - Layer configuration with TiTiler source
 * @param titiler_api_url - Base URL for the TiTiler API
 * @returns MapLibre raster source configuration
 */
function buildRasterLayer(layer: LayerWithId, titiler_api_url: string): SourceProps {
  try {
    const l = layer.layer as TitilerSource;
    const { bidx = BAND_TYPES.SINGLE, rescale, ...other } = l.titiler;
    const search = new URLSearchParams();

    // Validate required parameters
    if (!l.titiler?.url) {
      throw new Error(`Missing required 'url' parameter for raster layer ${layer.id}`);
    }

    let tileUrl = `${titiler_api_url}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}@1x?`;
    let extra = '';

    if (bidx === BAND_TYPES.SINGLE) {
      if (!l.legend) {
        throw Error('Legend should be provided for a single band raster!');
      }
      search.append('bidx', '1');

      // Add rescale values if provided
      if (rescale?.length) {
        rescale.forEach(v => {
          if (typeof v === 'string' && v.includes(',')) {
            search.append('rescale', v);
          } else {
            console.warn(`Invalid rescale value format: ${v}. Expected format: "min,max"`);
          }
        });
      }

      // Handle colormap configuration
      if (l.legend.type === 'linear') {
        if (l.legend.colormap_name) {
          search.append('colormap_name', l.legend.colormap_name);
        } else {
          console.warn(`Linear legend missing colormap_name for layer ${layer.id}`);
        }
      } else if (l.legend.type === 'interval') {
        if (l.legend.intervals?.length) {
          try {
            const cmap = l.legend.intervals.map(interval => [
              [interval.min, interval.max],
              hexRgb(interval.color, { format: 'array' }),
            ]);
            extra = `&colormap=${JSON.stringify(cmap)}`;
          } catch (error) {
            console.error(`Failed to process interval colormap for layer ${layer.id}:`, error);
          }
        } else {
          console.warn(`Interval legend missing intervals for layer ${layer.id}`);
        }
      }
    } else if (bidx === BAND_TYPES.RGB) {
      search.append('bidx', '1');
      search.append('bidx', '2');
      search.append('bidx', '3');
    }

    // Add other titiler parameters
    Object.entries(other).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        search.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });

    tileUrl += `${search.toString()}${extra}`;

    return {
      type: LAYER_TYPES.RASTER,
      id: layer.id,
      tiles: [tileUrl],
      children: {
        id: layer.id,
        type: LAYER_TYPES.RASTER,
      },
    } as SourceProps;
  } catch (error) {
    console.error(`Failed to build raster layer ${layer.id}:`, error);
    throw error;
  }
}

/**
 * Creates a MapLibre match expression for conditional styling based on field values
 * @param field - The feature property field name to match against
 * @param values - Array of value objects containing the conditions and styles
 * @param defaultValue - Default value to use when no conditions match
 * @param extractor - Function to extract the [key, value] pair from each value object
 * @returns MapLibre match expression array
 */
function createMatchExpression<T extends VectorValue>(
  field: string,
  values: T[],
  defaultValue: string | number | number[],
  extractor: ValueExtractor<T>,
): unknown[] | string | number | number[] {
  if (!field || !values.length) {
    return defaultValue;
  }

  const expr: unknown[] = ['match', ['get', field]];

  // Add all condition-value pairs
  values.forEach(value => {
    const [condition, result] = extractor(value);
    expr.push(condition, result);
  });

  // Add default value
  expr.push(defaultValue);

  return expr;
}

/**
 * Creates MapLibre paint properties for fill layers based on vector legend configuration
 */
function vectorLegendFill(legend: VectorFillLegend) {
  if (legend.field && legend.values?.length) {
    const hasColor = legend.values.some(v => v.color !== undefined);
    const hasBorderColor = legend.values.some(v => v.borderColor !== undefined);
    const hasOpacity = legend.values.some(v => v.opacity !== undefined);

    return {
      paint: {
        'fill-color': hasColor
          ? createMatchExpression(
              legend.field,
              legend.values.filter(v => v.color !== undefined),
              legend.default?.color ?? '#000',
              (value: VectorFillValue) => [value.value, value.color],
            )
          : (legend.default?.color ?? '#000'),
        'fill-outline-color': hasBorderColor
          ? createMatchExpression(
              legend.field,
              legend.values.filter(v => v.borderColor !== undefined),
              legend.default?.borderColor ?? legend.default?.color ?? '#000',
              (value: VectorFillValue) => [value.value, value.borderColor!],
            )
          : (legend.default?.borderColor ?? legend.default?.color ?? '#000'),
        'fill-opacity': hasOpacity
          ? createMatchExpression(
              legend.field,
              legend.values.filter(v => v.opacity !== undefined),
              legend.default?.opacity ?? 1,
              (value: VectorFillValue) => [value.value, value.opacity!],
            )
          : (legend.default?.opacity ?? 1),
      },
      type: 'fill',
    };
  } else {
    return {
      paint: {
        'fill-color': legend.default?.color ?? '#000',
        'fill-outline-color': legend.default?.borderColor ?? legend.default?.color ?? '#000',
        'fill-opacity': legend.default?.opacity ?? 1,
      },
      type: 'fill',
    };
  }
}

/**
 * Creates MapLibre paint properties for line layers based on vector legend configuration
 */
function vectorLegendLine(legend: VectorLineLegend) {
  if (legend.field && legend.values?.length) {
    const hasColor = legend.values.some(v => v.color !== undefined);
    const hasOpacity = legend.values.some(v => v.opacity !== undefined);
    const hasWidth = legend.values.some(v => v.width !== undefined);
    const hasDasharray = legend.values.some(v => v.dasharray !== undefined);

    return {
      paint: {
        'line-color': hasColor
          ? createMatchExpression(
              legend.field,
              legend.values.filter(v => v.color !== undefined),
              legend.default?.color ?? '#000',
              (value: VectorLineValue) => [value.value, value.color],
            )
          : (legend.default?.color ?? '#000'),
        'line-opacity': hasOpacity
          ? createMatchExpression(
              legend.field,
              legend.values.filter(v => v.opacity !== undefined),
              legend.default?.opacity ?? 1,
              (value: VectorLineValue) => [value.value, value.opacity!],
            )
          : (legend.default?.opacity ?? 1),
        'line-width': hasWidth
          ? createMatchExpression(
              legend.field,
              legend.values.filter(v => v.width !== undefined),
              legend.default?.width ?? 1,
              (value: VectorLineValue) => [value.value, value.width!],
            )
          : (legend.default?.width ?? 1),
        'line-dasharray': hasDasharray
          ? createMatchExpression(
              legend.field,
              legend.values.filter(v => v.dasharray !== undefined),
              legend.default?.dasharray ?? [1, 0],
              (value: VectorLineValue) => [value.value, value.dasharray!],
            )
          : (legend.default?.dasharray ?? [1, 0]),
      },
      type: 'line',
    };
  } else {
    return {
      paint: {
        'line-color': legend.default?.color ?? '#000',
        'line-opacity': legend.default?.opacity ?? 1,
        'line-width': legend.default?.width ?? 1,
        'line-dasharray': legend.default?.dasharray ?? [1, 0],
      },
      type: 'line',
    };
  }
}

/**
 * Creates MapLibre paint properties for circle layers based on vector legend configuration
 */
function vectorLegendCircle(legend: VectorCircleLegend) {
  if (legend.field && legend.values?.length) {
    const hasColor = legend.values.some(v => v.color !== undefined);
    const hasOpacity = legend.values.some(v => v.opacity !== undefined);
    const hasRadius = legend.values.some(v => v.radius !== undefined);
    const hasStrokeColor = legend.values.some(v => v.strokeColor !== undefined);
    const hasStrokeWidth = legend.values.some(v => v.strokeWidth !== undefined);

    return {
      paint: {
        'circle-color': hasColor
          ? createMatchExpression(
              legend.field,
              legend.values.filter(v => v.color !== undefined),
              legend.default?.color ?? '#000',
              (value: VectorCircleValue) => [value.value, value.color],
            )
          : (legend.default?.color ?? '#000'),
        'circle-opacity': hasOpacity
          ? createMatchExpression(
              legend.field,
              legend.values.filter(v => v.opacity !== undefined),
              legend.default?.opacity ?? 1,
              (value: VectorCircleValue) => [value.value, value.opacity!],
            )
          : (legend.default?.opacity ?? 1),
        'circle-radius': hasRadius
          ? createMatchExpression(
              legend.field,
              legend.values.filter(v => v.radius !== undefined),
              legend.default?.radius ?? 5,
              (value: VectorCircleValue) => [value.value, value.radius!],
            )
          : (legend.default?.radius ?? 5),
        'circle-stroke-color': hasStrokeColor
          ? createMatchExpression(
              legend.field,
              legend.values.filter(v => v.strokeColor !== undefined),
              legend.default?.strokeColor ?? '#000',
              (value: VectorCircleValue) => [value.value, value.strokeColor!],
            )
          : (legend.default?.strokeColor ?? '#000'),
        'circle-stroke-width': hasStrokeWidth
          ? createMatchExpression(
              legend.field,
              legend.values.filter(v => v.strokeWidth !== undefined),
              legend.default?.strokeWidth ?? 0,
              (value: VectorCircleValue) => [value.value, value.strokeWidth!],
            )
          : (legend.default?.strokeWidth ?? 0),
      },
      type: 'circle',
    };
  } else {
    return {
      paint: {
        'circle-color': legend.default?.color ?? '#000',
        'circle-opacity': legend.default?.opacity ?? 1,
        'circle-radius': legend.default?.radius ?? 5,
        'circle-stroke-color': legend.default?.strokeColor ?? '#000',
        'circle-stroke-width': legend.default?.strokeWidth ?? 0,
      },
      type: 'circle',
    };
  }
}

/**
 * Layer type constants for better type safety
 */
const LAYER_TYPES = {
  FILL: 'fill',
  LINE: 'line',
  CIRCLE: 'circle',
  RASTER: 'raster',
} as const;

type LayerType = (typeof LAYER_TYPES)[keyof typeof LAYER_TYPES];

/**
 * Creates appropriate MapLibre paint properties based on layer type and legend configuration
 * @param type - The layer type (fill, line, circle)
 * @param legend - The legend configuration object
 * @returns Layer configuration with paint properties and type
 */
function vectorLegendToPaint(type: string, legend: VectorLegend | undefined) {
  if (!legend) {
    return createDefaultLayerStyle(type);
  }

  switch (type) {
    case LAYER_TYPES.FILL:
      return vectorLegendFill(legend as VectorFillLegend);
    case LAYER_TYPES.LINE:
      return vectorLegendLine(legend as VectorLineLegend);
    case LAYER_TYPES.CIRCLE:
      return vectorLegendCircle(legend as VectorCircleLegend);
    default:
      console.warn(`Unknown layer type: ${type}. Falling back to fill layer.`);
      return createDefaultLayerStyle(LAYER_TYPES.FILL);
  }
}

/**
 * Creates default layer style when no legend is provided
 */
function createDefaultLayerStyle(type: string) {
  const paintConfigs = {
    [LAYER_TYPES.LINE]: { 'line-color': '#000000', 'line-width': 1, 'line-opacity': 1 },
    [LAYER_TYPES.CIRCLE]: { 'circle-color': '#000000', 'circle-radius': 5, 'circle-opacity': 1 },
    [LAYER_TYPES.FILL]: { 'fill-color': '#000000', 'fill-opacity': 1 },
  };

  return {
    paint: paintConfigs[type as keyof typeof paintConfigs] || paintConfigs[LAYER_TYPES.FILL],
    type: type,
  };
}

/**
 * Builds a MapLibre vector layer configuration for PMTiles sources
 * @param layer - Layer configuration with PMTiles source
 * @returns MapLibre vector source configuration
 */
function buildPMTilesLayer(layer: LayerWithId): SourceProps {
  try {
    const l = layer.layer as PMTileSource;

    // Validate required parameters
    if (!l.pmtiles?.url) {
      throw new Error(`Missing required 'url' parameter for PMTiles layer ${layer.id}`);
    }

    if (!l.children) {
      throw new Error(`Missing 'children' configuration for PMTiles layer ${layer.id}`);
    }

    const { legend, type, ...children } = l.children;

    // Validate layer type
    if (!type || !Object.values(LAYER_TYPES).includes(type as LayerType)) {
      console.warn(`Invalid or missing layer type '${type}' for layer ${layer.id}. Using fill as default.`);
    }

    const layerStyle = vectorLegendToPaint(type, legend);

    const result = {
      type: 'vector' as const,
      id: layer.id,
      url: `pmtiles://${l.pmtiles.url}`,
      children: {
        ...layerStyle,
        ...children,
        id: layer.id,
      },
    };

    // Generate unique key for the layer
    result.children.key = `${layer.id}_${result.children.type}`;
    return result as SourceProps;
  } catch (error) {
    console.error(`Failed to build PMTiles layer ${layer.id}:`, error);
    throw error;
  }
}

/**
 * Builds a MapLibre raster layer configuration for standard raster sources
 * @param layer - Layer configuration with raster source
 * @returns MapLibre raster source configuration
 */
function buildStandardRasterLayer(layer: LayerWithId): SourceProps {
  try {
    const l = layer.layer as RasterSource;

    // Validate required parameters
    if (!l.tiles?.length) {
      throw new Error(`Missing required 'tiles' parameter for raster layer ${layer.id}`);
    }

    const result = {
      type: LAYER_TYPES.RASTER,
      id: layer.id,
      tiles: l.tiles,
      ...(l.tileSize && { tileSize: l.tileSize }),
      ...(l.minzoom !== undefined && { minzoom: l.minzoom }),
      ...(l.maxzoom !== undefined && { maxzoom: l.maxzoom }),
      ...(l.bounds && { bounds: l.bounds }),
      ...(l.attribution && { attribution: l.attribution }),
      children: {
        id: layer.id,
        type: LAYER_TYPES.RASTER,
      },
    } as SourceProps;

    return result;
  } catch (error) {
    console.error(`Failed to build raster layer ${layer.id}:`, error);
    throw error;
  }
}

/**
 * Builds a MapLibre raster layer configuration for WMTS (Web Map Tile Service) sources
 * @param layer - Layer configuration with WMTS source
 * @returns MapLibre raster source configuration
 */
function buildWMTSLayer(layer: LayerWithId): SourceProps {
  try {
    const l = layer.layer as WMTSSource;

    // Validate required parameters
    if (!l.url) {
      throw new Error(`Missing required 'url' parameter for WMTS layer ${layer.id}`);
    }

    // Validate URL contains required placeholders
    if (!/{z}.*{x}.*{y}|{x}.*{y}.*{z}|{y}.*{z}.*{x}/.test(l.url)) {
      throw new Error(`WMTS URL must contain {z}, {x}, and {y} placeholders. Got: ${l.url}`);
    }

    const result = {
      type: LAYER_TYPES.RASTER,
      id: layer.id,
      tiles: [l.url],
      ...(l.tileSize && { tileSize: l.tileSize }),
      ...(l.minzoom !== undefined && { minzoom: l.minzoom }),
      ...(l.maxzoom !== undefined && { maxzoom: l.maxzoom }),
      ...(l.bounds && { bounds: l.bounds }),
      ...(l.attribution && { attribution: l.attribution }),
      children: {
        id: layer.id,
        type: LAYER_TYPES.RASTER,
      },
    } as SourceProps;

    return result;
  } catch (error) {
    console.error(`Failed to build WMTS layer ${layer.id}:`, error);
    throw error;
  }
}

/**
 * Builds a MapLibre raster layer configuration for WMS (Web Map Service) sources
 * @param layer - Layer configuration with WMS source
 * @returns MapLibre raster source configuration
 */
function buildWMSLayer(layer: LayerWithId): SourceProps {
  try {
    const l = layer.layer as WMSSource;

    // Validate required parameters
    if (!l.url) {
      throw new Error(`Missing required 'url' parameter for WMS layer ${layer.id}`);
    }

    if (!l.wms.layers) {
      throw new Error(`Missing required 'layers' parameter for WMS layer ${layer.id}`);
    }

    // Construct WMS tile URL with bbox parameter
    // MapLibre will replace {bbox-epsg-3857} with the actual bounding box
    const wmsUrl = new URL(l.url);
    wmsUrl.searchParams.set('service', 'WMS');
    wmsUrl.searchParams.set('request', 'GetMap');
    wmsUrl.searchParams.set('version', l.wms.version);
    wmsUrl.searchParams.set('layers', l.wms.layers);
    wmsUrl.searchParams.set('styles', l.wms.styles ?? '');
    wmsUrl.searchParams.set('format', 'image/png');
    wmsUrl.searchParams.set('transparent', 'true');
    wmsUrl.searchParams.set('width', String(256));
    wmsUrl.searchParams.set('height', String(256));
    wmsUrl.searchParams.set('info_format', 'text/html');
    wmsUrl.searchParams.set('tiled', 'false');

    if (l.wms.version === '1.3.0') {
      wmsUrl.searchParams.set('crs', 'EPSG:3857');
    } else {
      wmsUrl.searchParams.set('srs', 'EPSG:3857');
    }

    // Add any additional WMS parameters
    if (l.wms.additionalParams) {
      Object.entries(l.wms.additionalParams).forEach(([key, value]) => {
        wmsUrl.searchParams.set(key, value);
      });
    }

    const result = {
      type: LAYER_TYPES.RASTER,
      id: layer.id,
      tiles: [`${wmsUrl.toString()}&bbox={bbox-epsg-3857}`],
      tileSize: 256,
      ...(l.minzoom !== undefined && { minzoom: l.minzoom }),
      ...(l.maxzoom !== undefined && { maxzoom: l.maxzoom }),
      ...(l.bounds && { bounds: l.bounds }),
      ...(l.attribution && { attribution: l.attribution }),
      children: {
        id: layer.id,
        type: LAYER_TYPES.RASTER,
      },
    } as SourceProps;

    return result;
  } catch (error) {
    console.error(`Failed to build WMS layer ${layer.id}:`, error);
    throw error;
  }
}

/**
 * Result of converting layers to MapLibre sources
 */
export interface ToMaplibreResult {
  sources: SourceProps[];
  errors: LayerErrorInput[];
}

/**
 * Converts a layer configuration to MapLibre source format
 * @param layer - The layer to convert
 * @param _index - Array index (unused)
 * @param _array - Full array (unused)
 * @param titiler_api_url - TiTiler API base URL
 * @returns MapLibre source configuration or null if unsupported
 */
function layerToSource(
  layer: LayerWithId,
  _index: number,
  _array: LayerWithId[],
  titiler_api_url: string,
): { source: SourceProps | null; error?: LayerErrorInput } {
  try {
    // Validate input
    if (!layer?.id) {
      console.warn('Layer missing required id property');
      return { source: null };
    }

    if (!layer.layer) {
      console.warn(`Layer ${layer.id} missing layer configuration`);
      return { source: null };
    }

    // Handle TiTiler raster sources
    if ('titiler' === layer.layer.type) {
      if (!titiler_api_url) {
        throw new Error(`TiTiler API URL required for raster layer ${layer.id}`);
      }
      return { source: buildRasterLayer(layer, titiler_api_url) };
    }

    // Handle PMTiles vector sources
    if ('pmtiles' === layer.layer.type) {
      return { source: buildPMTilesLayer(layer) };
    }

    // Handle standard raster sources
    if ('raster' === layer.layer.type) {
      return { source: buildStandardRasterLayer(layer) };
    }

    // Handle WMTS (Web Map Tile Service) sources
    if ('wmts' === layer.layer.type) {
      return { source: buildWMTSLayer(layer) };
    }

    // Handle WMS (Web Map Service) sources
    if ('wms' === layer.layer.type) {
      return { source: buildWMSLayer(layer) };
    }

    // Skip parquet layers - they are handled by DeckGL overlay
    if ('parquet' === layer.layer.type) {
      console.debug(`Skipping parquet layer ${layer.id} - handled by DeckGL overlay`);
      return { source: null };
    }

    // Log unsupported layer types for debugging
    console.warn(`Unsupported layer type for layer ${layer.id}:`, Object.keys(layer.layer));
    return { source: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to convert layer ${layer.id} to MapLibre source:`, error);
    return {
      source: null,
      error: { layerId: layer.id, layerName: layer.name, message },
    };
  }
}

/**
 * Converts an array of layer configurations to MapLibre source format
 * @param layers - Array of layer configurations to convert
 * @param titiler_api_url - Base URL for TiTiler API (required for raster layers)
 * @returns Object containing array of MapLibre source configurations and any errors
 */
export function toMaplibreSources(layers: LayerWithId[], titiler_api_url: string): ToMaplibreResult {
  if (!Array.isArray(layers)) {
    console.warn('toMaplibreSources: Expected array of layers, received:', typeof layers);
    return { sources: [], errors: [] };
  }

  if (!titiler_api_url) {
    console.warn('toMaplibreSources: TiTiler API URL not provided - raster layers will fail');
  }

  const results = layers.map((layer, index, array) => layerToSource(layer, index, array, titiler_api_url));

  const sources = results.map(r => r.source).filter((source): source is SourceProps => source !== null);

  const errors = results.map(r => r.error).filter((error): error is LayerErrorInput => error !== undefined);

  console.debug(`Converted ${sources.length}/${layers.length} layers to MapLibre sources`);
  return { sources, errors };
}
