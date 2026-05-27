import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Info } from 'lucide-react';
import { fetchVolumes, removeVolume, fetchVolumeInspect } from '../api/client';
import type { Volume } from '../api/client';
import { ResourceInspector } from './ResourceInspector';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const VolumeTable = () => {
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const { notify } = useNotification();
  const [selectedVolume, setSelectedVolume] = useState<Volume | null>(null);
  const { data: volumes, isLoading, error } = useQuery({
    queryKey: ['volumes'],
    queryFn: fetchVolumes,
    refetchInterval: 10000,
  });

  const removeMutation = useMutation({
    mutationFn: removeVolume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volumes'] });
      if (selectedVolume) setSelectedVolume(null);
      notify('SUCCESS', 'Volume removed successfully');
    },
    onError: (err) => notify('ERROR', `Failed to remove volume: ${err.message}`)
  });

  if (isLoading) return <div className="text-terminal-accent animate-pulse font-mono">FETCHING_VOLUMES...</div>;
  if (error) return <div className="text-terminal-danger font-mono">ERROR: {(error as Error).message}</div>;

  return (
    <div className={`mt-6 transition-all duration-500 ${selectedVolume ? 'flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6' : ''}`}>
      <div className={`${selectedVolume ? 'lg:w-1/2' : 'w-full'}`}>
        <h3 className="text-white mb-4 font-mono">{'>'} VOLUME_LIST</h3>
        <div className="overflow-x-auto border border-terminal-dim/50 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-terminal-dim text-xs text-gray-500 font-mono bg-terminal-dim/5">
                <th className="py-2 px-3">NAME</th>
                <th className="py-2 px-3">DRIVER</th>
                <th className="py-2 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="text-sm font-mono">
              {volumes?.map((vol: Volume) => (
                <tr 
                  key={vol.Name} 
                  onClick={() => setSelectedVolume(vol)}
                  className={`border-b border-terminal-dim hover:bg-terminal-dim/30 group transition-colors cursor-pointer ${selectedVolume?.Name === vol.Name ? 'bg-terminal-dim/40' : ''}`}
                >
                  <td className="py-3 px-3 text-white truncate max-w-[200px]">{vol.Name}</td>
                  <td className="py-3 px-3 text-gray-400">{vol.Driver}</td>
                  <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setSelectedVolume(vol)}
                        className="p-1 hover:text-terminal-accent transition-colors"
                        title="Inspect"
                      >
                        <Info size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove volume ${vol.Name}?`)) {
                            removeMutation.mutate(vol.Name);
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
              {volumes?.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-500 italic">
                    NO_VOLUMES_FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedVolume && (
        <div className="lg:w-1/2 h-[800px] lg:h-[calc(100vh-200px)] animate-in slide-in-from-right-4 duration-300 lg:sticky lg:top-0">
          <ResourceInspector 
            resourceId={selectedVolume.Name} 
            resourceName={selectedVolume.Name} 
            title="VOLUME" 
            fetchFn={fetchVolumeInspect} 
            onClose={() => setSelectedVolume(null)} 
          />
        </div>
      )}
    </div>
  );
};
