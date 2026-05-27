import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Info, Download } from 'lucide-react';
import { fetchImages, removeImage, fetchImageInspect, pullImage } from '../api/client';
import type { DockerImage } from '../api/client';
import { ResourceInspector } from './ResourceInspector';
import { useNotification } from '../context/NotificationContext';

export const ImageTable = () => {
  const queryClient = useQueryClient();
  const { notify } = useNotification();
  const [selectedImage, setSelectedImage] = useState<DockerImage | null>(null);
  const [imageName, setImageName] = useState('');
  
  const { data: images, isLoading, error } = useQuery({
    queryKey: ['images'],
    queryFn: fetchImages,
    refetchInterval: 10000,
  });

  const pullMutation = useMutation({
    mutationFn: (img: string) => pullImage(img),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      setImageName('');
      notify('SUCCESS', 'Image pull initiated');
    },
    onError: (err) => notify('ERROR', `Failed to pull image: ${err.message}`)
  });

  const removeMutation = useMutation({
    mutationFn: removeImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      if (selectedImage) setSelectedImage(null);
      notify('SUCCESS', 'Image removed successfully');
    },
    onError: (err) => notify('ERROR', `Failed to remove image: ${err.message}`)
  });

  if (isLoading) return <div className="text-terminal-accent animate-pulse font-mono">FETCHING_IMAGES...</div>;
  if (error) return <div className="text-terminal-danger font-mono">ERROR: {(error as Error).message}</div>;

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className={`mt-6 transition-all duration-500 ${selectedImage ? 'flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6' : ''}`}>
      <div className={`${selectedImage ? 'lg:w-1/2' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-mono">{'>'} IMAGE_LIST</h3>
          <div className="flex space-x-2">
            <input 
              type="text" 
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              placeholder="e.g. nginx:latest"
              className="bg-black border border-terminal-dim p-1 px-2 text-terminal-fg font-mono text-sm focus:outline-none focus:border-terminal-accent"
            />
            <button 
              onClick={() => pullMutation.mutate(imageName)}
              disabled={pullMutation.isPending || !imageName}
              className="bg-terminal-accent text-black p-1 px-3 font-bold hover:bg-white transition-colors disabled:opacity-50"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto border border-terminal-dim/50 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-terminal-dim text-xs text-gray-500 font-mono bg-terminal-dim/5">
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">TAGS</th>
                <th className="py-2 px-3">SIZE</th>
                <th className="py-2 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="text-sm font-mono">
              {images?.map((img: DockerImage) => (
                <tr 
                  key={img.Id} 
                  onClick={() => setSelectedImage(img)}
                  className={`border-b border-terminal-dim hover:bg-terminal-dim/30 group transition-colors cursor-pointer ${selectedImage?.Id === img.Id ? 'bg-terminal-dim/40' : ''}`}
                >
                  <td className="py-3 px-3 font-mono text-terminal-accent">{img.Id.split(':')[1]?.substring(0, 12) || img.Id.substring(0, 12)}</td>
                  <td className="py-3 px-3 text-white truncate max-w-[200px]" title={img.RepoTags?.join(', ')}>
                    {img.RepoTags?.join(', ') || '<none>'}
                  </td>
                  <td className="py-3 px-3 text-gray-400">{formatSize(img.Size)}</td>
                  <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setSelectedImage(img)}
                        className="p-1 hover:text-terminal-accent transition-colors"
                        title="Inspect"
                      >
                        <Info size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove image ${img.RepoTags?.[0] || img.Id}?`)) {
                            removeMutation.mutate(img.Id);
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

      {selectedImage && (
        <div className="lg:w-1/2 h-[800px] lg:h-[calc(100vh-200px)] animate-in slide-in-from-right-4 duration-300 lg:sticky lg:top-0">
          <ResourceInspector 
            resourceId={selectedImage.Id} 
            resourceName={selectedImage.RepoTags?.[0] || selectedImage.Id.substring(0, 12)} 
            title="IMAGE" 
            fetchFn={fetchImageInspect} 
            onClose={() => setSelectedImage(null)} 
          />
        </div>
      )}
    </div>
  );
};
