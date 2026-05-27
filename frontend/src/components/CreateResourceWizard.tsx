import { useState } from 'react';

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateResourceWizard = ({ isOpen, onClose }: WizardProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="border border-terminal-accent bg-black p-6 w-96 font-mono">
        <h2 className="text-terminal-accent mb-4">{'>'} CREATE_RESOURCE</h2>
        <div className="space-y-4">
          <p className="text-sm text-terminal-fg">Select resource type:</p>
          <button className="w-full border border-terminal-dim p-2 text-left hover:bg-terminal-dim">Network</button>
          <button className="w-full border border-terminal-dim p-2 text-left hover:bg-terminal-dim">Volume</button>
          <button onClick={onClose} className="w-full border border-red-900 p-2 text-left hover:bg-red-900 mt-4">Close</button>
        </div>
      </div>
    </div>
  );
};
