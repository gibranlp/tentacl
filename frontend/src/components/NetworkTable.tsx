import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Info } from 'lucide-react';
import { fetchNetworks, removeNetwork, fetchNetworkInspect } from '../api/client';
import type { Network } from '../api/client';
import { ResourceInspector } from './ResourceInspector';

export const NetworkTable = () => {
  const queryClient = useQueryClient();
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const { data: networks, isLoading, error } = useQuery({
    queryKey: ['networks'],
    queryFn: fetchNetworks,
    refetchInterval: 10000,
  });

  const removeMutation = useMutation({
    mutationFn: removeNetwork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networks'] });
      if (selectedNetwork) setSelectedNetwork(null);
    },
  });

  if (isLoading) return <div className="text-terminal-accent animate-pulse font-mono">FETCHING_NETWORKS...</div>;
  if (error) return <div className="text-terminal-danger font-mono">ERROR: {(error as Error).message}</div>;

  return (
    <div className={`mt-6 transition-all duration-500 ${selectedNetwork ? 'flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6' : ''}`}>
      <div className={`${selectedNetwork ? 'lg:w-1/2' : 'w-full'}`}>
        <h3 className="text-white mb-4 font-mono">{'>'} NETWORK_LIST</h3>
        <div className="overflow-x-auto border border-terminal-dim/50 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-terminal-dim text-xs text-gray-500 font-mono bg-terminal-dim/5">
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">NAME</th>
                <th className="py-2 px-3">DRIVER</th>
                <th className="py-2 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="text-sm font-mono">
              {networks?.map((net: Network) => (
                <tr 
                  key={net.Id} 
                  onClick={() => setSelectedNetwork(net)}
                  className={`border-b border-terminal-dim hover:bg-terminal-dim/30 group transition-colors cursor-pointer ${selectedNetwork?.Id === net.Id ? 'bg-terminal-dim/40' : ''}`}
                >
                  <td className="py-3 px-3 font-mono text-terminal-accent">{net.Id.substring(0, 12)}</td>
                  <td className="py-3 px-3 text-white">{net.Name}</td>
                  <td className="py-3 px-3 text-gray-400">{net.Driver}</td>
                  <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setSelectedNetwork(net)}
                        className="p-1 hover:text-terminal-accent transition-colors"
                        title="Inspect"
                      >
                        <Info size={16} />
                      </button>
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
                    </div>
                  </td>
                </tr>
              ))}
              {networks?.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500 italic">
                    NO_NETWORKS_FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedNetwork && (
        <div className="lg:w-1/2 h-[800px] lg:h-[calc(100vh-200px)] animate-in slide-in-from-right-4 duration-300 lg:sticky lg:top-0">
          <ResourceInspector 
            resourceId={selectedNetwork.Id} 
            resourceName={selectedNetwork.Name} 
            title="NETWORK" 
            fetchFn={fetchNetworkInspect} 
            onClose={() => setSelectedNetwork(null)} 
          />
        </div>
      )}
    </div>
  );
};
