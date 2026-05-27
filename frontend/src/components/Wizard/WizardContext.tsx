import { createContext, useContext, useState, type ReactNode } from 'react';

interface WizardState {
  currentStep: number;
  formData: any;
  setFormData: (data: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetWizard: () => void;
}

const WizardContext = createContext<WizardState | undefined>(undefined);

export const WizardProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => Math.max(0, prev - 1));
  const resetWizard = () => {
    setCurrentStep(0);
    setFormData({});
  };

  return (
    <WizardContext.Provider value={{ currentStep, formData, setFormData, nextStep, prevStep, resetWizard }}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) throw new Error('useWizard must be used within a WizardProvider');
  return context;
};
