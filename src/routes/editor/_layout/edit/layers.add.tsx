import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { nanoid } from 'nanoid';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { CheckboxInput, MDXInput, SelectInput, SubmitButton, TextInput } from '@/components/form-items';
import { TREE_ROOT_ID } from '../../../../config';
import { useAppActions, useFolderNames } from '../../../../hooks/app';
import type {
  LayerConfig,
  ParquetSource,
  PMTileSource,
  RasterSource,
  TitilerSource,
  WMSSource,
  WMTSSource,
} from '../../../../schemas';

export const Route = createFileRoute('/editor/_layout/edit/layers/add')({
  component: RouteComponent,
});

// Extended schema for the add form with layer type selection
const AddLayerFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  popup: z.boolean(),
  parent: z.string(),
  download_url: z.string().optional(),
  layerType: z.enum(['pmtiles', 'titiler', 'raster', 'wmts', 'wms', 'parquet']),
});

type AddLayerForm = z.infer<typeof AddLayerFormSchema>;

const DEFAULT_FORM_DATA: AddLayerForm = {
  name: '',
  description: '',
  popup: true,
  parent: TREE_ROOT_ID,
  download_url: '',
  layerType: 'pmtiles',
};

function RouteComponent() {
  const { t } = useTranslation();
  const actions = useAppActions();
  const navigate = useNavigate();
  const folderNames = useFolderNames();

  const form = useForm({
    resolver: standardSchemaResolver(AddLayerFormSchema),
    defaultValues: DEFAULT_FORM_DATA,
  });

  const handleSubmit = form.handleSubmit(data => {
    const typedData = data as AddLayerForm;
    const id = nanoid();
    let layer: LayerConfig;

    if (typedData.layerType === 'pmtiles') {
      layer = {
        type: 'pmtiles',
        pmtiles: {
          url: '',
        },
        children: {
          type: 'fill',
          'source-layer': '',
        },
      } as PMTileSource;
    } else if (typedData.layerType === 'titiler') {
      layer = {
        type: 'titiler',
        titiler: {
          url: '',
          bidx: 'single',
        },
        legend: {
          type: 'linear',
          colormap_name: 'viridis',
          min: '0',
          max: '1',
        },
      } as TitilerSource;
    } else if (typedData.layerType === 'raster') {
      layer = {
        type: 'raster',
        tiles: [''],
        tileSize: 256,
        scheme: 'xyz',
      } as RasterSource;
    } else if (typedData.layerType === 'parquet') {
      layer = {
        type: 'parquet',
        parquet: {
          url: '',
          encoding: 'wkb',
          layerType: 'scatterplot',
        },
        style: {
          fillColor: '#0080ff',
          lineColor: '#004080',
          opacity: 0.8,
          lineWidth: 1,
          pointRadius: 5,
        },
      } as ParquetSource;
    } else if (typedData.layerType === 'wmts') {
      layer = {
        type: 'wmts',
        url: '',
        tileSize: 256,
      } as WMTSSource;
    } else if (typedData.layerType === 'wms') {
      layer = {
        type: 'wms',
        url: '',
        wms: {
          layers: '',
        },
      } as WMSSource;
    } else {
      throw new Error('Unsupported layer type');
    }

    actions.addTreeItemLayer({
      name: typedData.name,
      description: typedData.description,
      popup: typedData.popup ? undefined : false,
      alwaysActive: false,
      download_url: typedData.download_url,
      parent: typedData.parent,
      id,
      layer,
    });

    navigate({ to: '/editor/edit/layers/$layerId', params: { layerId: id } }).catch(console.error);
  });

  return (
    <>
      <Link to="/editor/edit">
        <FontAwesomeIcon icon={faArrowLeft} /> {t('back')}
      </Link>

      <form
        onSubmit={e => {
          void handleSubmit(e);
        }}
        className="mt-4 text-base-content bg-base-200 border-base-300 rounded-box border p-4"
      >
        <fieldset className="fieldset ">
          <legend className="fieldset-legend">{t('add-layer')}</legend>

          <TextInput form={form} name="name" label={t('name')} required />

          <MDXInput form={form} name="description" label={t('description')} />

          <SelectInput form={form} name="parent" label={t('parent-folder')} required>
            {folderNames.map(f => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </SelectInput>

          <SelectInput form={form} name="layerType" label={t('layer-type')} required>
            <option value="pmtiles">PMTiles</option>
            <option value="titiler">TiTiler (COG)</option>
            <option value="wmts">OGC WMTS</option>
            <option value="wms">OGC WMS</option>
            <option value="raster">Raster</option>
            <option value="parquet">Parquet (GeoParquet) - Experimental</option>
          </SelectInput>

          <CheckboxInput form={form} name="popup" label={t('show-in-popups', 'Show in popups')} />

          <TextInput form={form} name="download_url" label={t('download-url')} />

          <SubmitButton isSubmitting={form.formState.isSubmitting} className="mt-4">
            {t('create')}
          </SubmitButton>
        </fieldset>
      </form>
    </>
  );
}
