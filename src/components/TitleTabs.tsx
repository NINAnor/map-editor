import { useElementSize } from '@custom-react-hooks/use-element-size';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, Outlet } from '@tanstack/react-router';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MediaQuery from 'react-responsive';
import { TABS } from '../config';
import { useAppStore } from '../hooks/app';
import { useUIActions } from '../hooks/ui';
import { MapIcon } from './MapIcon';

export function TitleTabs({
  routePath,
  params,
}: {
  routePath: '/$mapId/' | '/editor/';
  params: {
    mapId?: string;
  };
}) {
  const title = useAppStore(state => state.title);
  const subtitle = useAppStore(state => state.subtitle);
  const icon = useAppStore(state => state.icon);
  const actions = useUIActions();
  const menuOrientation = useAppStore(state => state.config?.menuOrientation ?? 'horizontal');
  const { t } = useTranslation();

  const [setRef, size] = useElementSize();

  const outletWrapper = useMemo(
    () => ({
      maxHeight: `calc(100vh - var(--spacing) * 4 - ${size.height ?? 0}px)`,
    }),
    [size],
  );

  const isVertical = menuOrientation === 'vertical';

  return (
    <div className={classNames('bg-base-100 shadow-2xs h-screen w-md p-2 ')}>
      <div ref={setRef} className="pb-3">
        <div
          className={classNames('flex', {
            'flex-col items-center': isVertical,
            'flex-row gap-4': !isVertical,
          })}
        >
          <MediaQuery maxWidth={700}>
            <button
              className={classNames('btn btn-ghost', { 'order-3': !isVertical, 'self-end': isVertical })}
              type="button"
              onClick={() => actions.setOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </MediaQuery>
          {icon && <MapIcon icon={icon} size={isVertical ? 'xl' : 'lg'} />}
          <div
            className={classNames({
              grow: !isVertical,
            })}
          >
            <h1 className="text-2xl text-primary font-bold">{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>

        <div role="tablist" className="tabs tabs-border mt-3">
          {TABS.map(tab => (
            <Link
              role="tab"
              className="tab"
              to={routePath + tab.id}
              key={tab.id}
              activeOptions={{ exact: true }}
              params={params}
              activeProps={{ className: 'tab-active' }}
            >
              {t(tab.label)}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-auto" style={outletWrapper}>
        <Outlet />
      </div>
    </div>
  );
}
