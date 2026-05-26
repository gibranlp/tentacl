import { LayoutDashboard, Box, Layers, Globe, Database } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'DASHBOARD' },
  { icon: Box, label: 'CONTAINERS' },
  { icon: Layers, label: 'IMAGES' },
  { icon: Globe, label: 'NETWORKS' },
  { icon: Database, label: 'VOLUMES' },
];

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => (
  <aside className="w-64 h-screen border-r border-terminal-dim flex flex-col p-4 bg-terminal-bg">
    <div className="text-xl font-bold mb-8 text-white tracking-tighter">TENTACL_v0.1.0</div>
    <nav className="flex-1 space-y-2">
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={() => onViewChange(item.label)}
          className={`w-full flex items-center space-x-2 p-2 rounded group transition-colors duration-200 ${
            activeView === item.label
              ? 'bg-terminal-dim text-white'
              : 'text-gray-400 hover:bg-terminal-dim/30 hover:text-terminal-fg'
          }`}
        >
          <item.icon size={18} className={activeView === item.label ? 'text-terminal-fg' : 'group-hover:text-terminal-fg'} />
          <span className="text-sm font-mono">{item.label}</span>
        </button>
      ))}
    </nav>
    <div className="mt-auto pt-4 border-t border-terminal-dim text-[10px] text-gray-600 text-right font-mono">
      creator: gibranlp
    </div>
  </aside>
);
