import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { ContainerTable } from './components/ContainerTable';
import { ImageTable } from './components/ImageTable';
import { NetworkTable } from './components/NetworkTable';
import { VolumeTable } from './components/VolumeTable';
import { fetchHostStats, checkAuthStatus } from './api/client';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './views/LoginView';
import { SetupView } from './views/SetupView';

function Dashboard() {
  const [activeView, setActiveView] = useState('DASHBOARD');

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
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const renderContent = () => {
    switch (activeView) {
      case 'DASHBOARD':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="space-y-4">
              <h2 className="text-white border-b border-terminal-dim pb-2 font-mono">{'>'} SYSTEM_OVERVIEW</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="text-xs text-gray-500 font-mono">UPTIME</div>
                  <div className={`text-2xl font-mono ${statsLoading ? 'animate-pulse text-terminal-accent' : 'text-terminal-fg'}`}>
                    {statsLoading ? 'FETCHING...' : formatUptime(stats?.uptime || 0)}
                  </div>
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
          <div className="grid grid-cols-4 gap-4 animate-in fade-in duration-500">
            <div className="col-span-1 border border-terminal-dim p-4 bg-black/20">
              <h3 className="text-terminal-fg font-mono mb-4">{'>'} REGISTRIES</h3>
              {/* Registry list and Add button will go here */}
            </div>
            <div className="col-span-3 space-y-4">
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
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      {renderContent()}
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
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
