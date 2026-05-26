import { Sidebar } from './Sidebar';

export const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen bg-terminal-bg overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-auto p-6">
      {children}
    </main>
  </div>
);
