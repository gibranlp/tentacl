import { useQuery } from '@tanstack/react-query';
import { X, Info } from 'lucide-react';

interface ResourceInspectorProps {
  resourceId: string;
  resourceName: string;
  onClose: () => void;
  fetchFn: (id: string) => Promise<any>;
  title: string;
}

export const ResourceInspector = ({ resourceId, resourceName, onClose, fetchFn, title }: ResourceInspectorProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['inspect', title.toLowerCase(), resourceId],
    queryFn: () => fetchFn(resourceId),
  });

  return (
    <div className="flex flex-col h-full bg-black border border-terminal-dim rounded-lg overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 border-b border-terminal-dim bg-terminal-dim/20">
        <div className="flex items-center space-x-2 text-terminal-accent">
          <Info size={16} />
          <span className="text-xs font-mono font-bold">{title}::{resourceName.toUpperCase()}</span>
        </div>
        <button onClick={onClose} className="hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed selection:bg-terminal-fg selection:text-black">
        {isLoading ? (
          <div className="text-terminal-accent animate-pulse">FETCHING_DATA...</div>
        ) : error ? (
          <div className="text-terminal-danger">ERROR: {(error as Error).message}</div>
        ) : (
          <pre className="text-gray-300">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
      <div className="px-4 py-1 border-t border-terminal-dim bg-terminal-dim/5 flex justify-between items-center">
        <span className="text-[9px] text-gray-600 font-mono italic">ID: {resourceId}</span>
      </div>
    </div>
  );
};
