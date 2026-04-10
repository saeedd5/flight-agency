'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { login, register } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plane, ShieldCheck, LogOut, LayoutDashboard, Ticket, Loader2, User as UserIcon } from 'lucide-react';

export function Navbar() {
  const { user, loginState, logoutState } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('User');

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (isLoginTab) {
      const res = await login(phone, password);
      if (res.success && res.user && res.token) {
        loginState(res.user, res.token);
        setIsOpen(false);
      } else {
        setError(res.errorMessage || 'Login failed');
      }
    } else {
      const res = await register({ name, phone, password, role });
      
      if (res.success) {
        if (res.token && res.user) {
          // اگر کاربر عادی بود و توکن داشت -> لاگین کن
          loginState(res.user, res.token);
          setIsOpen(false);
        } else if (res.errorMessage === 'pending_approval') {
          // اگر آژانس بود -> پیام موفقیت نشان بده
          alert('Agency registered successfully! Please wait for admin approval.');
          setIsOpen(false);
        }
      } else {
        // اگر واقعا خطایی رخ داد (مثل تکراری بودن شماره)
        setError(res.errorMessage || 'Registration failed');
      }
    }
    setIsLoading(false);
  };


  

  // 🔥 شیوه کاملاً ضد گلوله برای پیدا کردن نقش حتی در پیچیده‌ترین ساختارهای ارسالی بک‌اند!
  const rolesRawString = JSON.stringify(user?.roles || []).toLowerCase();
  const isAgency = rolesRawString.includes('agency');

  return (
    <nav className="bg-emerald-950 text-white py-3 px-6 flex justify-between items-center border-b border-emerald-900 shadow-sm relative z-50">
      <Link href="/">
        <div className="flex items-center gap-2 cursor-pointer font-black tracking-tighter text-lg text-emerald-400">
          <Plane className="h-5 w-5" />
          FlightAgency
        </div>
      </Link>

      <div>
        {user ? (
          <div className="relative group">
            <div className="flex items-center gap-2 bg-emerald-900 px-4 py-1.5 cursor-pointer border border-emerald-800 transition-colors group-hover:bg-emerald-800">
              <UserIcon className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold tracking-wide">
                {user.name} <span className="text-emerald-500 font-normal">[{isAgency ? 'Agency' : 'User'}]</span>
              </span>
            </div>

            <div className="absolute right-0 top-full mt-1 w-40 bg-white shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              
              {/* اگر آژانس است */}
              {isAgency ? (
                <Link href="/agency-panel">
                  <div className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer flex items-center gap-2 transition-colors border-b border-slate-100">
                    <LayoutDashboard className="h-3 w-3" /> My Panel
                  </div>
                </Link>
              ) : (
                /* در غیراینصورت قطعاً یوزر عادی است */
                <Link href="/my-bookings">
                  <div className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer flex items-center gap-2 transition-colors border-b border-slate-100">
                    <Ticket className="h-3 w-3" /> My Bookings
                  </div>
                </Link>
              )}


   {/* لینک ابزار سرچ Sabre برای آژانس‌ها */}
              {isAgency && (
                <Link href="/agency-search">
                  <div className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer flex items-center gap-2 transition-colors border-b border-slate-100">
                    <Plane className="h-3 w-3" /> Sabre Search Engine
                  </div>
                </Link>
              )}
   

              
              <div 
                onClick={logoutState}
                className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-3 w-3" /> Logout
              </div>
            </div>
          </div>
        ) : (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 px-5 tracking-wider border-none">
                LOGIN / SIGN UP
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[360px] p-0 bg-white rounded-none border-emerald-800 shadow-2xl gap-0">
              
              <div className="flex text-xs font-bold uppercase tracking-wider text-center">
                <div 
                  onClick={() => { setIsLoginTab(true); setError(''); }}
                  className={`flex-1 py-4 cursor-pointer transition-colors ${isLoginTab ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  Login
                </div>
                <div 
                  onClick={() => { setIsLoginTab(false); setError(''); }}
                  className={`flex-1 py-4 cursor-pointer transition-colors ${!isLoginTab ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  Sign Up
                </div>
              </div>

              <div className="p-6">
                {error && <div className="bg-red-50 text-red-600 p-2 mb-4 text-[10px] font-bold border border-red-200 text-center">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLoginTab && (
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Full Name</Label>
                      <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name / Agency" className="rounded-none h-9 text-xs border-slate-300 focus-visible:ring-emerald-700" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Phone Number</Label>
                    <Input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912..." className="rounded-none h-9 text-xs border-slate-300 focus-visible:ring-emerald-700" />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Password</Label>
                    <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="rounded-none h-9 text-xs border-slate-300 focus-visible:ring-emerald-700" />
                  </div>

                  {!isLoginTab && (
                    <div className="space-y-2 pt-2">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Account Type:</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                          <input type="radio" name="role" value="User" checked={role === 'User'} onChange={() => setRole('User')} className="accent-emerald-700" />
                          Regular User
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                          <input type="radio" name="role" value="Agency" checked={role === 'Agency'} onChange={() => setRole('Agency')} className="accent-emerald-700" />
                          Travel Agency
                        </label>
                      </div>
                    </div>
                  )}

                  <Button type="submit" disabled={isLoading} className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs h-10 mt-2 uppercase tracking-wider">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isLoginTab ? 'Login' : 'Create Account')}
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </nav>
  );
}