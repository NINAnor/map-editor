import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import {
  type ErrorEvent,
  FullscreenControl,
  GeolocateControl,
  Layer,
  type MapLayerMouseEvent,
  Map as MaplibreMap,
  NavigationControl,
  ScaleControl,
  Source,
} from 'react-map-gl/maplibre';
import { useAppStore, useBaseMap, useLayerExcludeFields, useLayers, useMaplibreMapConf } from '../hooks/app';
import { useErrorStore } from '../hooks/errors';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import MediaQuery from 'react-responsive';
import { toast } from 'react-toastify';
import DeckGLOverlay from './DeckGLOverlay';
import GeocoderControl from './GeocoderControl';
import { Popup, type PopupInfo } from './popup';
import SidebarWidget from './SidebarWidget';

export default function Map() {
  const basemap = useBaseMap();
  const { initialViewState, sources, errors, interactiveLayerIds } = useMaplibreMapConf();
  const layers = useLayers();
  const excludeFields = useLayerExcludeFields();
  const addError = useErrorStore(state => state.addError);
  const [popup, setInfoPopup] = useState<PopupInfo | null>(null);
  const popupRef = useRef(popup);
  popupRef.current = popup;

  const layerOrder = useAppStore(state => state.layerOrder);

  // Display layer conversion errors
  useEffect(() => {
    for (const error of errors) {
      addError(error);
    }
  }, [errors, addError]);

  // Remove features from hidden layers; close popup if none remain
  useEffect(() => {
    if (!popupRef.current) return;
    const visibleSet = new Set(layerOrder);
    const visibleFeatures = popupRef.current.features.filter(f => f.layer?.id && visibleSet.has(f.layer.id));
    if (visibleFeatures.length === 0) {
      setInfoPopup(null);
    } else if (visibleFeatures.length !== popupRef.current.features.length) {
      setInfoPopup({ ...popupRef.current, features: visibleFeatures });
    }
  }, [layerOrder]);

  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  }, []);

  const onClick = useCallback((event: MapLayerMouseEvent) => {
    const {
      features,
      lngLat: { lat, lng },
    } = event;

    if (features && features.length > 0) {
      setInfoPopup({ features, lat, lng, onClose: () => setInfoPopup(null) });
    } else {
      setInfoPopup(null);
    }
  }, []);

  const onMapError = useCallback((event: ErrorEvent) => {
    const message = event.error?.message ?? 'Unknown map error';
    toast.error(`Map error: ${message}`);
    console.error('MapLibre error event:', event);
  }, []);

  return (
    <MaplibreMap
      mapStyle={basemap}
      initialViewState={initialViewState}
      onClick={onClick}
      onError={onMapError}
      interactiveLayerIds={interactiveLayerIds}
    >
      <GeocoderControl position="top-left" />
      <NavigationControl position="top-right" />
      <GeolocateControl position="top-right" />
      <FullscreenControl position="top-right" />
      <MediaQuery maxWidth={700}>
        <SidebarWidget position="top-right" />
      </MediaQuery>
      <ScaleControl />
      {sources.map(({ id, children: { key, ...children }, ...props }) => (
        <Source key={id} {...props}>
          <Layer key={key as string} {...children} />
        </Source>
      ))}
      <DeckGLOverlay layers={layers} />
      {popup && <Popup {...popup} excludeFields={excludeFields} />}
    </MaplibreMap>
  );
}
