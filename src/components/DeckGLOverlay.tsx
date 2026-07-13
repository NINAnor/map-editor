import { MapboxOverlay, type MapboxOverlayProps } from '@deck.gl/mapbox';
import { useCallback, useMemo } from 'react';
import { useControl } from 'react-map-gl/maplibre';
import { toast } from 'react-toastify';
import { createDeckGLParquetLayers } from '../libs/toDeckGL';
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
  const deckLayers = useMemo(() => createDeckGLParquetLayers(layers), [layers]);

  const handleError = useCallback((error: Error) => {
    toast.error(`Layer rendering error: ${error.message}`);
    console.error('DeckGL layer error:', error);
  }, []);

  if (!deckLayers || deckLayers.length === 0) {
    return null;
  }
  return <DeckGLOverlayImpl layers={deckLayers} interleaved onError={handleError} />;
}
