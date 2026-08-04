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
      <div className="min-h-screen bg-base-100 flex flex-col">
        <Header icon="" />
        <main className="container mx-auto px-4 py-8 grow">
          <ZodErrorDisplay error={error} title="Invalid configuration" className="max-w-4xl mx-auto" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error instanceof AxiosError) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col">
        <Header icon="" />
        <main className="container mx-auto px-4 py-8 grow">
          <div className="font-bold text-2xl text-center">Unable to load configuration</div>
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
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Header icon={data.data.icon} />

      <main className="container mx-auto px-4 py-8 grow">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-4">Maps</h1>
          <p className="text-base-content/70 text-lg">
            Interactive maps and spatial data from Norwegian Institute for Nature Research
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!isLoading &&
            !isError &&
            data.data.maps.map(map => (
              <div key={map.id} className="card bg-base-100 shadow-lg border hover:shadow-xl transition-shadow">
                <div className="card-body">
                  <h2 className="card-title text-primary capitalize">{map.title}</h2>
                  <p className="text-base-content/70 mb-4">{map.description}</p>
                  <div className="card-actions justify-end">
                    <Link to="/$mapId" params={{ mapId: map.id }} target="_blank" className="btn btn-primary btn-sm">
                      View Map
                    </Link>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
