import { ErrorComponent, type ErrorComponentProps } from '@tanstack/react-router';
import { z } from 'zod';
import { ZodErrorDisplay } from './ZodErrorDisplay';

export function PageErrorComponent({ error }: ErrorComponentProps) {
  if (error instanceof z.ZodError) {
    return (
      <div className="alert alert-error m-4">
        <ZodErrorDisplay error={error} title="Invalid map configuration" />
      </div>
    );
  }

  return (
    <div className="alert alert-error m-4">
      <ErrorComponent error={error} />
    </div>
  );
}
