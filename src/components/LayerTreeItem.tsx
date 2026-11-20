import {
  faDownload,
  faEdit,
  faFolderClosed,
  faFolderOpen,
  faInfoCircle,
  faSquare,
  faSquareCheck,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ItemInstance } from '@headless-tree/core';
import { Link } from '@tanstack/react-router';
import cx from 'classnames';
import { type MouseEventHandler, useCallback } from 'react';
import { useAppActions, useAppStore } from '../hooks/app';
import type { Item, Layer } from '../types';
import { LayerIcon } from './LayerIcon';

export type TREE_BASE_PATH = '/editor/edit/' | '/$mapId/' | '/editor/';

interface ItemRenderProps {
  item: ItemInstance<Item>;
  editable?: boolean;
  className?: string;
  routePath: TREE_BASE_PATH;
}

const noPropagate = (e: React.MouseEvent) => {
  e.stopPropagation();
};

export function ItemRender({ item, editable, className, routePath }: ItemRenderProps) {
  const layerOrder = useAppStore(state => state.layerOrder);
  const isVisible = layerOrder.includes(item.getId());
  const { toggleLayer } = useAppActions();
  const data = item.getItemData();
  const isFolder = item.isFolder();
  const isAlwaysActive = !isFolder && (data as Layer).alwaysActive;
  const { onClick, ...props } = item.getProps();
  const cb = useCallback<MouseEventHandler>(
    e => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      onClick(e);
      if (!item.isFolder() && !isAlwaysActive) {
        toggleLayer(item.getId());
      }
    },
    [onClick, item, toggleLayer, isAlwaysActive],
  );

  const id = item.getId();

  return (
    <div
      {...props}
      onClick={cb}
      style={{
        paddingLeft: `${item.getItemMeta().level * 20}px`,
      }}
    >
      <div
        className={cx('treeitem flex items-center gap-2', className, {
          focused: item.isFocused(),
          expanded: item.isExpanded(),
          folder: isFolder,
        })}
      >
        <div className="text-accent w-4">
          {isFolder && <FontAwesomeIcon icon={item.isExpanded() ? faFolderOpen : faFolderClosed} />}
          {!isFolder && !isAlwaysActive && (
            <FontAwesomeIcon className="text-slate" icon={isVisible ? faSquareCheck : faSquare} />
          )}
        </div>
        {!isFolder && <LayerIcon className="shrink-0" layer={(data as Layer).layer} />}
        <div>{item.getItemName()}</div>
        <div className="flex shrink-0 items-center">
          {editable &&
            (isFolder ? (
              <Link
                className="btn btn-ghost btn-sm"
                to={`folders/$folderId`}
                from={routePath}
                params={{ folderId: id }}
                onClick={noPropagate}
              >
                <FontAwesomeIcon icon={faEdit} />
              </Link>
            ) : (
              <Link
                className="btn btn-ghost btn-sm"
                to={`layers/$layerId`}
                from={routePath}
                params={{ layerId: id }}
                onClick={noPropagate}
              >
                <FontAwesomeIcon icon={faEdit} />
              </Link>
            ))}
          {!editable &&
            (isFolder
              ? data.description && (
                  <Link
                    className="btn btn-ghost btn-sm"
                    to={`folders/$folderId`}
                    from={routePath}
                    params={{ folderId: id }}
                    onClick={noPropagate}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="text-accent" />
                  </Link>
                )
              : data.description && (
                  <Link
                    to={`layers/$layerId`}
                    className="btn btn-ghost btn-sm"
                    from={routePath}
                    params={{ layerId: id }}
                    onClick={noPropagate}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="text-accent" />
                  </Link>
                ))}
          {!editable && data.download_url && (
            <a
              href={data.download_url}
              className="btn btn-ghost btn-sm"
              onClick={noPropagate}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faDownload} className="text-accent" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
