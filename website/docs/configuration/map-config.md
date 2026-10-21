---
sidebar_label: MapConfig
sidebar_position: 1
---

# MapConfig

`MapConfig` is the root object of every map configuration file. It combines map metadata, camera state, the layer tree, and application settings.

## TypeScript interface

```typescript
interface MapConfig {
  // Identity & display
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  icon?: string;

  // Camera
  baseMap: string;
  styles?: Record<string, string>;
  viewState: ViewState;

  // Layers
  layerOrder: string[];
  items: Tree | null;
  expandedItems: string[];

  // Application settings
  config: MapSettings;
}
```

## Fields

### `id` — `string` (required)

Unique identifier for the map. Must match the folder name under `public/maps/`.

```json
"id": "norway-habitats"
```

---

### `title` — `string` (required)

Human-readable title shown in the header and on the home page.

---

### `subtitle` — `string` (required)

Short subtitle shown below the title. May be an empty string.

---

### `description` — `string` (optional)

MDX-formatted long description rendered in the **Description** tab.

---

### `icon` — `string` (optional)

URL of an icon image displayed next to the map title.

---

### `baseMap` — `string` (required)

Key of the active basemap. Built-in values: `voyager`, `positron`, `dark_matter`, `voyager_nolabels`, `positron_nolabels`, `dark_matter_nolabels`. Custom keys from `styles` are also valid.

---

### `styles` — `Record<string, string>` (optional)

Additional basemap style URLs keyed by an arbitrary identifier.

```json
"styles": {
  "satellite": "https://tiles.example.com/satellite/style.json"
}
```

---

### `viewState` — `ViewState` (required)

Initial camera position. All fields are optional; omitted fields fall back to MapLibre defaults.

```typescript
interface ViewState {
  longitude?: number;
  latitude?: number;
  zoom?: number;
  bearing?: number;   // rotation in degrees (0 = north)
  pitch?: number;     // tilt in degrees (0 = top-down)
  padding?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}
```

```json
"viewState": {
  "longitude": 10.74,
  "latitude": 59.91,
  "zoom": 6,
  "bearing": 0,
  "pitch": 0
}
```

---

### `layerOrder` — `string[]` (required)

Ordered list of layer IDs to render. Only IDs present in this array are drawn on the map; the order determines the draw order (last = on top). Layers can exist in `items` without being in `layerOrder` (hidden by default).

```json
"layerOrder": ["forest-cover", "wetlands", "buildings"]
```

---

### `items` — `Tree | null` (required)

The complete folder/layer hierarchy. See [Layer Types](./layer-types) for the `Tree` structure. Set to `null` for an empty map.

---

### `expandedItems` — `string[]` (required)

List of folder IDs that should be expanded by default in the layer tree sidebar.

```json
"expandedItems": ["root", "folder-habitats"]
```

---

### `config` — `MapSettings` (required)

Application-level settings. See below.

---

## MapSettings

```typescript
interface MapSettings {
  titiler_api_url: string;
  theme: string;
  language: string;
  footer?: Footer;
  menuOrientation?: "horizontal" | "vertical";
  exclusiveLayers?: boolean;
  popupLayout?: "tabs" | "stacked";
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `titiler_api_url` | `string` | ✓ | Base URL of the TiTiler API used for COG and WMS proxying. Use `/titiler` when running the Docker stack. |
| `theme` | `string` | ✓ | DaisyUI theme name (e.g. `light`, `dark`, `nina`). |
| `language` | `string` | ✓ | UI language code: `en` or `no`. |
| `footer` | `Footer` | — | Optional footer configuration. |
| `menuOrientation` | `"horizontal" \| "vertical"` | — | Controls sidebar menu layout. Defaults to `vertical`. |
| `exclusiveLayers` | `boolean` | — | When `true`, activating a layer deactivates all others. |
| `popupLayout` | `"tabs" \| "stacked"` | — | How the info popup presents multiple features. `tabs` gives each feature its own tab; `stacked` lists every feature one after the other. Defaults to `tabs`. |

### Footer

```typescript
interface Footer {
  items: string[];          // MDX strings rendered as footer links/text
  justify?: "justify-center-safe" | "justify-start" | "justify-end-safe"
           | "justify-between" | "justify-normal" | "justify-stretch";
  align?: "items-center" | "items-start" | "items-end" | "items-baseline";
}
```

```json
"footer": {
  "items": ["© 2024 NINA", "[nina.no](https://www.nina.no)"],
  "justify": "justify-between",
  "align": "items-center"
}
```
