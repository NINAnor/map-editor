---
sidebar_label: Layer Types
sidebar_position: 2
---

# Layer Types

The `items` field of `MapConfig` holds a flat `Tree` object (a `Record<string, Folder | Layer>`). Every value is either a **Folder** or a **Layer**. Folders organise layers hierarchically; layers reference a data source.

## Tree structure

```typescript
type Tree = Record<string, Folder | Layer>;
```

The tree must contain a `"root"` folder as the top-level entry point. All other IDs are arbitrary strings that uniquely identify each item.

```json
"items": {
  "root": {
    "type": "folder",
    "name": "Layers",
    "children": ["habitats-folder", "buildings-layer"]
  },
  "habitats-folder": {
    "type": "folder",
    "name": "Habitats",
    "children": ["forests-layer", "wetlands-layer"]
  },
  "forests-layer": {
    "type": "layer",
    "name": "Forest cover",
    "layer": { ... }
  }
}
```

---

## Folder

```typescript
interface Folder {
  type: "folder";
  name: string;
  description?: string;
  children: string[];       // ordered list of child IDs
  download_url?: string;
}
```

| Field | Required | Description |
|---|---|---|
| `type` | ✓ | Must be `"folder"` |
| `name` | ✓ | Display name in the layer tree |
| `description` | — | MDX-formatted description shown in the Description tab |
| `children` | ✓ | Ordered array of child layer/folder IDs |
| `download_url` | — | URL shown as a download link next to the folder |

---

## Layer

```typescript
interface Layer {
  type: "layer";
  name: string;
  description?: string;
  popup?: boolean;
  layer: LayerConfig;
  download_url?: string;
}
```

| Field | Required | Description |
|---|---|---|
| `type` | ✓ | Must be `"layer"` |
| `name` | ✓ | Display name in the layer tree |
| `description` | — | MDX-formatted description |
| `popup` | — | Whether features from this layer appear in info popups. Defaults to `true`; set to `false` to disable. |
| `layer` | ✓ | Layer source configuration — one of the types below |
| `download_url` | — | URL shown as a download link next to the layer |

---

## PMTiles — `type: "pmtiles"`

Cloud-optimized vector tiles served from a PMTiles archive. Rendered by MapLibre GL as a vector tile source.

```typescript
interface PMTileSource {
  type: "pmtiles";
  pmtiles: {
    url: string;           // URL to the .pmtiles file
  };
  children: PMTileFillChild | PMTileLineChild | PMTileCircleChild;
}
```

### Fill child

```typescript
interface PMTileFillChild {
  type: "fill";
  "source-layer": string;         // vector tile layer name inside the archive
  legend?: VectorFillLegend;
  excludeFields?: string[];       // fields to hide in the feature pop-up
}
```

### Line child

```typescript
interface PMTileLineChild {
  type: "line";
  "source-layer": string;
  legend?: VectorLineLegend;
  excludeFields?: string[];
}
```

### Circle child

```typescript
interface PMTileCircleChild {
  type: "circle";
  "source-layer": string;
  legend?: VectorCircleLegend;
  excludeFields?: string[];
}
```

### Example

```json
{
  "type": "pmtiles",
  "pmtiles": {
    "url": "https://example.com/data/forests.pmtiles"
  },
  "children": {
    "type": "fill",
    "source-layer": "forests",
    "legend": {
      "field": "forest_type",
      "values": [
        { "value": "boreal",    "color": "#1a6b2f", "opacity": 0.8, "description": "Boreal forest" },
        { "value": "temperate", "color": "#4caf50", "opacity": 0.8, "description": "Temperate forest" }
      ],
      "default": { "color": "#aaaaaa", "opacity": 0.5, "description": "Other" }
    },
    "excludeFields": ["internal_id", "created_at"]
  }
}
```

---

## Titiler (COG) — `type: "titiler"`

Cloud-Optimized GeoTIFF rendered through the TiTiler API. TiTiler converts the COG into XYZ raster tiles on the fly.

```typescript
interface TitilerSource {
  type: "titiler";
  titiler: {
    url: string;                  // URL to the .tif / .tiff file
    bidx: "single" | "rgb";       // band selection mode
    rescale?: string[];           // e.g. ["0,255"] or ["0,100", "0,200", "0,150"] for RGB
  };
  legend?: RasterLegend;
}
```

| Field | Required | Description |
|---|---|---|
| `url` | ✓ | Direct URL to the COG file |
| `bidx` | ✓ | `"single"` for single-band (+ colormap), `"rgb"` for three bands |
| `rescale` | — | Per-band `"min,max"` rescale values. One entry for single band, three for RGB. |

### Example — single band with colormap

```json
{
  "type": "titiler",
  "titiler": {
    "url": "https://github.com/GeoTIFF/test-data/raw/main/files/gfw-azores.tif",
    "bidx": "single",
    "rescale": ["0,573"]
  },
  "legend": {
    "type": "linear",
    "colormap_name": "ylorbr_r",
    "min": "0",
    "max": "573"
  }
}
```

---

## Raster Tiles — `type: "raster"`

Standard XYZ raster tile server. Works with any provider that serves tiles at `{z}/{x}/{y}` URLs.

```typescript
interface RasterSource {
  type: "raster";
  tiles: string[];              // one or more tile URL templates
  tileSize?: number;            // default 256
  minzoom?: number;
  maxzoom?: number;
  bounds?: [number, number, number, number];  // [west, south, east, north]
  attribution?: string;
  legend?: RasterLegend;
}
```

### Example

```json
{
  "type": "raster",
  "tiles": ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
  "tileSize": 256,
  "attribution": "© OpenStreetMap contributors",
  "legend": {
    "type": "image",
    "url": "https://example.com/legend.png"
  }
}
```

---

## WMTS — `type: "wmts"`

Web Map Tile Service accessed via an XYZ-style URL template.

```typescript
interface WMTSSource {
  type: "wmts";
  url: string;                  // must contain {z}, {x}, {y} placeholders
  tileSize?: number;
  minzoom?: number;
  maxzoom?: number;
  bounds?: [number, number, number, number];
  attribution?: string;
  legend?: RasterImageLegend;   // only "image" legend type is supported
}
```

The URL **must** contain `{z}`, `{x}`, and `{y}` in that order, e.g.:

```
https://cache.kartverket.no/topo/v1/wmts/1.0.0/topo/default/utm33/{z}/{y}/{x}.png
```

---

## WMS — `type: "wms"`

Web Map Service (OGC WMS). Requests are proxied through TiTiler, which converts them to XYZ raster tiles.

```typescript
interface WMSSource {
  type: "wms";
  url: string;                  // WMS endpoint URL
  wms: {
    layers: string;             // WMS layer names (comma-separated)
    styles?: string;            // WMS styles (comma-separated)
    version?: "1.1.1" | "1.3.0";  // default "1.3.0"
    additionalParams?: Record<string, string>;
  };
  tileSize?: number;            // default 256
  minzoom?: number;
  maxzoom?: number;
  bounds?: [number, number, number, number];
  attribution?: string;
  legend?: RasterImageLegend;   // only "image" legend type is supported
}
```

### Example

```json
{
  "type": "wms",
  "url": "https://wms.geonorge.no/skwms1/wms.nib",
  "wms": {
    "layers": "ortofoto",
    "version": "1.3.0"
  },
  "legend": {
    "type": "image",
    "url": "https://wms.geonorge.no/skwms1/wms.nib?SERVICE=WMS&REQUEST=GetLegendGraphic&LAYER=ortofoto"
  }
}
```

---

## Parquet (GeoArrow) — `type: "parquet"`

Apache Parquet files with embedded geometry, rendered using [DeckGL](https://deck.gl/) with GeoArrow support. The file must be CORS-accessible.

```typescript
interface ParquetSource {
  type: "parquet";
  parquet: {
    url: string;
    encoding?: "wkb" | "geoarrow";       // default "wkb"
    layerType?: "scatterplot" | "polygon" | "solidPolygon" | "path";
  };
  style?: {
    fillColor?: string;   // hex color
    lineColor?: string;   // hex color
    opacity?: number;     // 0–1
    lineWidth?: number;
    pointRadius?: number;
  };
}
```

| `layerType` | Geometry | DeckGL layer |
|---|---|---|
| `scatterplot` | Points | `GeoArrowScatterplotLayer` |
| `polygon` | Polygons (outline) | `GeoArrowPolygonLayer` |
| `solidPolygon` | Polygons (filled) | `GeoArrowSolidPolygonLayer` |
| `path` | Lines | `GeoArrowPathLayer` |

### Example

```json
{
  "type": "parquet",
  "parquet": {
    "url": "https://example.com/data/species.parquet",
    "encoding": "geoarrow",
    "layerType": "scatterplot"
  },
  "style": {
    "fillColor": "#0080ff",
    "opacity": 0.7,
    "pointRadius": 6
  }
}
```
