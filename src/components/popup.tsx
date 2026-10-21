import classNames from 'classnames';
import type { MapGeoJSONFeature } from 'maplibre-gl';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Popup as MaplibrePopup } from 'react-map-gl/maplibre';

export type PopupLayout = 'tabs' | 'stacked';

export interface PopupInfo {
  lat: number;
  lng: number;
  features: MapGeoJSONFeature[];
  onClose: () => void;
  excludeFields?: Record<string, string[]>;
  layout?: PopupLayout;
  layerNames?: Record<string, string>;
}

function Feature({ feature, excludeFields }: { feature: Partial<MapGeoJSONFeature>; excludeFields?: string[] }) {
  const { t } = useTranslation();
  const excludeSet = new Set(excludeFields ?? []);

  const filteredProperties = Object.entries(feature.properties ?? {}).filter(([k]) => !excludeSet.has(k));

  return (
    <div className="min-w-0 border border-base-300">
      <table className="table table-xs table-pin-rows table-zebra w-full table-fixed">
        <thead className="bg-primary/5">
          <tr>
            <th className="w-2/5 text-xs font-semibold uppercase tracking-wide text-primary">{t('field')}</th>
            <th className="text-xs font-semibold uppercase tracking-wide text-primary">{t('value')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredProperties.map(([k, v]) => (
            <tr key={k} className="hover:bg-accent/10">
              <td className="break-words font-medium text-primary/80">{k}</td>
              <td className="break-words">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Builds a label for every feature, using the layer name when available.
 * Duplicate labels get an index suffix so each tab/heading stays distinguishable.
 */
function buildFeatureLabels(features: MapGeoJSONFeature[], layerNames?: Record<string, string>): string[] {
  const baseLabels = features.map((feature, index) => {
    const layerId = feature.layer?.id;
    const name = layerId ? layerNames?.[layerId] : undefined;
    return name || layerId || `#${index + 1}`;
  });

  const counts = new Map<string, number>();
  for (const label of baseLabels) {
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return baseLabels.map((label, index) => ((counts.get(label) ?? 0) > 1 ? `${label} (${index + 1})` : label));
}

function getExcludeFields(feature: MapGeoJSONFeature | undefined, excludeFields?: Record<string, string[]>) {
  const layerId = feature?.layer?.id;
  return layerId ? excludeFields?.[layerId] : undefined;
}

function FeatureTabs({
  features,
  labels,
  excludeFields,
}: {
  features: MapGeoJSONFeature[];
  labels: string[];
  excludeFields?: Record<string, string[]>;
}) {
  const [selected, setSelected] = useState(0);
  const [prevFeatures, setPrevFeatures] = useState(features);

  // Reset to the first tab whenever a different feature set arrives
  if (prevFeatures !== features) {
    setPrevFeatures(features);
    setSelected(0);
  }

  // Clamp so a new click with fewer features never indexes past the end
  const selectedIndex = Math.min(selected, features.length - 1);
  const selectedFeature = features[selectedIndex];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="tablist"
        className="tabs tabs-box tabs-sm max-w-full min-w-0 shrink-0 flex-nowrap overflow-x-auto bg-primary/5 p-0 [--tab-bg:var(--color-primary)]"
      >
        {features.map((_, index) => (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: features have no stable identifier
            key={index}
            type="button"
            role="tab"
            aria-selected={selectedIndex === index}
            className={classNames(
              'tab max-w-44 min-w-0 flex-none gap-1 whitespace-nowrap',
              selectedIndex === index
                ? 'tab-active bg-primary font-semibold text-primary-content'
                : 'text-primary/70 hover:text-primary',
            )}
            onClick={() => setSelected(index)}
          >
            <span className="truncate">{labels[index]}</span>
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <Feature feature={selectedFeature} excludeFields={getExcludeFields(selectedFeature, excludeFields)} />
      </div>
    </div>
  );
}

function FeatureStack({
  features,
  labels,
  excludeFields,
}: {
  features: MapGeoJSONFeature[];
  labels: string[];
  excludeFields?: Record<string, string[]>;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain">
      {features.map((feature, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: features have no stable identifier
        <section key={index} className="border-l-2 border-accent pl-2">
          <h6 className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">{labels[index]}</h6>
          <Feature feature={feature} excludeFields={getExcludeFields(feature, excludeFields)} />
        </section>
      ))}
    </div>
  );
}

export function Popup({ lat, lng, features, onClose, excludeFields, layout = 'tabs', layerNames }: PopupInfo) {
  const labels = buildFeatureLabels(features, layerNames);

  return (
    <MaplibrePopup longitude={lng} latitude={lat} onClose={onClose} closeButton={false} maxWidth="min(500px, 92vw)">
      <div className="flex max-h-[50dvh] min-w-0 flex-col overflow-hidden">
        {layout === 'stacked' ? (
          <FeatureStack features={features} labels={labels} excludeFields={excludeFields} />
        ) : (
          <FeatureTabs features={features} labels={labels} excludeFields={excludeFields} />
        )}
      </div>
    </MaplibrePopup>
  );
}
