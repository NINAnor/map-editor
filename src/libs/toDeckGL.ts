import type { Layer } from '@deck.gl/core';
import {
  GeoArrowPathLayer,
  GeoArrowPolygonLayer,
  GeoArrowScatterplotLayer,
  GeoArrowSolidPolygonLayer,
} from '@geoarrow/deck.gl-layers';
import { readGeoParquet } from '@geoarrow/geoparquet-wasm';
import { tableFromIPC } from 'apache-arrow';
import wasmInit, { readParquet } from 'parquet-wasm';
import { toast } from 'react-toastify';
import type { LayerWithId, ParquetSource } from '../types';

/**
 * Converts a hex color string to RGB array
 * @param hex - Hex color string (e.g., '#ff0000')
 * @returns RGB array [r, g, b, a] with values 0-255
 */
function hexToRgb(hex: string | undefined, opacity: number = 1): [number, number, number, number] {
  if (!hex) return [0, 128, 255, Math.round(opacity * 255)]; // Default blue

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 128, 255, Math.round(opacity * 255)];

  return [
    Number.parseInt(result[1], 16),
    Number.parseInt(result[2], 16),
    Number.parseInt(result[3], 16),
    Math.round(opacity * 255),
  ];
}

/**
 * Loads a GeoParquet file from URL and converts to Arrow JS Table
 * @param url - URL to the GeoParquet file
 * @param encoding - Geometry encoding format ('wkb' or 'geoarrow')
 * @returns Promise resolving to Arrow JS Table
 */
async function loadGeoParquet(url: string, encoding: 'wkb' | 'geoarrow' = 'wkb') {
  try {
    // Fetch the parquet file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch parquet file: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    if (encoding === 'wkb') {
      // Use WKB encoding (most common for GeoParquet 1.0)
      const wasmTable = readGeoParquet(uint8Array);
      const ipcStream = wasmTable.intoIPCStream();
      const jsTable = tableFromIPC(ipcStream);
      console.debug(`Loaded GeoParquet with WKB encoding from ${url}`);
      return jsTable;
    } else {
      await wasmInit();
      // Use native GeoArrow encoding
      const wasmTable = readParquet(uint8Array);
      const ipcStream = wasmTable.intoIPCStream();
      const jsTable = tableFromIPC(ipcStream);
      console.debug(`Loaded GeoParquet with native GeoArrow encoding from ${url}`);
      console.log(jsTable.schema.toString());
      return jsTable;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    toast.error(`Failed to load parquet layer from ${url}: ${message}`);
    console.error(`Error loading GeoParquet from ${url} with ${encoding} encoding:`, error);
    throw error;
  }
}

/**
 * Converts parquet layers to DeckGL layers
 * @param layers - Array of layer configurations
 * @returns Array of DeckGL layers
 */
export function createDeckGLParquetLayers(layers: LayerWithId[]): Layer[] {
  const parquetLayers = layers.filter(layer => layer.layer?.type === 'parquet');

  return parquetLayers.map(layer => {
    const parquetSource = layer.layer as ParquetSource;
    const style = parquetSource.style || {};
    const encoding = parquetSource.parquet.encoding || 'wkb';
    const layerType = parquetSource.parquet.layerType || 'scatterplot';

    const fillColor = hexToRgb(style.fillColor, style.opacity ?? 0.8);
    const lineColor = hexToRgb(style.lineColor, 1);

    const commonProps = {
      id: `parquet-${layer.id}`,
      data: loadGeoParquet(parquetSource.parquet.url, encoding),
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 0, 100],
    };

    switch (layerType) {
      case 'polygon':
        // @ts-expect-error - GeoArrow layers accept Promise<Table>, type definition is incomplete
        return new GeoArrowPolygonLayer({
          ...commonProps,
          getLineColor: lineColor,
          getLineWidth: style.lineWidth ?? 1,
          lineWidthUnits: 'pixels',
          stroked: true,
        });

      case 'solidPolygon':
        // @ts-expect-error - GeoArrow layers accept Promise<Table>, type definition is incomplete
        return new GeoArrowSolidPolygonLayer({
          ...commonProps,
          getFillColor: fillColor,
          getLineColor: lineColor,
          getLineWidth: style.lineWidth ?? 1,
          lineWidthUnits: 'pixels',
          filled: true,
          stroked: true,
        });

      case 'path':
        // @ts-expect-error - GeoArrow layers accept Promise<Table>, type definition is incomplete
        return new GeoArrowPathLayer({
          ...commonProps,
          getColor: lineColor,
          getWidth: style.lineWidth ?? 1,
          widthUnits: 'pixels',
        });

      default:
        // @ts-expect-error - GeoArrow layers accept Promise<Table>, type definition is incomplete
        return new GeoArrowScatterplotLayer({
          ...commonProps,
          getFillColor: fillColor,
          getLineColor: lineColor,
          getRadius: style.pointRadius ?? 5,
          radiusUnits: 'pixels',
          lineWidthUnits: 'pixels',
          getLineWidth: style.lineWidth ?? 1,
          filled: true,
          stroked: true,
        });
    }
  });
}
