import { useState } from 'react';
import { LayoutDashboard, Box, Layers, Globe, Database, LogOut, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'DASHBOARD' },
  { icon: Box, label: 'CONTAINERS' },
  { icon: Layers, label: 'IMAGES' },
  { icon: Globe, label: 'NETWORKS' },
  { icon: Database, label: 'VOLUMES' },
  { icon: Settings, label: 'SETTINGS' },
];

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (label: string) => {
    onViewChange(label);
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-terminal-bg border border-terminal-dim rounded text-terminal-fg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 border-r border-terminal-dim flex flex-col p-4 bg-terminal-bg transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="text-xl font-bold mb-8 text-white tracking-tighter">TENTACL_v0.1.0</div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.label)}
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
        <div className="mt-auto pt-4 border-t border-terminal-dim flex flex-col space-y-4">
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-terminal-danger hover:text-red-400 transition-colors duration-200"
          >
            <LogOut size={16} />
            <span className="text-xs font-mono">LOGOUT</span>
          </button>
          <div className="text-[10px] text-gray-600 text-right font-mono">
            creator: gibranlp
          </div>
        </div>
      </aside>
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

