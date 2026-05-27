import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/client';
import { Terminal } from 'lucide-react';

export const LoginView = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser({ username, password });
      login(res.token);
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-terminal-bg font-mono">
      <div className="w-full max-w-md p-8 border border-terminal-dim rounded-lg shadow-2xl bg-black">
        <div className="flex flex-col items-center mb-8">
          <Terminal size={48} className="text-terminal-fg mb-4" />
          <h1 className="text-2xl text-white font-bold tracking-widest">TENTACL_LOGIN</h1>
          <p className="text-gray-500 text-xs mt-2">v0.1.0 // Auth Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 border border-terminal-danger bg-terminal-danger/10 text-terminal-danger text-sm">
              [{'ERROR'}] {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs text-terminal-accent block">USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-terminal-bg border border-terminal-dim p-2 text-white focus:outline-none focus:border-terminal-fg transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-terminal-accent block">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-terminal-bg border border-terminal-dim p-2 text-white focus:outline-none focus:border-terminal-fg transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terminal-dim hover:bg-terminal-fg hover:text-black text-white p-3 font-bold transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : '> INIT_SESSION'}
          </button>
        </form>
      </div>
    </div>
  );
};
