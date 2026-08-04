import { useState } from 'react';
import { z } from 'zod';

interface ZodErrorDisplayProps {
  error: z.ZodError;
  title?: string;
  className?: string;
}

/**
 * Displays a Zod validation error with prettified output and collapsible tree view
 */
export function ZodErrorDisplay({ error, title = 'Invalid configuration', className = '' }: ZodErrorDisplayProps) {
  const [showTree, setShowTree] = useState(false);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className="font-bold">{title}</p>
      <pre className="text-sm whitespace-pre-wrap font-mono bg-error/20 p-3 rounded w-full overflow-x-auto">
        {z.prettifyError(error)}
      </pre>
      <div className="collapse collapse-arrow bg-base-200">
        <input type="checkbox" checked={showTree} onChange={e => setShowTree(e.target.checked)} />
        <div className="collapse-title text-sm font-medium">Show detailed error tree</div>
        <div className="collapse-content">
          <pre className="text-xs whitespace-pre-wrap font-mono overflow-x-auto">
            {JSON.stringify(z.treeifyError(error), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
