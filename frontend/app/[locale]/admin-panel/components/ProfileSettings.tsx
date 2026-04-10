// frontend/app/admin-panel/components/ProfileSettings.tsx

'use client';
import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
// فرض میکنیم یک API برای آپدیت پروفایل ادمین داریم
// import { adminUpdateProfile } from '@/lib/api'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ProfileSettings() {
  const { user } = useAuth();
  
  // (منطق ذخیره سازی پروفایل اینجا اضافه خواهد شد)
  const handleSave = () => {
    alert("Saving admin profile... (API needs to be connected)");
  }

  return (
    <div className="bg-white border border-slate-300 shadow-sm rounded-none p-6 max-w-2xl">
      <h2 className="font-black text-slate-800 text-sm uppercase tracking-tighter mb-6">Admin Profile</h2>
      <div className="space-y-4 max-w-sm">
        <div>
          <label className="text-[10px] font-black uppercase text-slate-500">Username</label>
          <Input readOnly disabled value={user?.username || ''} className="rounded-none h-10 bg-slate-100" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-500">New Password (Optional)</label>
          <Input type="password" placeholder="Leave empty to keep current password" className="rounded-none h-10" />
        </div>
        <Button onClick={handleSave} className="w-full rounded-none h-12 bg-emerald-800 text-xs uppercase font-black">Update Profile</Button>
      </div>
    </div>
  );
}