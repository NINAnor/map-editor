---
sidebar_label: Map Viewer
sidebar_position: 1
---

# Map Viewer

The map viewer is the primary user interface of NINA Maps. It renders an interactive MapLibre GL map and exposes a collapsible sidebar with tabs for layers, legend, basemap selection, and description.

## Navigation

| Interaction | Action |
|---|---|
| Left-click + drag | Pan the map |
| Scroll wheel | Zoom in / out |
| Right-click + drag | Rotate and pitch |
| Double-click | Zoom to point |
| Ctrl + scroll | Change pitch |

## Feature pop-ups

Clicking on an interactive layer (PMTiles vector layers) opens a pop-up showing the feature's properties. Set a layer item's `popup` to `false` to keep that layer out of popups while leaving it visible. Specific fields can be hidden per layer using the `excludeFields` configuration option.

## Sidebar tabs

The sidebar adapts its layout based on screen size. On mobile (below 700 px) it slides in as an overlay; on desktop it is displayed alongside the map.

| Tab | Content |
|---|---|
| **Layers** | Hierarchical layer tree with visibility toggles |
| **Legend** | Auto-generated legend for all visible layers |
| **Basemap** | Basemap selector showing available background styles |
| **Description** | MDX-rendered description of the current map or selected layer |

## URL routing

Each map is accessed at `/<mapId>`. All viewer state is kept in memory; the URL never changes while the user pans or changes layers. Sharing a link shares the map configuration as loaded, not the current viewport.


## Download configuration

A **Download Config** button in the viewer lets the user export the current map as a `config.json` file. This is useful for archiving a snapshot of the map or seeding the editor with an existing configuration.
