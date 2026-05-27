import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, createUser, deleteUser, changePassword } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Trash2, UserPlus, Shield, Key } from 'lucide-react';

export const SettingsView = () => {
  const { role } = useAuth();
  const { notify } = useNotification();
  const queryClient = useQueryClient();
  
  // User creation form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'readonly'>('readonly');

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: role === 'admin',
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setNewUsername('');
      setNewPassword('');
      notify('SUCCESS', 'User created successfully');
    },
    onError: (err) => notify('ERROR', (err as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      notify('SUCCESS', 'User removed');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setCurrentPassword('');
      setChangeNewPassword('');
      notify('SUCCESS', 'Password updated');
    },
    onError: (err) => notify('ERROR', (err as Error).message),
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-4xl">
      {/* SECURITY SECTION */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2 text-white border-b border-terminal-dim pb-2">
          <Key size={20} className="text-terminal-accent" />
          <h2 className="font-mono text-lg tracking-widest uppercase">Security_Settings</h2>
        </div>
        
        <div className="bg-black/20 border border-terminal-dim p-6 space-y-4">
          <h3 className="text-terminal-fg text-sm font-bold mb-4 tracking-tighter">CHANGE_PASSWORD</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="password" 
              placeholder="CURRENT_PASSWORD"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-black border border-terminal-dim p-2 text-sm text-terminal-fg focus:border-terminal-accent outline-none"
            />
            <input 
              type="password" 
              placeholder="NEW_PASSWORD"
              value={changeNewPassword}
              onChange={(e) => setChangeNewPassword(e.target.value)}
              className="bg-black border border-terminal-dim p-2 text-sm text-terminal-fg focus:border-terminal-accent outline-none"
            />
          </div>
          <button 
            onClick={() => passwordMutation.mutate({ current_password: currentPassword, new_password: changeNewPassword })}
            disabled={passwordMutation.isPending || !changeNewPassword || !currentPassword}
            className="bg-terminal-dim hover:bg-terminal-fg hover:text-black text-white p-2 px-6 font-bold transition-all text-xs disabled:opacity-50"
          >
            {passwordMutation.isPending ? 'UPDATING...' : '> UPDATE_PASSWORD'}
          </button>
        </div>
      </section>

      {/* USER MANAGEMENT SECTION (ADMIN ONLY) */}
      {role === 'admin' && (
        <section className="space-y-6">
          <div className="flex items-center space-x-2 text-white border-b border-terminal-dim pb-2">
            <Shield size={20} className="text-terminal-accent" />
            <h2 className="font-mono text-lg tracking-widest uppercase">User_Management</h2>
          </div>

          {/* Add User Form */}
          <div className="bg-black/20 border border-terminal-dim p-6 space-y-4">
            <h3 className="text-terminal-fg text-sm font-bold mb-4 tracking-tighter flex items-center">
              <UserPlus size={14} className="mr-2" /> ADD_NEW_USER
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                type="text" 
                placeholder="USERNAME"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="bg-black border border-terminal-dim p-2 text-sm text-terminal-fg focus:border-terminal-accent outline-none"
              />
              <input 
                type="password" 
                placeholder="PASSWORD"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-black border border-terminal-dim p-2 text-sm text-terminal-fg focus:border-terminal-accent outline-none"
              />
              <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="bg-black border border-terminal-dim p-2 text-sm text-terminal-fg focus:border-terminal-accent outline-none"
              >
                <option value="readonly">READONLY</option>
                <option value="admin">ADMIN</option>
              </select>
            </div>
            <button 
              onClick={() => createMutation.mutate({ username: newUsername, password: newPassword, role: newRole })}
              disabled={createMutation.isPending || !newUsername || !newPassword}
              className="bg-terminal-accent/20 border border-terminal-accent hover:bg-terminal-accent hover:text-black text-terminal-accent p-2 px-6 font-bold transition-all text-xs disabled:opacity-50"
            >
              {createMutation.isPending ? 'CREATING...' : '> CREATE_USER'}
            </button>
          </div>

          {/* User List */}
          <div className="overflow-x-auto border border-terminal-dim/50 rounded-lg">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-terminal-dim/10 border-b border-terminal-dim text-gray-500">
                  <th className="p-3">USERNAME</th>
                  <th className="p-3">ROLE</th>
                  <th className="p-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={3} className="p-4 text-center animate-pulse">FETCHING_USERS...</td></tr>
                ) : users?.map((u: any) => (
                  <tr key={u.username} className="border-b border-terminal-dim hover:bg-terminal-dim/20 transition-colors">
                    <td className="p-3 text-white font-bold">{u.username}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-terminal-accent/10 text-terminal-accent' : 'bg-gray-800 text-gray-400'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => deleteMutation.mutate(u.username)}
                        className="text-red-500 hover:text-white transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
