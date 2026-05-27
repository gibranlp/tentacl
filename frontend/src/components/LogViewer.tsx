import { useEffect, useRef, useState } from 'react';
import { X, Terminal as TerminalIcon } from 'lucide-react';
import { fetchWithAuth } from '../api/client';

interface LogViewerProps {
  containerId: string;
  containerName: string;
  onClose: () => void;
  embedded?: boolean;
}

export const LogViewer = ({ containerId, containerName, onClose, embedded = false }: LogViewerProps) => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let isStale = false;
    setLogs([]); // Reset logs for new container
    setIsConnected(true);
    let controller = new AbortController();
    
    const fetchLogs = async () => {
      try {
        const response = await fetchWithAuth(`/api/containers/${containerId}/logs`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          if (!isStale) {
            setLogs([`[SYSTEM_ERROR]: ${errorData.error || 'Failed to fetch logs'}`]);
            setIsConnected(false);
          }
          return;
        }

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done || isStale) break;

          const text = decoder.decode(value, { stream: true });
          
          if (text.trim() || text.includes('\n')) {
            setLogs((prev) => {
              if (isStale) return prev;
              return [...prev.slice(-1000), text];
            });
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError' && !isStale) {
          console.error('Log stream error:', err);
          setIsConnected(false);
        }
      }
    };

    fetchLogs();

    return () => {
      isStale = true;
      controller.abort();
    };
  }, [containerId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={`flex flex-col h-full bg-black overflow-hidden ${!embedded ? 'border border-terminal-dim rounded-lg shadow-2xl' : ''}`}>
      {!embedded && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-terminal-dim bg-terminal-dim/20">
          <div className="flex items-center space-x-2 text-terminal-accent">
            <TerminalIcon size={16} />
            <span className="text-xs font-mono font-bold">LOGS::{containerName.toUpperCase()}</span>
            {!isConnected && <span className="text-[10px] text-terminal-danger animate-pulse">[OFFLINE]</span>}
          </div>
          <button onClick={onClose} className="hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-auto p-4 font-mono text-xs leading-tight selection:bg-terminal-fg selection:text-black whitespace-pre overflow-x-auto bg-[#050505]"
      >
        {logs.length === 0 ? (
          <div className="text-gray-600 italic">WAITING_FOR_LOGS...</div>
        ) : (
          <div className="min-w-max">
            {logs.map((log, i) => <span key={i}>{log}</span>)}
          </div>
        )}
      </div>
    </div>
  );
};
