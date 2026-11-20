import { faArrowLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CheckboxInput, MDXInput, SubmitButton, TextInput } from '@/components/form-items';
import {
  ParquetFields,
  PMTilesFields,
  RasterFields,
  TitilerFields,
  WMSFields,
  WMTSFields,
} from '../../../../components/layer-fields';
import { useAppActions, useAppStore, useLayer } from '../../../../hooks/app';
import {
  type LayerConfig,
  type ParquetSource,
  type PMTileSource,
  type RasterSource,
  type TitilerSource,
  UpdateLayerSchema,
  type WMSSource,
  type WMTSSource,
} from '../../../../schemas';

export const Route = createFileRoute('/editor/_layout/edit/layers/$layerId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const actions = useAppActions();
  const navigate = useNavigate();

  const { layerId } = Route.useParams();
  const layer = useLayer(layerId);
  const exclusiveLayers = useAppStore(state => state.config.exclusiveLayers);

  const form = useForm({
    resolver: standardSchemaResolver(UpdateLayerSchema),
    values: layer
      ? {
          name: layer.name,
          description: layer.description,
          popup: layer.popup !== false,
          alwaysActive: layer.alwaysActive,
          layer: layer.layer,
          download_url: layer.download_url,
        }
      : undefined,
  });

  const watchedLayer = useWatch({ control: form.control, name: 'layer' });
  const layerType =
    watchedLayer && typeof watchedLayer === 'object' && 'type' in watchedLayer ? String(watchedLayer.type) : null;

  const handleSubmit = form.handleSubmit(data => {
    const typedData = data as {
      name: string;
      description?: string;
      popup: boolean;
      alwaysActive: boolean;
      layer: LayerConfig;
      download_url?: string;
    };
    actions.updateTreeItemLayer(layerId, { ...typedData, popup: typedData.popup ? undefined : false });
    navigate({ to: '/editor/edit' }).catch(console.error);
  });

  const handleDelete = useCallback(() => {
    actions.removeTreeItemLayer(layerId);
    navigate({ to: '/editor/edit' }).catch(console.error);
  }, [layerId, actions, navigate]);

  // Handle layer type change
  const handleLayerTypeChange = (newType: string) => {
    if (newType === 'pmtiles') {
      form.setValue('layer', {
        type: 'pmtiles',
        pmtiles: { url: '' },
        children: { type: 'fill', 'source-layer': '' },
      } as PMTileSource);
    } else if (newType === 'titiler') {
      form.setValue('layer', {
        type: 'titiler',
        titiler: { url: '', bidx: 'single' },
        legend: { type: 'linear', colormap_name: 'viridis', min: '0', max: '1' },
      } as TitilerSource);
    } else if (newType === 'raster') {
      form.setValue('layer', {
        type: 'raster',
        tiles: [''],
        tileSize: 256,
        scheme: 'xyz',
      } as RasterSource);
    } else if (newType === 'wmts') {
      form.setValue('layer', {
        type: 'wmts',
        url: '',
        tileSize: 256,
      } as WMTSSource);
    } else if (newType === 'wms') {
      form.setValue('layer', {
        type: 'wms',
        url: '',
        wms: {
          layers: '',
        },
      } as WMSSource);
    } else if (newType === 'parquet') {
      form.setValue('layer', {
        type: 'parquet',
        parquet: { url: '', encoding: 'wkb', layerType: 'scatterplot' },
        style: {
          fillColor: '#0080ff',
          lineColor: '#004080',
          opacity: 0.8,
          lineWidth: 1,
          pointRadius: 5,
        },
      } as ParquetSource);
    }
  };

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
        <fieldset className="fieldset">
          <legend className="fieldset-legend">{t('edit-layer')}</legend>

          <TextInput form={form} name="name" label={t('name')} required />

          <MDXInput form={form} name="description" label={t('description')} />

          <TextInput form={form} name="download_url" label={t('download-url')} />

          <CheckboxInput
            form={form}
            name="alwaysActive"
            label={t('always-active')}
            disabled={exclusiveLayers}
            description={
              exclusiveLayers ? t('always-active-disabled-exclusive-layers') : t('always-active-description')
            }
          />

          <div className="divider">{t('layer-configuration', 'Layer Configuration')}</div>

          <div className="mb-4">
            <label className="label">
              <span className="label-text">{t('layer-type')}</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={layerType ?? ''}
              onChange={e => handleLayerTypeChange(e.target.value)}
            >
              <option value="pmtiles">PMTiles</option>
              <option value="titiler">Titiler (COG)</option>
              <option value="wmts">OGC WMTS</option>
              <option value="wms">OGC WMS</option>
              <option value="raster">Raster</option>
              <option value="parquet">Parquet (GeoParquet) - Experimental</option>
            </select>
          </div>

          {layerType === 'pmtiles' && <PMTilesFields form={form} />}
          {layerType === 'titiler' && <TitilerFields form={form} />}
          {layerType === 'raster' && <RasterFields form={form} />}
          {layerType === 'wmts' && <WMTSFields form={form} />}
          {layerType === 'wms' && <WMSFields form={form} />}
          {layerType === 'parquet' && <ParquetFields form={form} />}

          <SubmitButton isSubmitting={form.formState.isSubmitting} className="mt-4">
            {t('save')}
          </SubmitButton>
        </fieldset>
      </form>

      <div className="mt-3 flex">
        <button type="button" className="btn btn-error" onClick={handleDelete}>
          <FontAwesomeIcon icon={faTrash} /> {t('delete')}
        </button>
      </div>
    </>
  );
}
