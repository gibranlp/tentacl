import { useQuery } from '@tanstack/react-query';
import { fetchContainers } from '../api/client';
import type { Container, Port } from '../api/client';

export const ContainerTable = () => {
  const { data: containers, isLoading, error } = useQuery({
    queryKey: ['containers'],
    queryFn: fetchContainers,
    refetchInterval: 5000, // Poll every 5s
  });

  if (isLoading) return <div className="text-terminal-accent animate-pulse font-mono">FETCHING_DATA...</div>;
  if (error) return <div className="text-terminal-danger font-mono">ERROR: {(error as Error).message}</div>;

  return (
    <div className="mt-6">
      <h3 className="text-white mb-4 font-mono">{'>'} CONTAINER_LIST</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-terminal-dim text-xs text-gray-500 font-mono">
              <th className="py-2">ID</th>
              <th className="py-2">NAME</th>
              <th className="py-2">IMAGE</th>
              <th className="py-2">STATUS</th>
              <th className="py-2">PORTS</th>
            </tr>
          </thead>
          <tbody className="text-sm font-mono">
            {containers?.map((c: Container) => (
              <tr key={c.Id} className="border-b border-terminal-dim hover:bg-terminal-dim/30 group transition-colors">
                <td className="py-3 font-mono text-terminal-accent">{c.Id.substring(0, 12)}</td>
                <td className="py-3 text-white">{c.Names[0].replace('/', '')}</td>
                <td className="py-3 text-gray-400 max-w-[200px] truncate" title={c.Image}>{c.Image}</td>
                <td className="py-3">
                  <span className={c.State === 'running' ? 'text-terminal-fg' : 'text-terminal-danger'}>
                    [{c.State.toUpperCase()}]
                  </span>
                </td>
                <td className="py-3 text-xs text-gray-400">
                  {c.Ports?.map((p: Port) => `${p.PublicPort}:${p.PrivatePort}`).join(', ') || 'N/A'}
                </td>
              </tr>
            ))}
            {containers?.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500 italic">
                  NO_CONTAINERS_FOUND
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
