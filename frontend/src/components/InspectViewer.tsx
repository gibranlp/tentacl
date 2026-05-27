import { useQuery } from '@tanstack/react-query';
import { fetchContainerInspect } from '../api/client';

interface InspectViewerProps {
  containerId: string;
}

export const InspectViewer = ({ containerId }: InspectViewerProps) => {
  const { data: inspectData, isLoading, error } = useQuery({
    queryKey: ['inspect', containerId],
    queryFn: () => fetchContainerInspect(containerId),
  });

  if (isLoading) return <div className="text-terminal-accent animate-pulse p-4">FETCHING_INSPECT_DATA...</div>;
  if (error) return <div className="text-terminal-danger p-4">ERROR: {(error as Error).message}</div>;

  return (
    <div className="flex flex-col h-full bg-black border border-terminal-dim rounded-lg overflow-hidden shadow-2xl">
      <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed selection:bg-terminal-fg selection:text-black">
        <pre className="text-gray-300">
          {JSON.stringify(inspectData, null, 2)}
        </pre>
      </div>
    </div>
  );
};
