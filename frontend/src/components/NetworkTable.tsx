import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { fetchNetworks, removeNetwork } from '../api/client';
import type { Network } from '../api/client';

export const NetworkTable = () => {
  const queryClient = useQueryClient();
  const { data: networks, isLoading, error } = useQuery({
    queryKey: ['networks'],
    queryFn: fetchNetworks,
    refetchInterval: 10000,
  });

  const removeMutation = useMutation({
    mutationFn: removeNetwork,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['networks'] }),
  });

  if (isLoading) return <div className="text-terminal-accent animate-pulse font-mono">FETCHING_NETWORKS...</div>;
  if (error) return <div className="text-terminal-danger font-mono">ERROR: {(error as Error).message}</div>;

  return (
    <div className="mt-6">
      <h3 className="text-white mb-4 font-mono">{'>'} NETWORK_LIST</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-terminal-dim text-xs text-gray-500 font-mono">
              <th className="py-2">ID</th>
              <th className="py-2">NAME</th>
              <th className="py-2">DRIVER</th>
              <th className="py-2">SCOPE</th>
              <th className="py-2 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="text-sm font-mono">
            {networks?.map((net: Network) => (
              <tr key={net.Id} className="border-b border-terminal-dim hover:bg-terminal-dim/30 group transition-colors">
                <td className="py-3 font-mono text-terminal-accent">{net.Id.substring(0, 12)}</td>
                <td className="py-3 text-white">{net.Name}</td>
                <td className="py-3 text-gray-400">{net.Driver}</td>
                <td className="py-3 text-xs text-gray-400">
                  [{net.Scope.toUpperCase()}]
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => {
                      if (confirm(`Remove network ${net.Name}?`)) {
                        removeMutation.mutate(net.Id);
                      }
                    }}
                    disabled={removeMutation.isPending}
                    className="p-1 hover:text-terminal-danger transition-colors disabled:opacity-50"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {networks?.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500 italic">
                  NO_NETWORKS_FOUND
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
