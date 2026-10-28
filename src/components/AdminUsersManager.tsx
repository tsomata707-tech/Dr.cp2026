import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Plus,
  Download,
  Copy,
  Check,
  RefreshCw,
  RotateCcw,
  LogIn,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { PortalUser } from '../types';
import { getPortalUsers, savePortalUsers, addActivityLog } from '../utils/adminStorage';
import { resetStudentProgress } from '../utils/gameStorage';
import { RESEARCH_GROUPS_META, getStudentPassword } from '../data/studentAccounts';

interface AdminUsersManagerProps {
  onLoginAsStudent?: (username: string) => void;
}

export const AdminUsersManager: React.FC<AdminUsersManagerProps> = ({ onLoginAsStudent }) => {
  const [users, setUsers] = useState<PortalUser[]>(() => getPortalUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'all' | 'G1' | 'G2' | 'G3' | 'G4' | 'admin'>('all');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<PortalUser | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newGroupCode, setNewGroupCode] = useState<'G1' | 'G2' | 'G3' | 'G4'>('G1');
  const [newRole, setNewRole] = useState<'member' | 'supervisor'>('member');

  useEffect(() => {
    setUsers(getPortalUsers());
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuUserId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔴 تنبيه ضخم في منتصف الشاشة
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 5000);
  };

  // 1. زر تهيئة بيانات الطالب
  const handleResetStudentProgress = (user: PortalUser) => {
    if (window.confirm(`هل أنت متأكد من تصفير وإعادة تهيئة درجات الطالب (${user.username})؟`)) {
      resetStudentProgress(user.username);
      addActivityLog(`إعادة تهيئة الطالب: ${user.username}`, 'admin', 'warning');
      showToast(`✅ تم تصفير درجات وتقدم الطالب (${user.username}) بنجاح.`, 'success');
      setOpenMenuUserId(null);
    }
  };

  // 2. زر إعادة تعيين الباسورد
  const handleResetPassword = (user: PortalUser) => {
    let defPass = '123456';
    if (user.groupCode) {
      const match = user.username.match(/_(\d{2})$/);
      defPass = getStudentPassword(user.groupCode, match ? match[1] : '01');
    } else if (user.role === 'supervisor') {
      defPass = 'password123';
    }

    const updated = users.map((u) => (u.id === user.id ? { ...u, password: defPass } : u));
    setUsers(updated);
    savePortalUsers(updated);
    
    showToast(`✅ تم إعادة تعيين الباسورد للحساب (${user.username}) إلى: ${defPass}`, 'info');
    setOpenMenuUserId(null);
  };

  // 3. زر التفعيل والتعطيل
  const handleToggleActive = (user: PortalUser) => {
    const updated = users.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    setUsers(updated);
    savePortalUsers(updated); 
    
    const isNowActive = updated.find((u) => u.id === user.id)?.isActive;
    const msg = isNowActive ? 'تفعيل' : 'تعطيل';
    addActivityLog(`تم ${msg} حساب ${user.username}`, 'admin', isNowActive ? 'success' : 'warning');
    showToast(`✅ تم ${msg} حساب (${user.username}) بنجاح.`, isNowActive ? 'success' : 'info');
  };

  const openEditModal = (user: PortalUser) => {
    setEditingUser(user);
    setEditFullName(user.fullName || user.username);
    setEditPassword(user.password || '');
    setEditIsActive(user.isActive);
    setOpenMenuUserId(null);
  };

  // 4. حفظ التعديلات
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated = users.map((u) => {
      if (u.id === editingUser.id) {
        return { ...u, fullName: editFullName.trim() || u.username, password: editPassword.trim(), isActive: editIsActive };
      }
      return u;
    });

    setUsers(updated);
    savePortalUsers(updated);
    addActivityLog(`تعديل حساب: ${editingUser.username}`, 'admin', 'success');
    setEditingUser(null);
    showToast(`✅ تم حفظ التعديلات بنجاح للحساب (${editingUser.username}).`, 'success');
  };

  // 5. إضافة مستخدم
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some((u) => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      showToast('❌ اسم المستخدم موجود بالفعل!', 'error');
      return;
    }
    const meta = RESEARCH_GROUPS_META[newGroupCode];
    const created: PortalUser = {
      id: `usr_${Date.now()}`,
      username: newUsername.trim(),
      fullName: newFullName.trim() || newUsername.trim(),
      role: newRole,
      password: newPassword.trim() || '123456',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      groupCode: newRole === 'member' ? newGroupCode : undefined,
      groupName: newRole === 'member' ? meta?.name : undefined,
    };
    const updated = [created, ...users];
    setUsers(updated);
    savePortalUsers(updated);
    setIsAddModalOpen(false);
    showToast(`✅ تم إضافة الحساب الجديد (${created.username}) بنجاح.`, 'success');
  };

  // 6. حذف مستخدم
  const handleDeleteUser = (user: PortalUser) => {
    if (user.username === 'admin') return showToast('❌ لا يمكن حذف الأدمن!', 'error');
    if (window.confirm(`هل أنت متأكد من حذف حساب (${user.username}) نهائياً؟`)) {
      const updated = users.filter((u) => u.id !== user.id);
      setUsers(updated);
      savePortalUsers(updated);
      setOpenMenuUserId(null);
      showToast(`✅ تم حذف الحساب (${user.username}) نهائياً.`, 'info');
    }
  };

  const handleCopySingle = (u: PortalUser) => {
    navigator.clipboard.writeText(`اليوزر: ${u.username}\nالباسورد: ${u.password}`);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast(`✅ تم نسخ بيانات (${u.username}) للحافظة.`, 'success');
    setOpenMenuUserId(null);
  };

  const handleCopyAll = () => {
    const sheet = users.map(u => `${u.username} | ${u.password}`).join('\n');
    navigator.clipboard.writeText(sheet);
    showToast('✅ تم نسخ قائمة كافة الحسابات.', 'success');
  };

  const handleExportCsv = () => {
    let csv = '\uFEFFاليوزر,الاسم,الباسورد,الحالة\n';
    users.forEach(u => csv += `"${u.username}","${u.fullName}","${u.password}","${u.isActive ? 'نشط' : 'معطل'}"\n`);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'users.csv'; a.click();
    showToast('✅ تم تصدير الملف بنجاح.', 'success');
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedGroupFilter !== 'all' && u.groupCode !== selectedGroupFilter && (selectedGroupFilter !== 'admin' || u.role !== 'supervisor')) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return u.username.toLowerCase().includes(q) || (u.fullName || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [users, selectedGroupFilter, searchQuery]);

  return (
    <div className="space-y-6 font-['Cairo',_sans-serif] text-right" dir="rtl">
      {/* 🟢 صندوق التنبيه (Toast) في المنتصف وكبير جداً وواضح جداً */}
      {toastMsg && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div
            className={`px-10 py-6 rounded-3xl shadow-2xl border-4 flex flex-col items-center justify-center gap-4 font-bold text-xl animate-bounceIn w-11/12 max-w-md text-center pointer-events-auto ${
              toastMsg.type === 'success'
                ? 'bg-[#064e3b] border-emerald-400 text-white shadow-emerald-500/50'
                : toastMsg.type === 'error'
                ? 'bg-[#7f1d1d] border-red-400 text-white shadow-red-500/50'
                : 'bg-[#1e3a8a] border-blue-400 text-white shadow-blue-500/50'
            }`}
          >
            {toastMsg.type === 'success' ? <CheckCircle2 className="w-16 h-16 text-emerald-300" /> : <XCircle className="w-16 h-16 text-red-300" />}
            <span className="leading-relaxed drop-shadow-md">{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white">إدارة المستخدمين (اليوزر)</h2>
          <p className="text-sm text-slate-400 mt-1">إجمالي {users.length} حساب مسجل بالمنظومة</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2">
            <Plus className="w-4 h-4" /> إضافة يوزر
          </button>
          <button onClick={handleCopyAll} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2">
            <Copy className="w-4 h-4" /> نسخ الكل
          </button>
          <button onClick={handleExportCsv} className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2">
            <Download className="w-4 h-4" /> تصدير Excel
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باليوزر أو الاسم..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'G1', 'G2', 'G3', 'G4', 'admin'].map(grp => (
            <button
              key={grp}
              onClick={() => setSelectedGroupFilter(grp as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedGroupFilter === grp ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}
            >
              {grp === 'all' ? 'الكل' : grp === 'admin' ? 'المشرف' : grp}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-700 bg-[#0f172a] overflow-visible">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-[#1e293b] border-b border-slate-700 text-xs font-bold text-slate-300">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">اليوزر</th>
              <th className="py-3 px-4">الاسم</th>
              <th className="py-3 px-4">الباسورد</th>
              <th className="py-3 px-4 text-center">الحالة</th>
              <th className="py-3 px-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {filteredUsers.map((user, index) => (
              <tr key={user.id} className="hover:bg-slate-800/50">
                <td className="py-3 px-4 text-center text-slate-500">{index + 1}</td>
                <td className="py-3 px-4 font-bold text-white bg-slate-800/80 rounded-lg px-2 inline-block mt-2">{user.username}</td>
                <td className="py-3 px-4 text-slate-200">{user.fullName}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-300">{showPasswords[user.id] ? user.password : '••••••••'}</span>
                    <button onClick={() => setShowPasswords(p => ({...p, [user.id]: !p[user.id]}))} className="text-slate-400 hover:text-white">
                      {showPasswords[user.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => handleToggleActive(user)} className={`px-3 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-red-950 text-red-300 border border-red-500'}`}>
                    {user.isActive ? 'نشط' : 'معطل'}
                  </button>
                </td>
                <td className="py-3 px-4 text-center relative">
                  <button onClick={() => setOpenMenuUserId(openMenuUserId === user.id ? null : user.id)} className="p-2 rounded-lg bg-slate-800 border border-slate-600 text-white">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {openMenuUserId === user.id && (
                    <div ref={menuRef} className="absolute left-0 top-full mt-2 z-50 w-56 bg-[#1e293b] border-2 border-slate-600 rounded-xl shadow-2xl p-2">
                      {onLoginAsStudent && user.role !== 'supervisor' && (
                        <button onClick={() => onLoginAsStudent(user.username)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-300 hover:bg-slate-700 rounded-lg"><LogIn className="w-4 h-4"/> دخول كطالب</button>
                      )}
                      <button onClick={() => handleCopySingle(user)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg"><Copy className="w-4 h-4"/> نسخ البيانات</button>
                      <button onClick={() => openEditModal(user)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-300 hover:bg-slate-700 rounded-lg"><Edit className="w-4 h-4"/> تعديل</button>
                      <button onClick={() => handleResetPassword(user)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-cyan-300 hover:bg-slate-700 rounded-lg"><RefreshCw className="w-4 h-4"/> إعادة باسورد</button>
                      {user.username !== 'admin' && (
                        <>
                          <button onClick={() => handleResetStudentProgress(user)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-indigo-300 hover:bg-slate-700 rounded-lg"><RotateCcw className="w-4 h-4"/> تهيئة الطالب</button>
                          <button onClick={() => handleDeleteUser(user)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 rounded-lg border-t border-slate-600 mt-1 pt-2"><Trash2 className="w-4 h-4"/> حذف</button>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Edit (تم إرجاع اليوزر) */}
      {editingUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1e293b] border-2 border-amber-500/80 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-white text-center">تعديل بيانات: {editingUser.username}</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              
              {/* 🟢 حقل اليوزر (تم إرجاعه هنا) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المستخدم (اليوزر):</label>
                <input
                  type="text"
                  disabled
                  value={editingUser.username}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border-2 border-slate-600 text-slate-400 font-bold text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم الطالب الكامل:</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border-2 border-slate-600 text-white text-sm focus:border-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">كلمة المرور:</label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border-2 border-slate-600 text-amber-300 font-bold text-sm focus:border-amber-400 outline-none"
                  required
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
                <label className="text-sm font-bold text-white cursor-pointer">حساب نشط</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-600">
                <button type="button" onClick={() => setEditingUser(null)} className="px-5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm">إلغاء</button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-sm shadow-lg">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1e293b] border-2 border-blue-500/80 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-white text-center">إضافة مستخدم جديد</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اليوزر *</label>
                  <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-800 border-2 border-slate-600 text-white text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الباسورد *</label>
                  <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-800 border-2 border-slate-600 text-amber-300 text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الكامل</label>
                <input type="text" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-800 border-2 border-slate-600 text-white text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">النوع</label>
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value as any)} className="w-full px-3 py-2 rounded-xl bg-slate-800 border-2 border-slate-600 text-white text-sm">
                    <option value="member">طالب</option>
                    <option value="supervisor">مشرف</option>
                  </select>
                </div>
                {newRole === 'member' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">المجموعة</label>
                    <select value={newGroupCode} onChange={(e) => setNewGroupCode(e.target.value as any)} className="w-full px-3 py-2 rounded-xl bg-slate-800 border-2 border-slate-600 text-white text-sm">
                      <option value="G1">G1</option>
                      <option value="G2">G2</option>
                      <option value="G3">G3</option>
                      <option value="G4">G4</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-600">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2 rounded-xl bg-slate-700 text-white font-bold text-sm">إلغاء</button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-blue-600 text-white font-black text-sm">إضافة</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
