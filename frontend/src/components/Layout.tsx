import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Layout = ({ children, activeView, onViewChange }: LayoutProps) => (
  <div className="flex h-screen bg-terminal-bg overflow-hidden text-terminal-fg font-mono">
    <Sidebar activeView={activeView} onViewChange={onViewChange} />
    <main className="flex-1 overflow-auto p-4 lg:p-6 relative">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  </div>
);
