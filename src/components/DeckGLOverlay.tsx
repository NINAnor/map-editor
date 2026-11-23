import type { Layer } from '@deck.gl/core';
import { MapboxOverlay, type MapboxOverlayProps } from '@deck.gl/mapbox';
import { useCallback, useEffect, useState } from 'react';
import { useControl } from 'react-map-gl/maplibre';
import { toast } from 'react-toastify';
import type { LayerWithId } from '../types';

interface DeckGLOverlayProps {
  layers: LayerWithId[];
}

function DeckGLOverlayImpl(props: MapboxOverlayProps & { interleaved?: boolean }) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

export default function DeckGLOverlay({ layers }: DeckGLOverlayProps) {
  const [deckLayers, setDeckLayers] = useState<Layer[]>([]);
  const hasParquetLayers = layers.some(layer => layer.layer?.type === 'parquet');

  useEffect(() => {
    let cancelled = false;
    const parquetLayers = layers.filter(layer => layer.layer?.type === 'parquet');

    if (parquetLayers.length === 0) {
      setDeckLayers([]);
      return;
    }

    import('../libs/toDeckGL')
      .then(({ createDeckGLParquetLayers }) => {
        if (!cancelled) {
          setDeckLayers(createDeckGLParquetLayers(parquetLayers));
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : String(error);
        toast.error(`Failed to load Parquet support: ${message}`);
        console.error('Failed to load Parquet support:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [layers]);

  const handleError = useCallback((error: Error) => {
    toast.error(`Layer rendering error: ${error.message}`);
    console.error('DeckGL layer error:', error);
  }, []);

  if (!hasParquetLayers || deckLayers.length === 0) {
    return null;
  }
  return <DeckGLOverlayImpl layers={deckLayers} interleaved onError={handleError} />;
}
