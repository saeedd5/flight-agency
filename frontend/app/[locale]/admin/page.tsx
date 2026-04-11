'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { adminLogin } from '@/lib/api';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { loginState } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await adminLogin(username, password);

    if (res.success && res.user && res.token) {
      // بررسی امنیت دوم: آیا واقعا این کسی که لاگین کرد نقش Admin داره؟
      const isActuallyAdmin = res.user.roles?.some(r => r.toLowerCase() === 'admin');
      if (isActuallyAdmin) {
        loginState(res.user, res.token);
        router.push('/admin-panel'); // هدایت به پنل اختصاصی ادمین
      } else {
        setError('Unauthorized: You are not an admin.');
      }
    } else {
      setError(res.errorMessage || 'Invalid credentials');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[340px] bg-white border border-slate-800 shadow-2xl rounded-none">
        
        {/* هدر مخصوص لاگین ادمین */}
        <div className="bg-emerald-950 p-6 flex flex-col items-center border-b-4 border-emerald-600">
          <ShieldAlert className="w-10 h-10 text-emerald-500 mb-3" />
          <h1 className="text-white font-black uppercase tracking-widest text-sm">System Administration</h1>
          <p className="text-emerald-700/60 font-bold text-[9px] mt-1 tracking-widest">AUTHORIZED PERSONNEL ONLY</p>
        </div>

        {/* فرم */}
        <form onSubmit={handleLogin} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-950 border border-red-800 text-red-500 p-3 text-[10px] font-black text-center uppercase tracking-wider rounded-none">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Admin Username</label>
            <Input 
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              className="rounded-none h-10 border-slate-300 focus-visible:ring-emerald-700 bg-slate-50 text-xs font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master Password</label>
            <Input 
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-none h-10 border-slate-300 focus-visible:ring-emerald-700 bg-slate-50 text-xs font-bold tracking-widest"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full rounded-none h-10 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs uppercase tracking-widest transition-colors mt-4"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Authenticate'}
          </Button>
        </form>

      </div>
    </div>
  );
}