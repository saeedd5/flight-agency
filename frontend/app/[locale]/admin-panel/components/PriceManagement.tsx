// frontend/app/admin-panel/components/PriceManagement.tsx

'use client';

import { useEffect, useState } from 'react';
import { adminGetSetting, adminUpdateSetting } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Percent } from 'lucide-react';

export function PriceManagement() {
  const [markup, setMarkup] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchMarkupSetting();
  }, []);

  const fetchMarkupSetting = async () => {
    setIsLoading(true);
    const res = await adminGetSetting('FlightMarkupPercentage');
    if (res.success && res.setting) {
      setMarkup(res.setting.value);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    const res = await adminUpdateSetting('FlightMarkupPercentage', markup);
    if (res.success) {
      setMessage({ text: 'Markup updated successfully.', type: 'success' });
    } else {
      setMessage({ text: res.errorMessage || 'Failed to update.', type: 'error' });
    }
    setIsSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  if (isLoading) {
    return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-800" /></div>;
  }

  return (
    <div className="bg-white border border-slate-300 shadow-sm rounded-none p-6 max-w-2xl">
      <h2 className="font-black text-slate-800 text-sm uppercase tracking-tighter mb-1">Global Flight Markup</h2>
      <p className="text-[10px] font-bold text-slate-500 mb-6">This percentage will be added to the base price of all flights.</p>
      
      <div className="max-w-sm space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase text-slate-500">Markup Percentage (%)</label>
          <div className="relative mt-1">
            <Input type="number" min="0" max="100" value={markup} onChange={(e) => setMarkup(e.target.value)} className="rounded-none h-12 text-xl font-black border-slate-300 pl-10 bg-slate-50" />
            <Percent className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900 text-white h-12 text-xs font-black uppercase tracking-wider">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Markup'}
        </Button>
        {message && <div className={`text-[10px] font-black uppercase p-3 text-center border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{message.text}</div>}
      </div>
    </div>
  );
}