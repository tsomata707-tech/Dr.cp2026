import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  KeyRound,
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
  Filter,
  Sparkles,
  Layers,
  Lock,
  MoreVertical,
} from 'lucide-react';
import { PortalUser } from '../types';
import { getPortalUsers, savePortalUsers, addActivityLog } from '../utils/adminStorage';
import { resetStudentProgress, resetAllStudentsToRealCleanState } from '../utils/gameStorage';
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

  // State for Action Dropdown Menu
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
    
    // Close menu when clicking outside
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

  // 1. إعادة تهيئة بيانات الطالب
  const handleResetStudentProgress = (user: PortalUser) => {
    if (window.confirm(`هل أنت متأكد من تصفير وإعادة تهيئة بيانات الطالب ${user.username} بالكامل؟ سيتم مسح درجاته وتقدمه في جميع المستويات.`)) {
      resetStudentProgress(user.username);
      addActivityLog(`قام المشرف بإعادة تهيئة بيانات الطالب: ${user.username}`, 'admin', 'warning');
      showToast(`✓ تم تصفير وإعادة تهيئة درجات وتقدم الطالب (${user.username}) بنجاح.`);
      setOpenMenuUserId(null);
    }
  };

  // 2. تفعيل / تعطيل الحساب
  const handleToggleActive = (user: PortalUser) => {
    const updated = users.map((u) => {
      if (u.id === user.id) {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    });
    setUsers(updated);
    savePortalUsers(updated);
    
    const isNowActive = updated.find((u) => u.id === user.id)?.isActive;
    const actionText = isNowActive ? 'تفعيل' : 'تعطيل';
    
    addActivityLog(`قام المشرف بـ ${actionText} حساب المستخدم ${user.username}`, 'admin', isNowActive ? 'success' : 'warning');
    showToast(`✓ تم ${actionText} حساب (${user.username}) بنجاح.`, isNowActive ? 'success' : 'info');
  };

  // 3. نسخ بيانات الدخول
  const handleCopySingle = (u: PortalUser) => {
    const text = `اسم المستخدم: ${u.username}\nكلمة المرور: ${u.password}\nالمجموعة: ${u.groupName || 'المشرف'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast(`✓ تم نسخ بيانات دخول (${u.username}) إلى الحافظة.`);
    setOpenMenuUserId(null);
  };

  // 4. إعادة تعيين كلمة المرور
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
    showToast(`✓ تم إعادة تعيين كلمة المرور للحساب (${user.username}) إلى: ${defPass}`);
    setOpenMenuUserId(null);
  };

  // 5. حفظ التعديلات
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
    if (!editPassword.trim()) {
      showToast('يرجى إدخال كلمة المرور', 'error');
      return;
    }

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
    addActivityLog(`تعديل بيانات المستخدم ${editingUser.username}`, 'admin', 'success');
    setEditingUser(null);
    showToast(`✓ تم حفظ تعديلات بيانات الحساب (${editingUser.username}) بنجاح.`);
  };

  // 6. إضافة مستخدم
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = newUsername.trim();
    if (!cleanUser) {
      showToast('يرجى كتابة اسم المستخدم (اليوزر)', 'error');
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUser.toLowerCase())) {
      showToast('اسم المستخدم هذا موجود بالفعل في المنظومة!', 'error');
      return;
    }

    const meta = RESEARCH_GROUPS_META[newGroupCode];
    const created: PortalUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
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
    addActivityLog(`إضافة مستخدم جديد: ${cleanUser}`, 'admin', 'success');

    setIsAddModalOpen(false);
    setNewUsername('');
    setNewFullName('');
    setNewPassword('');
    showToast(`✓ تم إضافة المستخدم الجديد (${cleanUser}) بنجاح.`);
  };

  // 7. حذف مستخدم
  const handleDeleteUser = (user: PortalUser) => {
    if (user.username === 'admin') {
      showToast('لا يمكن حذف حساب الأدمن الرئيسي!', 'error');
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف حساب (${user.username}) نهائياً؟`)) {
      const updated = users.filter((u) => u.id !== user.id);
      setUsers(updated);
      savePortalUsers(updated);
      addActivityLog(`حذف المستخدم: ${user.username}`, 'admin', 'warning');
      showToast(`✓ تم حذف الحساب (${user.username}) من المنظومة بنجاح.`, 'info');
      setOpenMenuUserId(null);
    }
  };

  // 8. نسخ الكل
  const handleCopyAll = () => {
    let sheet = 'قائمة حسابات وبيانات دخول المنظومة (Adobe Captivate 2019)\n';
    sheet += '----------------------------------------------------------\n';
    users.forEach((u, i) => {
      sheet += `${i + 1}. اليوزر: ${u.username} | كلمة المرور: ${u.password} | المجموعة: ${u.groupCode || 'مشرف'} | الحالة: ${u.isActive ? 'نشط' : 'معطل'}\n`;
    });
    navigator.clipboard.writeText(sheet);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
    showToast('✓ تم نسخ قائمة كافة المستخدمين (60 طالب والمشرف) إلى الحافظة.');
  };

  // 9. تصدير Excel
  const handleExportCsv = () => {
    let csv = '\uFEFF'; // BOM for Excel Arabic support
    csv += 'الرقم,اسم المستخدم,الاسم الكامل,الدور,المجموعة,كود المجموعة,كلمة المرور,حالة الحساب,تاريخ الإنشاء\n';

    users.forEach((u, idx) => {
      const meta = u.groupCode ? RESEARCH_GROUPS_META[u.groupCode] : null;
      csv += `"${idx + 1}",`;
      csv += `"${u.username}",`;
      csv += `"${u.fullName || u.username}",`;
      csv += `"${u.role === 'supervisor' ? 'مشرف' : 'طالب'}",`;
      csv += `"${meta?.name || u.groupName || '-'}",`;
      csv += `"${u.groupCode || '-'}",`;
      csv += `"${u.password}",`;
      csv += `"${u.isActive ? 'نشط' : 'معطل'}",`;
      csv += `"${u.createdAt || '-'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `قائمة_اليوزر_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ تم تصدير شيت البيانات (CSV) وتحميله بنجاح.');
  };

  const toggleShowPassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
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
        const matchUser = u.username.toLowerCase().includes(query);
        const matchName = (u.fullName || '').toLowerCase().includes(query);
        const matchGroup = (u.groupName || '').toLowerCase().includes(query) || (u.groupCode || '').toLowerCase().includes(query);
        if (!matchUser && !matchName && !matchGroup) return false;
      }

      return true;
    });
  }, [users, selectedGroupFilter, searchQuery]);

  const totalCount = users.length;
  const activeCount = users.filter((u) => u.isActive).length;
  const g1Count = users.filter((u) => u.groupCode === 'G1').length;
  const g2Count = users.filter((u) => u.groupCode === 'G2').length;
  const g3Count = users.filter((u) => u.groupCode === 'G3').length;
  const g4Count = users.filter((u) => u.groupCode === 'G4').length;

  return (
    <div className="space-y-6 font-['Cairo',_sans-serif] text-right" dir="rtl">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] px-6 py-3.5 rounded-2xl shadow-2xl border-2 flex items-center gap-3 font-bold text-sm animate-fadeIn ${
            toastMsg.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
              : toastMsg.type === 'error'
              ? 'bg-red-950/95 border-red-500 text-red-200'
              : 'bg-blue-950/95 border-blue-500 text-blue-200'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toastMsg.type === 'error' ? (
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.25)]">
            <Users className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] tracking-tight">
                إدارة المستخدمين (اليوزر)
              </h2>
              <span className="px-3 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/60 text-blue-300 text-xs font-bold">
                {totalCount} حساب
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              عرض كافة حسابات الطلاب والمشرفين، التحكم في كلمات المرور والتفعيل، وتوزيع المجموعات البحثية.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 cursor-pointer transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة يوزر جديد</span>
          </button>

          <button
            type="button"
            onClick={handleCopyAll}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
          >
            {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{copiedAll ? 'تم النسخ!' : 'نسخ القائمة'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/60 text-emerald-300 hover:text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#0d122b] border border-blue-500/30 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">إجمالي الحسابات</span>
          <span className="text-xl sm:text-2xl font-black text-white">{totalCount}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#091a1a] border border-emerald-500/30 shadow-md">
          <span className="text-[11px] font-bold text-emerald-300/80 block mb-1">حسابات نشطة</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400">{activeCount}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-200 border border-slate-300 shadow-md">
          <span className="text-[11px] font-black text-slate-900 font-['Cairo'] block mb-1">G1 (تنافسي/فوري)</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-['Cairo']">{g1Count}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-200 border border-slate-300 shadow-md">
          <span className="text-[11px] font-black text-slate-900 font-['Cairo'] block mb-1">G2 (تنافسي/مرجأ)</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-['Cairo']">{g2Count}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-200 border border-slate-300 shadow-md">
          <span className="text-[11px] font-black text-slate-900 font-['Cairo'] block mb-1">G3 (تعاوني/فوري)</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-['Cairo']">{g3Count}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-200 border border-slate-300 shadow-md">
          <span className="text-[11px] font-black text-slate-900 font-['Cairo'] block mb-1">G4 (تعاوني/مرجأ)</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-['Cairo']">{g4Count}</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#080b18] border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باليوزر أو اسم الطالب..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:border-blue-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'G1', 'G2', 'G3', 'G4', 'admin'].map((grp) => (
            <button
              key={grp}
              type="button"
              onClick={() => setSelectedGroupFilter(grp as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black font-['Cairo'] transition-all cursor-pointer ${
                selectedGroupFilter === grp
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-200 text-slate-900 hover:bg-slate-300 border border-slate-300'
              }`}
            >
              {grp === 'all' ? `الكل (${totalCount})` : grp === 'admin' ? 'المشرف / الأدمن' : grp}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#090c1e] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#0e1428] border-b border-slate-800 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">اليوزر</th>
                <th className="py-3.5 px-4">الاسم</th>
                <th className="py-3.5 px-4">كلمة المرور</th>
                <th className="py-3.5 px-4 text-center">حالة الحساب</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredUsers.map((user, index) => {
                const isSupervisor = user.role === 'supervisor';
                const isPwVisible = !!showPasswords[user.id];
                const meta = user.groupCode ? RESEARCH_GROUPS_META[user.groupCode] : null;

                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-900/60 transition-colors ${
                      !user.isActive ? 'opacity-60 bg-red-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center text-slate-500 font-bold text-[11px]">{index + 1}</td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-700">
                          {user.username}
                        </span>
                        {isSupervisor && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold">
                            مشرف
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-200 font-medium">{user.fullName || user.username}</td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-amber-300 font-bold text-xs">
                          {isPwVisible ? user.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(user.id)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                        >
                          {isPwVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(user)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                          user.isActive
                            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900'
                            : 'bg-red-950/80 border-red-500/60 text-red-300 hover:bg-red-900'
                        }`}
                      >
                        {user.isActive ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        <span>{user.isActive ? 'نشط' : 'معطل'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-center relative">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setOpenMenuUserId(openMenuUserId === user.id ? null : user.id)}
                          className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuUserId === user.id && (
                          <div
                            ref={menuRef}
                            className="absolute left-0 top-full mt-1 z-50 w-56 bg-[#0f142e] border-2 border-slate-700 rounded-xl shadow-2xl p-1.5 text-right space-y-1"
                          >
                            {onLoginAsStudent && user.role !== 'supervisor' && (
                              <button
                                type="button"
                                onClick={() => {
                                  onLoginAsStudent(user.username);
                                  setOpenMenuUserId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-300 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                              >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>الدخول كطالب</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleCopySingle(user)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                            >
                              {copiedId === user.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>نسخ بيانات الدخول</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(user)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-300 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>تعديل البيانات</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleResetPassword(user)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-cyan-300 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>إعادة تعيين الباسورد</span>
                            </button>

                            {user.username !== 'admin' && (
                              <button
                                type="button"
                                onClick={() => handleResetStudentProgress(user)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-indigo-300 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>تهيئة بيانات الطالب</span>
                              </button>
                            )}

                            {user.username !== 'admin' && (
                              <div className="border-t border-slate-700/50 mt-1 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(user)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>حذف الحساب</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-bold">لا يوجد أي مستخدم مطابق لمعايير البحث</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0c1026] border-2 border-amber-500/70 p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">تعديل بيانات: {editingUser.username}</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم الطالب الكامل:</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">كلمة المرور:</label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold text-xs outline-none focus:border-amber-400"
                  required
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-edit-active"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded cursor-pointer"
                />
                <label htmlFor="chk-edit-active" className="text-xs font-bold text-slate-200 cursor-pointer">
                  حساب نشط
                </label>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold">إلغاء</button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0c1026] border-2 border-blue-500/70 p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">إضافة مستخدم جديد</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم المستخدم: *</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">كلمة المرور: *</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold text-xs"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نوع الحساب:</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    <option value="member">طالب</option>
                    <option value="supervisor">مشرف</option>
                  </select>
                </div>
                {newRole === 'member' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">المجموعة:</label>
                    <select
                      value={newGroupCode}
                      onChange={(e) => setNewGroupCode(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    >
                      <option value="G1">G1: تنافسي / فوري</option>
                      <option value="G2">G2: تنافسي / مرجأ</option>
                      <option value="G3">G3: تعاوني / فوري</option>
                      <option value="G4">G4: تعاوني / مرجأ</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold">إلغاء</button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-blue-600 text-white text-xs font-black">إضافة</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
