import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, ErrorComponent, type ErrorComponentProps, Link } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { z } from 'zod';
import { Header } from '../components/Header';
import { Footer } from '../components/HomeFooter';
import { ZodErrorDisplay } from '../components/ZodErrorDisplay';
import { storeConfigQueryOptions } from '../config';
import { useUIStore } from '../hooks/ui';

function ConfigErrorComponent({ error }: ErrorComponentProps) {
  if (error instanceof z.ZodError) {
    return (
      <div className="min-h-screen flex flex-col bg-base-200 font-sans text-base-content">
        <Header />
        <main className="container mx-auto grow px-4 py-8">
          <ZodErrorDisplay error={error} title="Invalid configuration" className="max-w-4xl mx-auto" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error instanceof AxiosError) {
    return (
      <div className="min-h-screen flex flex-col bg-base-200 font-sans text-base-content">
        <Header />
        <main className="container mx-auto grow px-4 py-8">
          <div className="font-bold text-2xl text-center">Unable to load configuration</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-200 font-sans text-base-content">
      <Header />
      <main className="container mx-auto grow px-4 py-8">
        <div className="flex flex-col items-center">
          <div className="font-bold text-2xl text-center">There was an error</div>
          <ErrorComponent error={error} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(storeConfigQueryOptions(useUIStore.getState().defaultConfig));
  },
  errorComponent: ConfigErrorComponent,
});

function RouteComponent() {
  const defaultConfigPath = useUIStore(state => state.defaultConfig);
  const { data, isLoading, isError } = useSuspenseQuery(storeConfigQueryOptions(defaultConfigPath));

  return (
    <div className="min-h-screen flex flex-col bg-base-200 font-sans text-base-content">
      <Header />

      <main className="container mx-auto w-full max-w-screen-2xl grow px-4 py-8 sm:px-8 sm:py-12">
        <section className="hero mb-10 overflow-hidden rounded-box bg-primary text-primary-content">
          <div className="hero-content w-full px-6 py-10 sm:px-12 sm:py-14">
            <div className="w-full max-w-4xl">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">Explore maps</p>
              <h1 className="text-3xl font-bold sm:text-4xl">Discover NINA Maps</h1>
              <p className="mt-3 max-w-2xl text-primary-content/80">
                Explore interactive maps and spatial data from the Norwegian Institute for Nature Research.
              </p>
            </div>
          </div>
        </section>

        <section id="maps" aria-labelledby="map-list-heading">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="map-list-heading" className="mb-1 text-2xl font-bold text-primary">
                Explore maps
              </h2>
              <p className="text-sm text-base-content/80">
                Showing {data.data.maps.length} {data.data.maps.length === 1 ? 'map' : 'maps'}
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {!isLoading &&
              !isError &&
              data.data.maps.map(map => (
                <article key={map.id} className="card border border-base-300 bg-base-100 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title text-primary">
                      <Link to="/$mapId" params={{ mapId: map.id }} target="_blank">
                        {map.title}
                      </Link>
                    </h3>
                    <p className="text-base-content/80">
                      {map.description ||
                        'Explore spatial data and research from the Norwegian Institute for Nature Research.'}
                    </p>
                    <div className="card-actions mt-2 justify-end">
                      <Link
                        to="/$mapId"
                        params={{ mapId: map.id }}
                        target="_blank"
                        className="btn btn-secondary btn-sm"
                      >
                        View map
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
          </div>
          {data.data.maps.length === 0 && <p className="rounded-box bg-base-100 p-6">No maps are available yet.</p>}
        </section>
      </main>
      <Footer />
    </div>
  );
}
