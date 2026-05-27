import { useQuery } from '@tanstack/react-query';
import { fetchVolumes } from '../api/client';
import type { Volume } from '../api/client';

export const VolumeTable = () => {
  const { data: volumes, isLoading, error } = useQuery({
    queryKey: ['volumes'],
    queryFn: fetchVolumes,
    refetchInterval: 10000,
  });

  if (isLoading) return <div className="text-terminal-accent animate-pulse font-mono">FETCHING_VOLUMES...</div>;
  if (error) return <div className="text-terminal-danger font-mono">ERROR: {(error as Error).message}</div>;

  return (
    <div className="mt-6">
      <h3 className="text-white mb-4 font-mono">{'>'} VOLUME_LIST</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-terminal-dim text-xs text-gray-500 font-mono">
              <th className="py-2">NAME</th>
              <th className="py-2">DRIVER</th>
              <th className="py-2">MOUNTPOINT</th>
            </tr>
          </thead>
          <tbody className="text-sm font-mono">
            {volumes?.map((vol: Volume) => (
              <tr key={vol.Name} className="border-b border-terminal-dim hover:bg-terminal-dim/30 group transition-colors">
                <td className="py-3 text-white">{vol.Name}</td>
                <td className="py-3 text-gray-400">{vol.Driver}</td>
                <td className="py-3 text-xs text-gray-400 max-w-[300px] truncate" title={vol.Mountpoint}>
                  {vol.Mountpoint}
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
  );
};
