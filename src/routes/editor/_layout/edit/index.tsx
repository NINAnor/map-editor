import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { SetStateFn } from '@headless-tree/core';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { LayerTree } from '../../../../components/LayerTree';
import { PageErrorComponent } from '../../../../components/PageErrorComponent';
import { useAppActions, useAppStore, useExpandedItems } from '../../../../hooks/app';

export const Route = createFileRoute('/editor/_layout/edit/')({
  component: RouteComponent,
  errorComponent: PageErrorComponent,
});

function RouteComponent() {
  const items = useAppStore(state => state.items);
  const { updateTreeItemChildren, setExpandedItems } = useAppActions();
  const expandedItems = useExpandedItems();
  const { t } = useTranslation();

  if (!items) {
    return null;
  }

  return (
    <>
      <ul className="menu menu-horizontal gap-2 mb-2 w-full">
        <li>
          <Link to="folders/add" from={Route.fullPath} className="btn btn-sm btn-accent" preload="intent">
            <FontAwesomeIcon icon={faPlusCircle} /> {t('folder')}
          </Link>
        </li>
        <li>
          <Link to="layers/add" from={Route.fullPath} className="btn btn-sm btn-accent">
            <FontAwesomeIcon icon={faPlusCircle} /> {t('layer')}
          </Link>
        </li>
      </ul>
      {items && (
        <LayerTree
          items={items}
          updateChildren={updateTreeItemChildren}
          editable
          expandedItems={expandedItems}
          setExpandedItems={setExpandedItems as SetStateFn<string[]>}
          routePath={Route.fullPath}
        />
      )}
    </>
  );
}
