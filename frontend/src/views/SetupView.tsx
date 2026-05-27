import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { setupUser } from '../api/client';
import { ShieldAlert } from 'lucide-react';

export const SetupView = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await setupUser({ username, password });
      login(res.token);
    } catch (err) {
      setError((err as Error).message || 'Setup failed. Ensure database is writable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-terminal-bg font-mono">
      <div className="w-full max-w-md p-8 border border-terminal-accent rounded-lg shadow-2xl bg-black">
        <div className="flex flex-col items-center mb-8">
          <ShieldAlert size={48} className="text-terminal-accent mb-4 animate-pulse" />
          <h1 className="text-2xl text-white font-bold tracking-widest text-center">INITIAL_SETUP</h1>
          <p className="text-gray-500 text-xs mt-2 text-center">Create the first administrator account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 border border-terminal-danger bg-terminal-danger/10 text-terminal-danger text-sm">
              [{'ERROR'}] {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs text-terminal-accent block">ADMIN_USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-terminal-bg border border-terminal-dim p-2 text-white focus:outline-none focus:border-terminal-accent transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-terminal-accent block">ADMIN_PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-terminal-bg border border-terminal-dim p-2 text-white focus:outline-none focus:border-terminal-accent transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-terminal-accent block">CONFIRM_PASSWORD</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-terminal-bg border border-terminal-dim p-2 text-white focus:outline-none focus:border-terminal-accent transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terminal-accent/20 hover:bg-terminal-accent hover:text-black text-terminal-accent p-3 font-bold transition-all duration-300 disabled:opacity-50 border border-terminal-accent"
          >
            {loading ? 'INITIALIZING...' : '> CREATE_ADMIN'}
          </button>
        </form>
      </div>
    </div>
  );
};
