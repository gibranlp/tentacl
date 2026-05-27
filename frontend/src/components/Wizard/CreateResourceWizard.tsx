import { useWizard } from './WizardContext';

export const CreateResourceWizard = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="border border-terminal-accent bg-black p-6 w-[600px] font-mono shadow-2xl">
        <h2 className="text-terminal-accent mb-6">{'>'} DEPLOYMENT_WIZARD</h2>
        
        <div className="min-h-[300px]">
          {/* Steps will go here */}
          <p className="text-terminal-fg">Step 1: Configuration</p>
        </div>

        <div className="flex justify-between mt-8 border-t border-terminal-dim pt-4">
          <button onClick={onClose} className="text-red-500 hover:text-red-400">CANCEL</button>
          <div className="space-x-4">
            <button className="text-terminal-dim hover:text-terminal-fg">BACK</button>
            <button className="text-terminal-accent hover:text-white">NEXT</button>
          </div>
        </div>
      </div>
    </div>
  );
};
