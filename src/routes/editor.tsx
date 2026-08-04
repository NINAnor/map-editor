import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import {
  createFileRoute,
  ErrorComponent,
  type ErrorComponentProps,
  Outlet,
  redirect,
  useRouter,
} from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Head } from '../components/Head';
import { ZodErrorDisplay } from '../components/ZodErrorDisplay';
import { DEFAULT_LANG, editorSearchSchema, mapConfigQueryOptions } from '../config';
import { useAppStore } from '../hooks/app';
import { useUIActions, useUIStore } from '../hooks/ui';

const EDITOR_CONFIG_URL = '/editor/config.json';

export const Route = createFileRoute('/editor')({
  component: RootComponent,
  validateSearch: editorSearchSchema,
  beforeLoad: () => {
    if (import.meta.env.VITE_HIDE_EDIT_BUTTON === 'true') {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/' });
    }
  },
  loader: async ({ context: { queryClient }, location }) => {
    const searchParams = new URLSearchParams(location.search);
    const configUrl = searchParams.get('config') ?? EDITOR_CONFIG_URL;
    const response = await queryClient.fetchQuery(mapConfigQueryOptions(configUrl));
    return response.data;
  },
  errorComponent: ConfigErrorComponent,
});

function ConfigErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter();
  const queryErrorResetBoundary = useQueryErrorResetBoundary();
  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);

  if (error instanceof z.ZodError) {
    return (
      <div className="p-4">
        <ZodErrorDisplay error={error} title="Invalid map configuration" />
        <button
          type="button"
          className="btn btn-primary mt-4"
          onClick={() => {
            router.invalidate().then().catch(console.error);
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (error instanceof AxiosError) {
    return <div>{error.message}</div>;
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          router.invalidate().then().catch(console.error);
        }}
      >
        retry
      </button>

      <ErrorComponent error={error} />
    </div>
  );
}

function RootComponent() {
  const config = Route.useLoaderData();

  const ready = useUIStore(state => state.ready);
  const uiActions = useUIActions();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n?.changeLanguage) {
      i18n
        .changeLanguage(config.config.language ?? DEFAULT_LANG)
        .then(() => {
          uiActions.setReady(true);
        })
        .catch(console.error);
    } else {
      uiActions.setReady(true);
    }

    if (!ready) {
      useAppStore.setState(() => config);
    }
  }, [uiActions, config, i18n, ready]);

  return (
    <Fragment>
      <Head />
      <Outlet />
    </Fragment>
  );
}
