import { useEffect, useRef, useState } from 'react';
import { X, Terminal as TerminalIcon } from 'lucide-react';

interface LogViewerProps {
  containerId: string;
  containerName: string;
  onClose: () => void;
}

export const LogViewer = ({ containerId, containerName, onClose }: LogViewerProps) => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let controller = new AbortController();
    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/containers/${containerId}/logs`, {
          signal: controller.signal,
        });

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          // Docker logs often have header bytes (8 bytes) that we might want to strip 
          // but for a "terminal" vibe, raw often works or we can do basic cleanup.
          // Let's strip potential non-printable headers if they exist.
          const cleanText = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
          
          setLogs((prev) => [...prev.slice(-500), cleanText]); // Keep last 500 chunks
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Log stream error:', err);
          setLogs((prev) => [...prev, `\n[ERROR: STREAM_DISCONNECTED]`]);
          setIsConnected(false);
        }
      }
    };

    fetchLogs();

    return () => {
      controller.abort();
    };
  }, [containerId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-black border border-terminal-dim rounded-lg overflow-hidden shadow-2xl">
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
      <div 
        ref={scrollRef}
        className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed selection:bg-terminal-fg selection:text-black whitespace-pre-wrap break-all"
      >
        {logs.length === 0 ? (
          <div className="text-gray-600 italic">WAITING_FOR_LOGS...</div>
        ) : (
          logs.map((log, i) => <span key={i}>{log}</span>)
        )}
      </div>
    </div>
  );
};
