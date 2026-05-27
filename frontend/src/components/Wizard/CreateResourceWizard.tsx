import { useWizard } from './WizardContext';
import { UploadStep } from './Steps/UploadStep';
import { ConfigStep } from './Steps/ConfigStep';

export const CreateResourceWizard = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { currentStep, nextStep, prevStep } = useWizard();
  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <UploadStep />;
      case 1: return <ConfigStep />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="border border-terminal-accent bg-black p-6 w-[600px] font-mono shadow-2xl">
        <h2 className="text-terminal-accent mb-6">{'>'} DEPLOYMENT_WIZARD</h2>
        
        <div className="min-h-[300px]">
          {renderStep()}
        </div>

        <div className="flex justify-between mt-8 border-t border-terminal-dim pt-4">
          <button onClick={onClose} className="text-red-500 hover:text-red-400">CANCEL</button>
          <div className="space-x-4">
            <button onClick={prevStep} disabled={currentStep === 0} className="text-terminal-dim hover:text-terminal-fg disabled:opacity-30">BACK</button>
            <button onClick={nextStep} className="text-terminal-accent hover:text-white">NEXT</button>
          </div>
        </div>
      </div>
    </div>
  );
};
