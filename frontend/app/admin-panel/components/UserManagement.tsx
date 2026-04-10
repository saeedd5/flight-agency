// frontend/app/admin-panel/components/UserManagement.tsx

'use client';

import { useEffect, useState } from 'react';
import { adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser, AdminUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'User', isActive: true });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const res = await adminGetUsers(1, 50);
    if (res.success) setUsers(res.users);
    setIsLoading(false);
  };

  const openModal = (userToEdit: AdminUser | null = null) => {
    setSelectedUser(userToEdit);
    if (userToEdit) {
      setFormData({
        username: userToEdit.username,
        email: userToEdit.email,
        password: '',
        role: userToEdit.roles[0] || 'User',
        isActive: userToEdit.isActive
      });
    } else {
      setFormData({ username: '', email: '', password: '', role: 'User', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setFormLoading(true);
    let res;
    if (selectedUser) {
      const updateData: any = { username: formData.username, email: formData.email, isActive: formData.isActive, roles: [formData.role] };
      if (formData.password) updateData.password = formData.password;
      res = await adminUpdateUser(selectedUser.id, updateData);
    } else {
      res = await adminCreateUser({ username: formData.username, email: formData.email, password: formData.password, roles: [formData.role] });
    }
    if (res.success) {
      setIsModalOpen(false);
      fetchUsers();
    } else {
      alert(res.errorMessage);
    }
    setFormLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    setIsLoading(true);
    const res = await adminDeleteUser(id);
    if (res.success) fetchUsers();
    else alert(res.errorMessage);
    setIsLoading(false);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-black text-slate-800 uppercase tracking-tighter">Registered Users</h2>
        <Button onClick={() => openModal()} className="rounded-none bg-emerald-800 hover:bg-emerald-900 text-white text-xs h-8 px-4 font-bold uppercase tracking-wide">
          <Plus className="w-3 h-3 mr-1" /> Add User
        </Button>
      </div>

      <div className="bg-white border border-slate-300 shadow-sm overflow-hidden rounded-none">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 border-b border-slate-300 uppercase tracking-tighter font-black">
             {/* Table Header... */}
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-700" /></td></tr>
            ) : users.map((u) => (
               <tr key={u.id} className="border-b border-slate-100 hover:bg-emerald-50/50 transition-colors">
                <td className="px-4 py-2 border-r border-slate-100 font-bold text-slate-500">{u.id}</td>
                <td className="px-4 py-2 border-r border-slate-100 font-bold text-slate-800">
                  {u.username}
                  <div className="text-[9px] text-slate-400 font-normal">{u.email}</div>
                </td>
                <td className="px-4 py-2 border-r border-slate-100">
                  <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 text-[9px] font-black uppercase">{u.roles[0] || 'N/A'}</span>
                </td>
                <td className="px-4 py-2 border-r border-slate-100">
                  {u.isActive ? 
                    <span className="text-emerald-700 font-black text-[10px] uppercase">Active</span> : 
                    <span className="text-red-700 font-black text-[10px] uppercase">Inactive</span>
                  }
                </td>
                <td className="px-4 py-2 text-right">
                    {/* Action buttons... */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {/* ... (کد مدال بدون تغییر باقی می‌ماند) ... */}
      </Dialog>
    </div>
  );
}