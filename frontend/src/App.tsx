import { Layout } from './components/Layout';

function App() {
  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-white border-b border-terminal-dim pb-2">{'>'} SYSTEM_OVERVIEW</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-terminal-dim p-4">
            <div className="text-xs text-gray-500">CPU_USAGE</div>
            <div className="text-2xl">4.2%</div>
          </div>
          <div className="border border-terminal-dim p-4">
            <div className="text-xs text-gray-500">MEM_USAGE</div>
            <div className="text-2xl">1.2 GB / 8 GB</div>
          </div>
          <div className="border border-terminal-dim p-4">
            <div className="text-xs text-gray-500">UPTIME</div>
            <div className="text-2xl">12d 4h 22m</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
