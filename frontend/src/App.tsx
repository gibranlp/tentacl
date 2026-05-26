import { useState } from 'react';
import { Layout } from './components/Layout';
import { ContainerTable } from './components/ContainerTable';

function App() {
  const [activeView, setActiveView] = useState('DASHBOARD');

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
                  <div className="text-2xl font-mono text-terminal-fg">4.2%</div>
                </div>
                <div className="border border-terminal-dim p-4 bg-black/20">
                  <div className="text-xs text-gray-500 font-mono">MEM_USAGE</div>
                  <div className="text-2xl font-mono text-terminal-fg">1.2 GB / 8 GB</div>
                </div>
                <div className="border border-terminal-dim p-4 bg-black/20">
                  <div className="text-xs text-gray-500 font-mono">UPTIME</div>
                  <div className="text-2xl font-mono text-terminal-fg">12d 4h 22m</div>
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
      case 'NETWORKS':
      case 'VOLUMES':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 font-mono animate-pulse">
            <div className="text-terminal-accent text-xl">[{activeView}]_UNDER_CONSTRUCTION</div>
            <div className="text-gray-500 text-sm">Feature implementation in progress...</div>
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

export default App;
