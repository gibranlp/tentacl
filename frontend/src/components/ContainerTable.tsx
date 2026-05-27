import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Square, RotateCw, Trash2, FileText, Info, TerminalSquare } from 'lucide-react';
import { fetchContainers, startContainer, stopContainer, restartContainer, removeContainer } from '../api/client';
import { executeBulkAction } from '../utils/bulkActions';
import type { Container } from '../api/client';
import { ContainerDetails } from './ContainerDetails';
import { useNotification } from '../context/NotificationContext';

export const ContainerTable = () => {
  const queryClient = useQueryClient();
  const { notify } = useNotification();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailView, setDetailView] = useState<{ container: Container, tab: 'LOGS' | 'INSPECT' | 'TERMINAL' } | null>(null);
  const { data: containers, isLoading, error } = useQuery({
    queryKey: ['containers'],
    queryFn: fetchContainers,
    refetchInterval: 5000, // Poll every 5s
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === containers?.length && containers?.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(containers?.map(c => c.Id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['containers'] });

  const startMutation = useMutation({ 
    mutationFn: startContainer, 
    onSuccess: () => {
      invalidate();
      notify('SUCCESS', 'Container started successfully');
    },
    onError: (err) => notify('ERROR', `Failed to start container: ${err.message}`)
  });

  const stopMutation = useMutation({ 
    mutationFn: stopContainer, 
    onSuccess: () => {
      invalidate();
      notify('SUCCESS', 'Container stopped successfully');
    },
    onError: (err) => notify('ERROR', `Failed to stop container: ${err.message}`)
  });

  const restartMutation = useMutation({ 
    mutationFn: restartContainer, 
    onSuccess: () => {
      invalidate();
      notify('SUCCESS', 'Container restarted successfully');
    },
    onError: (err) => notify('ERROR', `Failed to restart container: ${err.message}`)
  });

  const removeMutation = useMutation({ 
    mutationFn: removeContainer, 
    onSuccess: () => {
      invalidate();
      notify('SUCCESS', 'Container removed successfully');
    },
    onError: (err) => notify('ERROR', `Failed to remove container: ${err.message}`)
  });

  if (isLoading) return <div className="text-terminal-accent animate-pulse font-mono">FETCHING_DATA...</div>;
  if (error) return <div className="text-terminal-danger font-mono">ERROR: {(error as Error).message}</div>;

  return (
    <div className={`mt-6 transition-all duration-500 ${detailView ? 'flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6' : ''}`}>
      <div className={`${detailView ? 'lg:w-1/2' : 'w-full'}`}>
        <h3 className="text-white mb-4 font-mono">{'>'} CONTAINER_LIST</h3>
        <div className="overflow-x-auto border border-terminal-dim/50 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              {selectedIds.size > 0 ? (
                <tr className="border-b border-terminal-dim text-xs font-mono bg-terminal-accent text-black">
                  <th className="py-2 px-3 w-8">
                    <input type="checkbox" checked={true} onChange={() => setSelectedIds(new Set())} className="accent-black" />
                  </th>
                  <th colSpan={4} className="py-2 px-3 text-left">
                    {selectedIds.size} SELECTED
                    <span className="ml-4 space-x-2">
                      <button onClick={async () => {
                        await executeBulkAction(Array.from(selectedIds), startContainer);
                        setSelectedIds(new Set());
                        invalidate();
                      }} className="hover:underline font-bold">START</button>
                      <button onClick={async () => {
                        await executeBulkAction(Array.from(selectedIds), stopContainer);
                        setSelectedIds(new Set());
                        invalidate();
                      }} className="hover:underline font-bold">STOP</button>
                      <button onClick={async () => {
                        if (confirm(`Remove ${selectedIds.size} containers?`)) {
                          await executeBulkAction(Array.from(selectedIds), removeContainer);
                          setSelectedIds(new Set());
                          invalidate();
                        }
                      }} className="hover:underline font-bold">REMOVE</button>
                    </span>
                  </th>
                </tr>
              ) : (
                <tr className="border-b border-terminal-dim text-xs text-gray-500 font-mono bg-terminal-dim/5">
                  <th className="py-2 px-3 w-8">
                    <input type="checkbox" checked={selectedIds.size === containers?.length && containers?.length > 0} onChange={toggleSelectAll} className="accent-terminal-accent" />
                  </th>
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">NAME</th>
                  <th className="py-2 px-3">STATUS</th>
                  <th className="py-2 px-3 text-right">ACTIONS</th>
                </tr>
              )}
            </thead>
            <tbody className="text-sm font-mono">
              {containers?.map((c: Container) => (
                <tr 
                  key={c.Id} 
                  onClick={() => setDetailView({ container: c, tab: 'LOGS' })}
                  className={`border-b border-terminal-dim hover:bg-terminal-dim/30 group transition-colors cursor-pointer ${detailView?.container.Id === c.Id ? 'bg-terminal-dim/40' : ''}`}
                >
                  <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(c.Id)} onChange={() => toggleSelect(c.Id)} className="accent-terminal-accent" />
                  </td>
                  <td className="py-3 px-3 font-mono text-terminal-accent">{c.Id.substring(0, 12)}</td>
                  <td className="py-3 px-3 text-white truncate max-w-[150px]">{c.Names[0]?.replace('/', '') || 'N/A'}</td>
                  <td className="py-3 px-3">
                    <span className={c.State === 'running' ? 'text-terminal-fg' : 'text-terminal-danger'}>
                      [{c.State.toUpperCase()}]
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setDetailView({ container: c, tab: 'LOGS' })}
                          className="p-1 hover:text-terminal-accent transition-colors"
                          title="View Logs"
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          onClick={() => setDetailView({ container: c, tab: 'INSPECT' })}
                          className="p-1 hover:text-terminal-accent transition-colors"
                          title="Inspect Config"
                        >
                          <Info size={16} />
                        </button>
                        {c.State === 'running' && (
                          <button
                            onClick={() => setDetailView({ container: c, tab: 'TERMINAL' })}
                            className="p-1 hover:text-terminal-accent transition-colors"
                            title="Open Terminal"
                          >
                            <TerminalSquare size={16} />
                          </button>
                        )}
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
                  <td colSpan={4} className="py-4 text-center text-gray-500 italic">
                    NO_CONTAINERS_FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detailView && (
        <div className="lg:w-1/2 h-[800px] lg:h-[calc(100vh-200px)] animate-in slide-in-from-right-4 duration-300 lg:sticky lg:top-0">
          <ContainerDetails 
            containerId={detailView.container.Id} 
            containerName={detailView.container.Names[0]?.replace('/', '') || 'unknown'} 
            onClose={() => setDetailView(null)} 
            initialTab={detailView.tab}
          />
        </div>
      )}
    </div>
  );
};
