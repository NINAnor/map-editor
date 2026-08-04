import { arrayMove } from '@dnd-kit/sortable';
import { nanoid } from 'nanoid';
import type { ViewState } from 'react-map-gl/maplibre';
import { toast } from 'react-toastify';
import { createSelector } from 'reselect';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { defaultConfigBase } from '../config';
import { toMaplibreSources } from '../libs/toMaplibre';
import type {
  BaseMapStyle,
  CreateFolder,
  CreateLayer,
  Folder,
  Layer,
  LayerWithId,
  MapConfig,
  MapMeta,
  MapSettings,
  Tree,
  UpdateFolder,
  UpdateLayer,
} from '../types';

interface AppActions {
  actions: {
    setTitle: (title: string) => void;
    setSubtitle: (subtitle: string) => void;
    setDescription: (description: string) => void;
    updateTreeItemChildren: (id: string, newChildren: string[]) => void;
    updateTreeItemFolder: (id: string, item: UpdateFolder) => void;
    removeTreeItemFolder: (id: string) => void;
    removeTreeItemLayer: (id: string) => void;
    updateTreeItemLayer: (id: string, item: UpdateLayer) => void;
    addTreeItemFolder: (item: CreateFolder) => void;
    addTreeItemLayer: (item: CreateLayer, load?: boolean) => void;
    toggleLayer: (id: string) => void;
    setExpandedItems: (expand: string[]) => void;
    moveToIndex: (source: string, target: string) => void;
    setBaseMap: (baseMapId: string) => void;
    updateMeta: (meta: MapMeta) => void;
    setSettings: (conf: MapSettings) => void;
  };
}

type AppState = MapConfig & AppActions;

export const useAppStore = create<AppState>()(
  devtools(
    immer(set => ({
      ...defaultConfigBase,
      actions: {
        updateMeta: meta =>
          set(state => {
            state.title = meta.title;
            state.subtitle = meta.subtitle;
            state.icon = meta.icon;
            state.description = meta.description;
          }),
        setTitle: (title: string) =>
          set(state => {
            state.title = title;
          }),
        setSettings: settings =>
          set(state => {
            state.config = settings;
          }),
        setExpandedItems: expandedItems =>
          set(state => {
            state.expandedItems = expandedItems;
          }),
        setSubtitle: (subtitle: string) =>
          set(state => {
            state.subtitle = subtitle;
          }),
        setDescription: (description: string) =>
          set(state => {
            state.description = description;
          }),
        updateTreeItemChildren: (id: string, newChildren: string[]) =>
          set(state => {
            if (state.items && state.items[id].type === 'folder') {
              state.items[id].children = newChildren;
            }
          }),
        updateTreeItemFolder: (id, item) =>
          set(state => {
            if (state.items) {
              state.items[id].name = item.name;
              state.items[id].description = item.description;
              state.items[id].download_url = item.download_url;
            }
          }),
        removeTreeItemFolder: id =>
          set(state => {
            if (state.items?.[id] && state.items[id].type === 'folder' && state.items[id].children.length === 0) {
              delete state.items[id];
              Object.keys(state.items).forEach(key => {
                if (state.items && state.items[key].type === 'folder') {
                  const idx = state.items[key].children.indexOf(id);
                  if (idx >= 0) {
                    state.items[key].children.splice(idx, 1);
                  }
                }
              });
            }
          }),
        removeTreeItemLayer: id =>
          set(state => {
            if (state.items?.[id] && state.items[id].type === 'layer') {
              delete state.items[id];
              Object.keys(state.items).forEach(key => {
                if (state.items && state.items[key].type === 'folder') {
                  const idx = state.items[key].children.indexOf(id);
                  if (idx >= 0) {
                    state.items[key].children.splice(idx, 1);
                  }
                }
              });
            }
          }),
        updateTreeItemLayer: (id, item) =>
          set(state => {
            if (state.items?.[id]?.type === 'layer') {
              state.items[id].name = item.name;
              state.items[id].description = item.description;
              state.items[id].layer = item.layer;
              state.items[id].download_url = item.download_url;
            }
          }),
        addTreeItemFolder: item =>
          set(state => {
            if (item.id && state.items?.[item.id]) {
              toast.error(`An item with the same id is already present`);
              return;
            }

            const id = item.id ?? nanoid();
            const parent = state.items ? state.items[item.parent] : null;
            if (state.items && parent?.type === 'folder') {
              state.items[id] = {
                name: item.name,
                type: 'folder',
                description: item.description,
                download_url: item.download_url,
                children: [],
              };
              parent.children.push(id);
              toast.success(`${item.name} added`);
            }
          }),
        moveToIndex: (source, target) =>
          set(state => {
            state.layerOrder = arrayMove(
              state.layerOrder,
              state.layerOrder.indexOf(source),
              state.layerOrder.indexOf(target),
            );
          }),
        addTreeItemLayer: (item, load = false) =>
          set(state => {
            const parent = state.items ? state.items[item.parent] : null;
            if (state.items && parent?.type === 'folder') {
              state.items[item.id] = {
                name: item.name,
                type: 'layer',
                description: item.description,
                layer: item.layer,
                download_url: item.download_url,
              };
              parent.children.push(item.id);
              if (load) {
                state.layerOrder.push(item.id);
              }
              toast.success(`${item.name} added`);
            }
          }),
        toggleLayer: (id: string) =>
          set(state => {
            if (state.layerOrder.includes(id)) {
              state.layerOrder = state.layerOrder.filter(lid => id !== lid);
            } else {
              if (state.config.exclusiveLayers) {
                state.layerOrder = [id];
              } else {
                state.layerOrder.push(id);
              }
            }
          }),
        setBaseMap: id =>
          set(state => {
            state.baseMap = id;
          }),
      },
    })),
  ),
);

export const useAppActions = () => useAppStore(state => state.actions);

const createAppSelector = createSelector.withTypes<AppState>();

const appMetaSelector = createAppSelector(
  state => state.title,
  state => state.subtitle,
  state => state.description,
  state => state.icon,
  (title: string, subtitle: string, description?: string, icon?: string) => {
    return {
      title,
      subtitle,
      icon,
      description: description ?? '',
    };
  },
);

const layerSelector = createAppSelector(
  state => state.layerOrder,
  state => state.items,
  (layerOrder: string[], items: Tree | null): LayerWithId[] => {
    if (!items) {
      return [];
    }

    return layerOrder.map(lid => ({
      id: lid,
      ...(items[lid] as Layer),
    }));
  },
);

const folderNameSelector = createAppSelector(
  state => state.items,
  (items: Tree | null) => {
    if (!items) {
      return [];
    }

    return Object.keys(items)
      .filter(id => items[id].type === 'folder')
      .map(id => ({
        value: id,
        label: items[id].name,
      }));
  },
);

const maplibreMapSelector = createAppSelector(
  state => state.viewState,
  layerSelector,
  state => state.config.titiler_api_url,
  state => state.layerOrder,
  (viewState: Partial<ViewState>, layers: LayerWithId[], titiler_api_url: string, layerOrder: string[]) => {
    const { sources, errors } = toMaplibreSources(layers, titiler_api_url);
    return {
      initialViewState: viewState,
      sources,
      errors,
      // TODO: only vector layers should be interactive
      interactiveLayerIds: layerOrder,
    };
  },
);

/**
 * Selector for extracting excludeFields configuration from all layers
 * Returns a map of layerId -> excludeFields array
 */
const layerExcludeFieldsSelector = createAppSelector(
  layerSelector,
  (layers: LayerWithId[]): Record<string, string[]> => {
    const result: Record<string, string[]> = {};
    for (const layer of layers) {
      const layerConfig = layer.layer;
      if (
        layerConfig &&
        'pmtiles' in layerConfig &&
        'children' in layerConfig &&
        layerConfig.children &&
        typeof layerConfig.children === 'object' &&
        'excludeFields' in layerConfig.children &&
        Array.isArray(layerConfig.children.excludeFields)
      ) {
        result[layer.id] = layerConfig.children.excludeFields as string[];
      }
    }
    return result;
  },
);

export const useLayers = () => useAppStore(layerSelector);
export const useMaplibreMapConf = () => useAppStore(maplibreMapSelector);
export const useLayerExcludeFields = () => useAppStore(layerExcludeFieldsSelector);
export const useFolderNames = () => useAppStore(folderNameSelector);
export const useItem = (id: string) => {
  return useAppStore(state => (state.items ? state.items[id] : null));
};

export const useLayer = (id: string): Layer | null => {
  return useAppStore(state => (state.items?.[id]?.type === 'layer' ? state.items[id] : null));
};

export const useFolder = (id: string): Folder | null => {
  return useAppStore(state => (state.items?.[id]?.type === 'folder' ? state.items[id] : null));
};

export const useExpandedItems = () => useAppStore(state => state.expandedItems);
export const useBaseMap = () => useAppStore(state => state.styles?.[state.baseMap] ?? '');

const baseMapStylesSelector = createAppSelector(
  state => state.baseMap,
  state => state.styles,
  (activeId, styles?: Record<string, string>) => {
    if (!styles) return [];
    return Object.keys(styles).map(id => ({
      style: styles[id],
      id,
      active: activeId === id,
    })) as BaseMapStyle[];
  },
);

export const useBaseMapStyles = () => useAppStore(baseMapStylesSelector);
export const useAppMeta = () => useAppStore(appMetaSelector);
