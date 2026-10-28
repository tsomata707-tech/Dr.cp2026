import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
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
  const [copiedAll, setCopiedAll] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<PortalUser | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Add User Modal
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

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleResetStudentProgress = (user: PortalUser) => {
    if (window.confirm(`هل أنت متأكد من تصفير وإعادة تهيئة بيانات الطالب ${user.username} بالكامل؟`)) {
      resetStudentProgress(user.username);
      addActivityLog(`قام المشرف بإعادة تهيئة بيانات الطالب: ${user.username}`, 'admin', 'warning');
      showToast(`✓ تم إعادة تهيئة بيانات الطالب ${user.username} بنجاح`);
      setOpenMenuUserId(null);
    }
  };

  const handleToggleActive = (user: PortalUser) => {
    const updated = users.map((u) => {
      if (u.id === user.id) {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    });
    setUsers(updated);
    savePortalUsers(updated);
    const target = updated.find((u) => u.id === user.id);
    const actionText = target?.isActive ? 'تفعيل' : 'تعطيل';
    addActivityLog(`قام المشرف بـ ${actionText} حساب المستخدم ${user.username}`, 'admin', 'success');
    showToast(`✓ تم ${actionText} حساب ${user.username} بنجاح`);
  };

  const toggleShowPassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResetPassword = (user: PortalUser) => {
    let defPass = '123456';
    if (user.groupCode) {
      const match = user.username.match(/_(\d{2})$/);
      const padNum = match ? match[1] : '01';
      defPass = getStudentPassword(user.groupCode, padNum);
    } else if (user.role === 'supervisor') {
      defPass = 'password123';
    }

    const updated = users.map((u) => (u.id === user.id ? { ...u, password: defPass } : u));
    setUsers(updated);
    savePortalUsers(updated);
    addActivityLog(`إعادة تعيين كلمة مرور المستخدم ${user.username}`, 'admin', 'success');
    showToast(`✓ تم إعادة تعيين كلمة مرور ${user.username} إلى (${defPass})`);
    setOpenMenuUserId(null);
  };

  const openEditModal = (user: PortalUser) => {
    setEditingUser(user);
    setEditFullName(user.fullName || user.username);
    setEditPassword(user.password || '');
    setEditIsActive(user.isActive);
    setOpenMenuUserId(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updated = users.map((u) => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          fullName: editFullName.trim() || u.username,
          password: editPassword.trim(),
          isActive: editIsActive,
        };
      }
      return u;
    });
    setUsers(updated);
    savePortalUsers(updated);
    setEditingUser(null);
    showToast(`✓ تم حفظ تعديلات المستخدم ${editingUser.username} بنجاح`);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = newUsername.trim();
    if (users.some((u) => u.username.toLowerCase() === cleanUser.toLowerCase())) {
      showToast('اسم المستخدم هذا موجود بالفعل!', 'error');
      return;
    }
    const meta = RESEARCH_GROUPS_META[newGroupCode];
    const created: PortalUser = {
      id: `usr_${Date.now()}`,
      username: cleanUser,
      fullName: newFullName.trim() || cleanUser,
      role: newRole,
      password: newPassword.trim() || '123456',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      groupCode: newRole === 'member' ? newGroupCode : undefined,
      groupId: newRole === 'member' ? meta?.id : undefined,
      groupName: newRole === 'member' ? meta?.name : undefined,
    };
    const updated = [created, ...users];
    setUsers(updated);
    savePortalUsers(updated);
    setIsAddModalOpen(false);
    showToast(`✓ تم إضافة (${cleanUser}) بنجاح`);
  };

  const handleDeleteUser = (user: PortalUser) => {
    if (user.username === 'admin') {
      showToast('لا يمكن حذف حساب الأدمن الرئيسي!', 'error');
      return;
    }
    const updated = users.filter((u) => u.id !== user.id);
    setUsers(updated);
    savePortalUsers(updated);
    showToast(`✓ تم حذف المستخدم ${user.username} بنجاح`);
    setOpenMenuUserId(null);
  };

  const handleCopySingle = (u: PortalUser) => {
    const text = `اسم المستخدم: ${u.username}\nكلمة المرور: ${u.password}`;
    navigator.clipboard.writeText(text);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast(`✓ تم نسخ بيانات ${u.username}`);
    setOpenMenuUserId(null);
  };

  const handleCopyAll = () => {
    let sheet = 'بيانات دخول المنظومة\n';
    users.forEach((u, i) => {
      sheet += `${i + 1}. اليوزر: ${u.username} | الباسورد: ${u.password}\n`;
    });
    navigator.clipboard.writeText(sheet);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
    showToast('✓ تم نسخ القائمة');
  };

  const handleExportCsv = () => {
    let csv = '\uFEFFالرقم,اسم المستخدم,الاسم الكامل,كلمة المرور,حالة الحساب\n';
    users.forEach((u, idx) => {
      csv += `"${idx + 1}","${u.username}","${u.fullName}","${u.password}","${u.isActive ? 'نشط' : 'معطل'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedGroupFilter !== 'all') {
        if (selectedGroupFilter === 'admin') {
          if (u.role !== 'supervisor') return false;
        } else {
          if (u.groupCode !== selectedGroupFilter) return false;
        }
      }
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        return u.username.toLowerCase().includes(query) || (u.fullName || '').toLowerCase().includes(query);
      }
      return true;
    });
  }, [users, selectedGroupFilter, searchQuery]);

  return (
    <div className="space-y-6 font-['Cairo',_sans-serif] text-right" dir="rtl">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-2xl border-2 flex items-center gap-2.5 font-bold text-sm animate-fadeIn ${
            toastMsg.type === 'success' ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200' : 'bg-red-950/95 border-red-500 text-red-200'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">إدارة المستخدمين</h2>
          <p className="text-xs text-slate-400 mt-1">{users.length} حساب موجود</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center gap-2">
            <Plus className="w-4 h-4" /> إضافة يوزر
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#090c1e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#0e1428] border-b border-slate-800 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                <th className="py-3.5 px-4">اليوزر</th>
                <th className="py-3.5 px-4">الاسم</th>
                <th className="py-3.5 px-4">كلمة المرور</th>
                <th className="py-3.5 px-4 text-center">حالة الحساب</th>
                <th className="py-3.5 px-4 text-center w-[120px]">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-900/60">
                  <td className="py-3 px-4 font-bold text-white">{user.username}</td>
                  <td className="py-3 px-4 text-slate-200">{user.fullName || user.username}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-amber-300">{showPasswords[user.id] ? user.password : '••••••••'}</span>
                      <button onClick={() => toggleShowPassword(user.id)} className="p-1 text-slate-500 hover:text-white">
                        {showPasswords[user.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        user.isActive ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' : 'bg-red-950 text-red-300 border-red-500/50'
                      }`}
                      title={user.isActive ? 'نشط - اضغط للتعطيل' : 'معطل - اضغط للتفعيل'}
                    >
                      {user.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center relative">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setOpenMenuUserId(openMenuUserId === user.id ? null : user.id)}
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {openMenuUserId === user.id && (
                        <div ref={menuRef} className="absolute left-10 top-12 z-50 w-60 bg-[#0f142e] border-2 border-slate-700 rounded-xl shadow-2xl p-1.5 text-right space-y-1">
                          {user.role !== 'supervisor' && (
                            <button onClick={() => onLoginAsStudent?.(user.username)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-300 hover:bg-slate-800 rounded-lg">
                              <LogIn className="w-3.5 h-3.5" /> الدخول كطالب
                            </button>
                          )}
                          <button onClick={() => handleCopySingle(user)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg">
                            <Copy className="w-3.5 h-3.5" /> نسخ بيانات الدخول
                          </button>
                          <button onClick={() => openEditModal(user)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-300 hover:bg-slate-800 rounded-lg">
                            <Edit className="w-3.5 h-3.5" /> تعديل بيانات الحساب
                          </button>
                          <button onClick={() => handleResetPassword(user)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-cyan-300 hover:bg-slate-800 rounded-lg">
                            <RefreshCw className="w-3.5 h-3.5" /> إعادة تعيين كلمة المرور
                          </button>
                          {user.username !== 'admin' && (
                            <button onClick={() => handleResetStudentProgress(user)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-indigo-300 hover:bg-slate-800 rounded-lg">
                              <RotateCcw className="w-3.5 h-3.5" /> إعادة تهيئة بيانات الطالب
                            </button>
                          )}
                          {user.username !== 'admin' && (
                            <button onClick={() => handleDeleteUser(user)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-slate-800 rounded-lg">
                              <Trash2 className="w-3.5 h-3.5" /> حذف الحساب
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
