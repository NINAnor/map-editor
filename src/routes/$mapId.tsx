import { createFileRoute, ErrorComponent, type ErrorComponentProps, Link, Outlet } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Head } from '../components/Head';
import { Header } from '../components/Header';
import { Footer } from '../components/HomeFooter';
import { ZodErrorDisplay } from '../components/ZodErrorDisplay';
import { DEFAULT_LANG, mapConfigQueryOptions, storeConfigQueryOptions } from '../config';
import { useAppStore } from '../hooks/app';
import { useUIActions, useUIStore } from '../hooks/ui';

class MapNotFoundError extends Error {}

export const Route = createFileRoute('/$mapId')({
  component: RootComponent,
  loader: async ({ params: { mapId }, context: { queryClient } }) => {
    const config = useUIStore.getState().defaultConfig;
    const storeResponse = await queryClient.fetchQuery(storeConfigQueryOptions(config));
    const map = storeResponse.data.maps.find(m => m.id === mapId);
    if (map) {
      const configResponse = await queryClient.fetchQuery(mapConfigQueryOptions(map.url));
      return configResponse.data;
    }
    throw new MapNotFoundError(mapId);
  },
  errorComponent: ConfigErrorComponent,
});

function ConfigErrorComponent({ error }: ErrorComponentProps) {
  if (error instanceof z.ZodError) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col">
        <Header icon="" />
        <main className="container mx-auto px-4 py-8 grow">
          <ZodErrorDisplay error={error} title="Invalid map configuration" className="max-w-4xl mx-auto" />
          <div className="flex justify-center mt-5">
            <Link to="/" className="btn btn-primary">
              Go back
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error instanceof AxiosError || error instanceof MapNotFoundError) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col">
        <Header icon="" />
        <main className="container mx-auto px-4 py-8 grow">
          <div className="font-bold text-2xl text-center">Unable to load the map</div>
          <div className="text-center text-md">The following map was not found</div>
          <div className="flex justify-center mt-5">
            <Link to="/" className="btn btn-primary">
              Go back
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Header icon="" />
      <main className="container mx-auto px-4 py-8 grow">
        <div className="flex flex-col items-center">
          <div className="font-bold text-2xl text-center">There was an error</div>
          <ErrorComponent error={error} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function RootComponent() {
  const config = Route.useLoaderData();
  const { ready } = useUIStore();
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
