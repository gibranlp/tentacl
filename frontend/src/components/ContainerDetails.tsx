import { useState } from 'react';
import { X, Terminal as TerminalIcon, Info, TerminalSquare } from 'lucide-react';
import { LogViewer } from './LogViewer';
import { InspectViewer } from './InspectViewer';
import { TerminalViewer } from './TerminalViewer';

interface ContainerDetailsProps {
  containerId: string;
  containerName: string;
  onClose: () => void;
  initialTab?: 'LOGS' | 'INSPECT' | 'TERMINAL';
}

export const ContainerDetails = ({ containerId, containerName, onClose, initialTab = 'LOGS' }: ContainerDetailsProps) => {
  const [activeTab, setActiveTab] = useState<'LOGS' | 'INSPECT' | 'TERMINAL'>(initialTab);

  return (
    <div className="flex flex-col h-[500px] lg:h-full bg-black border border-terminal-dim rounded-lg overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 pt-2 border-b border-terminal-dim bg-terminal-dim/10 overflow-x-auto">
        <div className="flex space-x-1 shrink-0">
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`flex items-center space-x-2 px-4 py-2 border-t border-x rounded-t-md transition-colors ${
              activeTab === 'LOGS'
                ? 'border-terminal-dim bg-black text-terminal-accent'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <TerminalIcon size={14} />
            <span className="text-[10px] font-mono font-bold tracking-widest">LOGS</span>
          </button>
          <button
            onClick={() => setActiveTab('INSPECT')}
            className={`flex items-center space-x-2 px-4 py-2 border-t border-x rounded-t-md transition-colors ${
              activeTab === 'INSPECT'
                ? 'border-terminal-dim bg-black text-terminal-accent'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Info size={14} />
            <span className="text-[10px] font-mono font-bold tracking-widest">INSPECT</span>
          </button>
          <button
            onClick={() => setActiveTab('TERMINAL')}
            className={`flex items-center space-x-2 px-4 py-2 border-t border-x rounded-t-md transition-colors ${
              activeTab === 'TERMINAL'
                ? 'border-terminal-dim bg-black text-terminal-accent'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <TerminalSquare size={14} />
            <span className="text-[10px] font-mono font-bold tracking-widest">EXEC</span>
          </button>
        </div>
        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0">
          {activeTab === 'LOGS' && (
            <LogViewer 
              containerId={containerId} 
              containerName={containerName} 
              onClose={onClose} 
              embedded // Added to tell LogViewer not to render its own header
            />
          )}
          {activeTab === 'INSPECT' && (
            <InspectViewer containerId={containerId} />
          )}
          {activeTab === 'TERMINAL' && (
            <TerminalViewer 
              containerId={containerId} 
              containerName={containerName} 
              onClose={() => setActiveTab('LOGS')} 
            />
          )}
        </div>
      </div>
      
      <div className="px-4 py-1 border-t border-terminal-dim bg-terminal-dim/5 flex justify-between items-center">
        <span className="text-[9px] text-gray-600 font-mono italic">CONTAINER_ID: {containerId.substring(0, 12)}</span>
        <span className="text-[9px] text-terminal-dim font-mono">{containerName.toUpperCase()}</span>
      </div>
    </div>
  );
};
