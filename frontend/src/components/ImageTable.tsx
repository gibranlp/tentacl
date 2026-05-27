import { useQuery } from '@tanstack/react-query';
import { fetchImages } from '../api/client';
import type { DockerImage } from '../api/client';

export const ImageTable = () => {
  const { data: images, isLoading, error } = useQuery({
    queryKey: ['images'],
    queryFn: fetchImages,
    refetchInterval: 10000, // Poll every 10s
  });

  if (isLoading) return <div className="text-terminal-accent animate-pulse font-mono">FETCHING_IMAGES...</div>;
  if (error) return <div className="text-terminal-danger font-mono">ERROR: {(error as Error).message}</div>;

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="mt-6">
      <h3 className="text-white mb-4 font-mono">{'>'} IMAGE_LIST</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-terminal-dim text-xs text-gray-500 font-mono">
              <th className="py-2">ID</th>
              <th className="py-2">TAGS</th>
              <th className="py-2">SIZE</th>
              <th className="py-2">CREATED</th>
            </tr>
          </thead>
          <tbody className="text-sm font-mono">
            {images?.map((img: DockerImage) => (
              <tr key={img.Id} className="border-b border-terminal-dim hover:bg-terminal-dim/30 group transition-colors">
                <td className="py-3 font-mono text-terminal-accent">{img.Id.split(':')[1]?.substring(0, 12) || img.Id.substring(0, 12)}</td>
                <td className="py-3 text-white">
                  {img.RepoTags?.join(', ') || '<none>'}
                </td>
                <td className="py-3 text-gray-400">{formatSize(img.Size)}</td>
                <td className="py-3 text-xs text-gray-400">
                  {new Date(img.Created * 1000).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {images?.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500 italic">
                  NO_IMAGES_FOUND
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
