import { Layout } from './components/Layout';
import { ContainerTable } from './components/ContainerTable';

function App() {
  return (
    <Layout>
      <div className="space-y-8">
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

        <section>
          <ContainerTable />
        </section>
      </div>
    </Layout>
  );
}

export default App;
