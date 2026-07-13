import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';
import BASEMAP from './libs/basemaps';
import { type MapConfig, MapConfigSchema, type StoreConfig, StoreConfigSchema } from './types';

export const TABS = [
  {
    id: '',
    label: 'layers',
  },
  {
    id: 'description',
    label: 'description',
  },
  {
    id: 'manage',
    label: 'active-layers',
  },
  {
    id: 'legend',
    label: 'legend',
  },
  {
    id: 'basemap',
    label: 'basemap',
  },
];

export const EDIT_TABS = [
  {
    id: '/editor/edit',
    label: 'layers',
  },
  {
    id: '/editor/edit/description',
    label: 'description',
  },
  {
    id: '/editor/edit/manage',
    label: 'active-layers',
  },
  {
    id: '/editor/edit/basemap',
    label: 'basemap',
  },
  {
    id: '/editor/edit/settings',
    label: 'settings',
  },
];

export const TREE_ROOT_ID = 'root';

export const fetchConfig = async (url: string) => {
  const response = await axios.get<MapConfig>(url);
  if (
    response.headers['content-type'] !== 'application/json' &&
    response.headers['content-type'] !== 'text/plain; charset=utf-8'
  ) {
    throw Error('Unexpected response');
  }

  // Validate the response data with Zod
  const result = MapConfigSchema.safeParse(response.data);
  if (!result.success) {
    throw result.error;
  }

  return {
    ...response,
    data: result.data,
  };
};

export const mapConfigQueryOptions = (url: string) =>
  queryOptions({
    queryKey: ['map-config', url],
    queryFn: () => fetchConfig(url),
  });

export const fetchStoreConfig = async (url: string) => {
  const response = await axios.get<StoreConfig>(url);
  if (
    response.headers['content-type'] !== 'application/json' &&
    response.headers['content-type'] !== 'text/plain; charset=utf-8'
  ) {
    throw Error('Unexpected response');
  }

  // Validate the response data with Zod
  const result = StoreConfigSchema.safeParse(response.data);
  if (!result.success) {
    throw result.error;
  }

  return {
    ...response,
    data: result.data,
  };
};

export const storeConfigQueryOptions = (url: string) =>
  queryOptions({
    queryKey: ['map-store', url],
    queryFn: () => fetchStoreConfig(url),
  });

export const THEMES = [
  'nina',
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
  'caramellatte',
  'abyss',
  'silk',
];

export const LANGUAGES = [
  {
    value: 'en',
    label: 'English',
  },
  {
    value: 'no',
    label: 'Norsk',
  },
];

export const DEFAULT_THEME = THEMES[0];
export const DEFAULT_LANG = LANGUAGES[0].value;
export const DEFAULT_STORE_CONFIG = '/maps';

export const editorSearchSchema = (search: Record<string, unknown>): { config?: string } => ({
  config: search.config as string | undefined,
});

export const defaultConfigBase = {
  id: '',
  title: '',
  subtitle: '',
  description: '',
  expandedItems: [],
  styles: {
    positron: BASEMAP.POSITRON,
    voyager: BASEMAP.VOYAGER,
    darkMatter: BASEMAP.DARK_MATTER,
    toporaster: '/basemaps/toporaster.json',
  },
  items: null,
  layerOrder: [],
  baseMap: BASEMAP.POSITRON,
  viewState: {
    longitude: 10,
    latitude: 63,
    zoom: 4,
  },
  config: {
    titiler_api_url: '',
    theme: DEFAULT_THEME,
    language: DEFAULT_LANG,
  },
};
