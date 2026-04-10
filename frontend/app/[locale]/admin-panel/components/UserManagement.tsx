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
            <tr>
              <th className="px-4 py-3 border-r border-slate-200">ID</th>
              <th className="px-4 py-3 border-r border-slate-200">Username / Email</th>
              <th className="px-4 py-3 border-r border-slate-200">Role</th>
              <th className="px-4 py-3 border-r border-slate-200">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-700" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                  No users found in the system.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-emerald-50/50 transition-colors">
                  <td className="px-4 py-3 border-r border-slate-100 font-black text-slate-400">{u.id}</td>
                  <td className="px-4 py-3 border-r border-slate-100 font-bold text-slate-800">
                    <div className="uppercase">{u.username}</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-100">
                    <span className="bg-slate-200 text-slate-700 px-2 py-1 text-[9px] font-black uppercase tracking-wider">
                      {u.roles[0] || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-100">
                    {u.isActive ? 
                      <span className="text-emerald-700 font-black text-[10px] uppercase flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div> Active
                      </span> : 
                      <span className="text-red-700 font-black text-[10px] uppercase flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div> Inactive
                      </span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button onClick={() => openModal(u)} variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-none transition-colors">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(u.id)} variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-none ml-1 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal Dialog برای ساخت و ویرایش کاربر */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-none sm:max-w-[420px] border-emerald-800 p-0 shadow-2xl">
          <DialogHeader className="p-4 border-b border-slate-200 bg-slate-50">
            <DialogTitle className="text-sm font-black uppercase text-emerald-900 tracking-tighter">
              {selectedUser ? 'Edit User Details' : 'Register New User'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-5 space-y-4 bg-white">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Username / Phone</Label>
              <Input 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
                className="rounded-none h-10 text-xs font-bold border-slate-300 focus-visible:ring-emerald-700" 
                placeholder="09123456789" 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Email Address</Label>
              <Input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                className="rounded-none h-10 text-xs font-bold border-slate-300 focus-visible:ring-emerald-700" 
                placeholder="user@example.com" 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                Password {selectedUser && <span className="text-emerald-600 lowercase font-normal tracking-normal">(Leave empty to keep current)</span>}
              </Label>
              <Input 
                type="password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                className="rounded-none h-10 text-xs font-black border-slate-300 focus-visible:ring-emerald-700 tracking-widest" 
                placeholder="••••••••" 
              />
            </div>

            <div className="flex gap-4 pt-2 border-t border-slate-100 mt-2">
              <div className="flex-1 space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">System Role</Label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})} 
                  className="w-full h-10 text-xs font-bold border border-slate-300 focus:ring-emerald-700 focus:border-emerald-700 outline-none px-3 bg-slate-50 uppercase tracking-wide cursor-pointer"
                >
                  <option value="User">Regular User</option>
                  <option value="Agency">Travel Agency</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>
              
              <div className="flex-1 space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Account Status</Label>
                <select 
                  value={formData.isActive ? "true" : "false"} 
                  onChange={e => setFormData({...formData, isActive: e.target.value === "true"})} 
                  className="w-full h-10 text-xs font-bold border border-slate-300 focus:ring-emerald-700 focus:border-emerald-700 outline-none px-3 bg-slate-50 uppercase tracking-wide cursor-pointer"
                >
                  <option value="true">Active (Enabled)</option>
                  <option value="false">Inactive (Suspended)</option>
                </select>
              </div>
            </div>
          </div>
          
          <DialogFooter className="p-4 border-t border-slate-200 bg-slate-50">
            <Button 
              onClick={handleSave} 
              disabled={formLoading} 
              className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900 text-white h-10 text-xs font-black uppercase tracking-widest shadow-sm transition-all"
            >
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save User Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}