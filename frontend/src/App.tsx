import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { ContainerTable } from './components/ContainerTable';
import { ImageTable } from './components/ImageTable';
import { NetworkTable } from './components/NetworkTable';
import { VolumeTable } from './components/VolumeTable';
import { CreateResourceWizard } from './components/Wizard/CreateResourceWizard';
import { WizardProvider } from './components/Wizard/WizardContext';
import { fetchHostStats, checkAuthStatus } from './api/client';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LoginView } from './views/LoginView';
import { SetupView } from './views/SetupView';
import { SettingsView } from './views/SettingsView';

function Dashboard() {
  const [activeView, setActiveView] = useState('DASHBOARD');
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['host-stats'],
    queryFn: fetchHostStats,
    refetchInterval: 5000,
  });

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderContent = () => {
    switch (activeView) {
      case 'DASHBOARD':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="space-y-4">
              <h2 className="text-white border-b border-terminal-dim pb-2 font-mono">{'>'} SYSTEM_OVERVIEW</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-terminal-dim p-4 bg-black/20">
                  <div className="text-xs text-gray-500 font-mono">CPU_USAGE</div>
                  <div className={`text-2xl font-mono ${statsLoading ? 'animate-pulse text-terminal-accent' : 'text-terminal-fg'}`}>
                    {statsLoading ? 'FETCHING...' : `${stats?.cpuPercent.toFixed(1)}%`}
                  </div>
                </div>
                <div className="border border-terminal-dim p-4 bg-black/20">
                  <div className="text-xs text-gray-500 font-mono">MEM_USAGE</div>
                  <div className={`text-2xl font-mono ${statsLoading ? 'animate-pulse text-terminal-accent' : 'text-terminal-fg'}`}>
                    {statsLoading ? 'FETCHING...' : `${formatBytes(stats?.memUsed || 0)} / ${formatBytes(stats?.memTotal || 0)}`}
                  </div>
                </div>
                <div className="border border-terminal-dim p-4 bg-black/20">
                  <div className="text-xs text-gray-500 font-mono">NETWORK_IO</div>
                  <div className={`text-xl font-mono ${statsLoading ? 'animate-pulse text-terminal-accent' : 'text-terminal-fg'}`}>
                    {statsLoading ? 'FETCHING...' : (
                      <div className="flex flex-col">
                        <span className="text-xs text-green-500">IN: {formatBytes(stats?.netIn || 0)}</span>
                        <span className="text-xs text-blue-500">OUT: {formatBytes(stats?.netOut || 0)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="border border-terminal-dim p-4 bg-black/20">
                  <div className="text-xs text-gray-500 font-mono">UPTIME</div>
                  <div className={`text-2xl font-mono ${statsLoading ? 'animate-pulse text-terminal-accent' : 'text-terminal-fg'}`}>
                    {statsLoading ? 'FETCHING...' : formatUptime(stats?.uptime || 0)}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-white border-b border-terminal-dim pb-2 font-mono">{'>'} CONTAINER_RESOURCE_USAGE</h2>
              <div className="border border-terminal-dim/50 rounded-lg overflow-hidden">
                <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-terminal-dim">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead className="sticky top-0 bg-black border-b border-terminal-dim z-10">
                      <tr className="text-gray-500">
                        <th className="p-3">NAME</th>
                        <th className="p-3">CPU</th>
                        <th className="p-3">MEM</th>
                        <th className="p-3">NET_IO</th>
                        <th className="p-3">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsLoading ? (
                        <tr><td colSpan={5} className="p-4 text-center animate-pulse text-terminal-accent">FETCHING_RESOURCE_STATS...</td></tr>
                      ) : stats?.containers?.map((c) => (
                        <tr key={c.id} className="border-b border-terminal-dim/30 hover:bg-terminal-dim/10">
                          <td className="p-3 text-terminal-accent">{c.name}</td>
                          <td className="p-3">{c.cpu.toFixed(2)}%</td>
                          <td className="p-3">{formatBytes(c.memory)}</td>
                          <td className="p-3">
                            <div className="flex flex-col text-[10px]">
                              <span className="text-green-500">↓ {formatBytes(c.netIn)}</span>
                              <span className="text-blue-500">↑ {formatBytes(c.netOut)}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={c.status === 'running' ? 'text-terminal-fg' : 'text-terminal-danger'}>
                              {c.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {stats?.containers?.length === 0 && (
                        <tr><td colSpan={5} className="p-4 text-center text-gray-600">NO_RUNNING_CONTAINERS</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-white border-b border-terminal-dim pb-2 font-mono">{'>'} RECENT_CONTAINERS</h2>
              <ContainerTable />
            </section>
          </div>
        );
      case 'CONTAINERS':
        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-white border-b border-terminal-dim pb-2 font-mono">{'>'} CONTAINER_MANAGEMENT</h2>
            <ContainerTable />
          </div>
        );
      case 'IMAGES':
        return (
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
            <div className="lg:col-span-1 border border-terminal-dim p-4 bg-black/20">
              <h3 className="text-terminal-fg font-mono mb-4">{'>'} REGISTRIES</h3>
              {/* Registry list and Add button will go here */}
            </div>
            <div className="lg:col-span-3 space-y-4">
              <h2 className="text-white border-b border-terminal-dim pb-2 font-mono">{'>'} IMAGE_MANAGEMENT</h2>
              <ImageTable />
            </div>
          </div>
        );
      case 'NETWORKS':
        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-white border-b border-terminal-dim pb-2 font-mono">{'>'} NETWORK_MANAGEMENT</h2>
            <NetworkTable />
          </div>
        );
      case 'VOLUMES':
        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-white border-b border-terminal-dim pb-2 font-mono">{'>'} VOLUME_MANAGEMENT</h2>
            <VolumeTable />
          </div>
        );
      case 'SETTINGS':
        return <SettingsView />;
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      {renderContent()}
      <button 
        onClick={() => setIsWizardOpen(true)}
        className="fixed bottom-8 right-8 bg-terminal-accent text-black font-bold p-4 rounded-full font-mono shadow-2xl hover:scale-110 transition-transform"
      >
        +
      </button>
      <WizardProvider>
        <CreateResourceWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
      </WizardProvider>
    </Layout>
  );
}

const AppRouter = () => {
  const { isAuthenticated } = useAuth();
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const status = await checkAuthStatus();
        setNeedsSetup(status.needsSetup);
      } catch (err) {
        console.error("Failed to check auth status", err);
        setNeedsSetup(false); // Assume it doesn't need setup if it fails
      }
    };
    checkSetup();
  }, [isAuthenticated]); // Re-check setup status when auth changes

  if (needsSetup === null) {
    return <div className="min-h-screen bg-terminal-bg flex items-center justify-center text-terminal-accent font-mono animate-pulse">INIT_SYSTEM...</div>;
  }

  if (needsSetup && !isAuthenticated) {
    return <SetupView />;
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
