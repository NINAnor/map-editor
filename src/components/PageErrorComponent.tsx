import { ErrorComponent, type ErrorComponentProps } from '@tanstack/react-router';
import { z } from 'zod';

export function PageErrorComponent({ error }: ErrorComponentProps) {
  if (error instanceof z.ZodError) {
    return (
      <div className="alert alert-error m-4 flex flex-col items-start gap-2">
        <p className="font-bold">Invalid map configuration</p>
        <ul className="list-disc pl-4 text-sm">
          {error.issues.map((issue, i) => {
            const path = issue.path.length > 0 ? issue.path.join(' › ') : '(root)';
            return (
              <li key={i}>
                <span className="font-mono">{path}</span>: {issue.message}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="alert alert-error m-4">
      <ErrorComponent error={error} />
    </div>
  );
}
