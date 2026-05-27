import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { X, Terminal as TerminalIcon } from 'lucide-react';

interface TerminalViewerProps {
  containerId: string;
  containerName: string;
  onClose: () => void;
}

export const TerminalViewer = ({ containerId, containerName, onClose }: TerminalViewerProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm
    const xterm = new Terminal({
      cursorBlink: true,
      fontFamily: 'JetBrains Mono, Fira Code, monospace',
      fontSize: 12,
      theme: {
        background: '#000000',
        foreground: '#00ff00',
        cursor: '#00ff00',
      },
    });
    
    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    
    xterm.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = xterm;

    // Initialize WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const token = localStorage.getItem('tentacl_token');
    // We pass the token via a query parameter because WebSockets in browsers don't support custom headers easily.
    // We need to update the backend middleware to accept tokens from query parameters.
    const wsUrl = `${protocol}//${window.location.host}/api/containers/${containerId}/exec?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      xterm.writeln(`\x1b[32m[CONNECTED TO ${containerName.toUpperCase()}]\x1b[0m`);
    };

    ws.onmessage = (event) => {
      xterm.write(event.data);
    };

    ws.onerror = () => {
      xterm.writeln('\x1b[31m[WEBSOCKET ERROR]\x1b[0m');
    };

    ws.onclose = () => {
      xterm.writeln('\r\n\x1b[31m[DISCONNECTED]\x1b[0m');
    };

    // Send input to WebSocket
    xterm.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Handle resize
    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      xterm.dispose();
    };
  }, [containerId, containerName]);

  return (
    <div className="flex flex-col h-full bg-black rounded-lg overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 border-b border-terminal-dim bg-terminal-dim/20">
        <div className="flex items-center space-x-2 text-terminal-accent">
          <TerminalIcon size={16} />
          <span className="text-xs font-mono font-bold">TERMINAL::{containerName.toUpperCase()}</span>
        </div>
        <button onClick={onClose} className="hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 p-2 bg-black overflow-hidden" ref={terminalRef} />
    </div>
  );
};
