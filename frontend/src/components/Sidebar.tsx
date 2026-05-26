import { LayoutDashboard, Box, Layers, Globe, Database } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'DASHBOARD' },
  { icon: Box, label: 'CONTAINERS' },
  { icon: Layers, label: 'IMAGES' },
  { icon: Globe, label: 'NETWORKS' },
  { icon: Database, label: 'VOLUMES' },
];

export const Sidebar = () => (
  <div className="w-64 h-screen border-r border-terminal-dim flex flex-col p-4">
    <div className="text-xl font-bold mb-8 text-white tracking-tighter">TENTACL_v0.1.0</div>
    <nav className="flex-1 space-y-2">
      {navItems.map((item) => (
        <div key={item.label} className="flex items-center space-x-2 cursor-pointer hover:bg-terminal-dim p-2 rounded group">
          <item.icon size={18} className="group-hover:text-white" />
          <span className="text-sm">{item.label}</span>
        </div>
      ))}
    </nav>
    <div className="mt-auto pt-4 border-t border-terminal-dim text-[10px] text-gray-600 text-right">
      creator: gibranlp
    </div>
  </div>
);
