import { useWizard } from '../WizardContext';

export const UploadStep = () => {
  const { setFormData, formData } = useWizard();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, [key]: e.target.files[0] });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-terminal-fg">Upload Files</h3>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Dockerfile</label>
        <input type="file" onChange={(e) => handleFileChange(e, 'dockerfile')} className="w-full border border-terminal-dim text-xs p-1" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">docker-compose.yml</label>
        <input type="file" onChange={(e) => handleFileChange(e, 'compose')} className="w-full border border-terminal-dim text-xs p-1" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">.env</label>
        <input type="file" onChange={(e) => handleFileChange(e, 'env')} className="w-full border border-terminal-dim text-xs p-1" />
      </div>
    </div>
  );
};
