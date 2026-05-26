import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Square, RotateCw, Trash2 } from 'lucide-react';
import { fetchContainers, startContainer, stopContainer, restartContainer, removeContainer } from '../api/client';
import type { Container, Port } from '../api/client';

export const ContainerTable = () => {
  const queryClient = useQueryClient();
  const { data: containers, isLoading, error } = useQuery({
    queryKey: ['containers'],
    queryFn: fetchContainers,
    refetchInterval: 5000, // Poll every 5s
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['containers'] });

  const startMutation = useMutation({ mutationFn: startContainer, onSuccess: invalidate });
  const stopMutation = useMutation({ mutationFn: stopContainer, onSuccess: invalidate });
  const restartMutation = useMutation({ mutationFn: restartContainer, onSuccess: invalidate });
  const removeMutation = useMutation({ mutationFn: removeContainer, onSuccess: invalidate });

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
              <th className="py-2 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="text-sm font-mono">
            {containers?.map((c: Container) => (
              <tr key={c.Id} className="border-b border-terminal-dim hover:bg-terminal-dim/30 group transition-colors">
                <td className="py-3 font-mono text-terminal-accent">{c.Id.substring(0, 12)}</td>
                <td className="py-3 text-white">{c.Names[0]?.replace('/', '') || 'N/A'}</td>
                <td className="py-3 text-gray-400 max-w-[200px] truncate" title={c.Image}>{c.Image}</td>
                <td className="py-3">
                  <span className={c.State === 'running' ? 'text-terminal-fg' : 'text-terminal-danger'}>
                    [{c.State.toUpperCase()}]
                  </span>
                </td>
                <td className="py-3 text-xs text-gray-400">
                  {c.Ports?.map((p: Port) => `${p.PublicPort}:${p.PrivatePort}`).join(', ') || 'N/A'}
                </td>
                <td className="py-3 text-right">
                  <div className="flex justify-end space-x-2">
                    {c.State !== 'running' ? (
                      <button
                        onClick={() => startMutation.mutate(c.Id)}
                        disabled={startMutation.isPending}
                        className="p-1 hover:text-terminal-fg transition-colors disabled:opacity-50"
                        title="Start"
                      >
                        <Play size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => stopMutation.mutate(c.Id)}
                        disabled={stopMutation.isPending}
                        className="p-1 hover:text-terminal-danger transition-colors disabled:opacity-50"
                        title="Stop"
                      >
                        <Square size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => restartMutation.mutate(c.Id)}
                      disabled={restartMutation.isPending}
                      className="p-1 hover:text-terminal-accent transition-colors disabled:opacity-50"
                      title="Restart"
                    >
                      <RotateCw size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove container ${c.Names[0]}?`)) {
                          removeMutation.mutate(c.Id);
                        }
                      }}
                      disabled={removeMutation.isPending}
                      className="p-1 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {containers?.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-500 italic">
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
