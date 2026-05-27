import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type NotificationType = 'SUCCESS' | 'ERROR' | 'INFO';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  notify: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-center space-x-3 p-4 border font-mono text-sm shadow-2xl animate-in slide-in-from-right-4 duration-300 ${
              n.type === 'SUCCESS' ? 'bg-black border-terminal-fg text-terminal-fg' :
              n.type === 'ERROR' ? 'bg-black border-terminal-danger text-terminal-danger' :
              'bg-black border-terminal-accent text-terminal-accent'
            }`}
          >
            {n.type === 'SUCCESS' && <CheckCircle size={18} />}
            {n.type === 'ERROR' && <AlertCircle size={18} />}
            {n.type === 'INFO' && <Info size={18} />}
            
            <div className="flex-1">
              <div className="font-bold">[{n.type}]</div>
              <div>{n.message}</div>
            </div>
            
            <button onClick={() => removeNotification(n.id)} className="opacity-50 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
