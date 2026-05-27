import { useWizard } from '../WizardContext';

export const ConfigStep = () => {
  const { setFormData, formData } = useWizard();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    setFormData({ ...formData, [key]: e.target.value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-terminal-fg">Advanced Configuration</h3>
      <input type="text" placeholder="Ports (e.g. 80:80)" onChange={(e) => handleChange(e, 'ports')} className="w-full bg-black border border-terminal-dim p-2 text-sm" />
      <input type="text" placeholder="Environment Vars (KEY=VAL)" onChange={(e) => handleChange(e, 'env_vars')} className="w-full bg-black border border-terminal-dim p-2 text-sm" />
      <input type="text" placeholder="CPU Limit (e.g. 0.5)" onChange={(e) => handleChange(e, 'cpu')} className="w-full bg-black border border-terminal-dim p-2 text-sm" />
    </div>
  );
};
