import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { PortalUser } from '../types';
import { getPortalUsers, savePortalUsers, addActivityLog } from '../utils/adminStorage';
import { resetStudentProgress, resetAllLevelsProgressKeepingPreTest } from '../utils/gameStorage';
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
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Reset student progress to initial state
  const handleResetStudentProgress = (user: PortalUser) => {
    if (window.confirm(`هل أنت متأكد من تصفير وإعادة تهيئة بيانات الطالب ${user.username} بالكامل؟`)) {
      resetStudentProgress(user.username);
      addActivityLog(`قام المشرف بإعادة تهيئة بيانات الطالب: ${user.username}`, 'admin', 'warning');
      showToast(`✓ تم إعادة تهيئة بيانات الطالب ${user.username} بنجاح`);
    }
  };

  // Toggle user active status
  const handleToggleActive = (user: PortalUser) => {
    const updated = users.map((u) => {
      if (u.id === user.id) {
        const nextState = !u.isActive;
        return { ...u, isActive: nextState };
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

  // Toggle password visibility for single user
  const toggleShowPassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Reset password to default convention
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
  };

  // Open Edit Modal
  const openEditModal = (user: PortalUser) => {
    setEditingUser(user);
    setEditFullName(user.fullName || user.username);
    setEditPassword(user.password || '');
    setEditIsActive(user.isActive);
  };

  // Save Edit User
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
    showToast(`✓ تم حفظ تعديلات المستخدم ${editingUser.username} بنجاح`);
  };

  // Add New User
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = newUsername.trim();
    if (!cleanUser) {
      showToast('يرجى كتابة اسم المستخدم (اليوزر)', 'error');
      return;
    }

    // Check duplicate
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
    showToast(`✓ تم إضافة المستخدم الجديد (${cleanUser}) بنجاح`);
  };

  // Delete User (with safety confirmation)
  const handleDeleteUser = (user: PortalUser) => {
    if (user.username === 'admin') {
      showToast('لا يمكن حذف حساب الأدمن الرئيسي!', 'error');
      return;
    }
    const updated = users.filter((u) => u.id !== user.id);
    setUsers(updated);
    savePortalUsers(updated);
    addActivityLog(`حذف المستخدم: ${user.username}`, 'admin', 'warning');
    showToast(`✓ تم حذف المستخدم ${user.username} بنجاح`);
  };

  // Copy Single Credentials
  const handleCopySingle = (u: PortalUser) => {
    const text = `اسم المستخدم: ${u.username}\nكلمة المرور: ${u.password}\nالمجموعة: ${u.groupName || 'المشرف'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast(`✓ تم نسخ بيانات دخول ${u.username}`);
  };

  // Copy All Users
  const handleCopyAll = () => {
    let sheet = 'قائمة حسابات وبيانات دخول المنظومة (Adobe Captivate 2019)\n';
    sheet += '----------------------------------------------------------\n';
    users.forEach((u, i) => {
      sheet += `${i + 1}. اليوزر: ${u.username} | كلمة المرور: ${u.password} | المجموعة: ${u.groupCode || 'مشرف'} (${u.groupName || ''}) | الحالة: ${u.isActive ? 'نشط' : 'معطل'}\n`;
    });
    navigator.clipboard.writeText(sheet);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
    showToast('✓ تم نسخ قائمة كافة المستخدمين إلى الحافظة');
  };

  // Export CSV
  const handleExportCsv = () => {
    let csv = '\uFEFF'; // BOM for Excel Arabic support
    csv += 'الرقم,اسم المستخدم,الاسم الكامل,الدور,المجموعة,كود المجموعة,نمط التعلم,نمط التغذية الراجعة,كلمة المرور,حالة الحساب,تاريخ الإنشاء,آخر دخول\n';

    users.forEach((u, idx) => {
      const meta = u.groupCode ? RESEARCH_GROUPS_META[u.groupCode] : null;
      csv += `"${idx + 1}",`;
      csv += `"${u.username}",`;
      csv += `"${u.fullName || u.username}",`;
      csv += `"${u.role === 'supervisor' ? 'مشرف' : 'طالب'}",`;
      csv += `"${meta?.name || u.groupName || '-'}",`;
      csv += `"${u.groupCode || '-'}",`;
      csv += `"${meta?.learningMode || '-'}",`;
      csv += `"${meta?.feedbackMode || '-'}",`;
      csv += `"${u.password}",`;
      csv += `"${u.isActive ? 'نشط' : 'معطل'}",`;
      csv += `"${u.createdAt || '-'}",`;
      csv += `"${u.lastLogin || '-'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `قائمة_اليوزر_الطلاب_المنظومة_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ تم تصدير شيت اليوزر بنجاح بصيغة CSV');
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Group Filter
      if (selectedGroupFilter !== 'all') {
        if (selectedGroupFilter === 'admin') {
          if (u.role !== 'supervisor') return false;
        } else {
          if (u.groupCode !== selectedGroupFilter) return false;
        }
      }

      // Search Query
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

  // Statistics
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.isActive).length;
  const inactiveCount = users.filter((u) => !u.isActive).length;
  const g1Count = users.filter((u) => u.groupCode === 'G1').length;
  const g2Count = users.filter((u) => u.groupCode === 'G2').length;
  const g3Count = users.filter((u) => u.groupCode === 'G3').length;
  const g4Count = users.filter((u) => u.groupCode === 'G4').length;

  return (
    <div className="space-y-6 font-['Cairo',_sans-serif] text-right" dir="rtl">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl border-2 flex items-center gap-2.5 font-bold text-sm animate-fadeIn ${
            toastMsg.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
              : toastMsg.type === 'error'
              ? 'bg-red-950/95 border-red-500 text-red-200'
              : 'bg-blue-950/95 border-blue-500 text-blue-200'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
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
              عرض كافة حسابات الطلاب الـ 60 والمشرف، التحكم في كلمات المرور والتفعيل، وتوزيع المجموعات البحثية الأربعة.
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
            <span>{copiedAll ? 'تم النسخ!' : 'نسخ قائمة اليوزر'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/60 text-emerald-300 hover:text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تصدير Excel / CSV</span>
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
          <span className="text-[11px] font-black text-slate-900 font-['Cairo'] block mb-1">المجموعة G1 (تنافسي/فوري)</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-['Cairo']">{g1Count}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-200 border border-slate-300 shadow-md">
          <span className="text-[11px] font-black text-slate-900 font-['Cairo'] block mb-1">المجموعة G2 (تنافسي/مرجأ)</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-['Cairo']">{g2Count}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-200 border border-slate-300 shadow-md">
          <span className="text-[11px] font-black text-slate-900 font-['Cairo'] block mb-1">المجموعة G3 (تعاوني/فوري)</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-['Cairo']">{g3Count}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-200 border border-slate-300 shadow-md">
          <span className="text-[11px] font-black text-slate-900 font-['Cairo'] block mb-1">المجموعة G4 (تعاوني/مرجأ)</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-['Cairo']">{g4Count}</span>
        </div>

        {/* Reset All Button */}
        <button
          type="button"
          onClick={() => {
            if (window.confirm('هل أنت متأكد من تصفير وإعادة تهيئة إجابات ودرجات المستويات لجميع الطلاب؟ (سيتم الإبقاء على نتائج الاختبار القبلي)')) {
              resetAllLevelsProgressKeepingPreTest();
              addActivityLog('قام المشرف بإعادة تهيئة مستويات الطلاب مع الإبقاء على الاختبار القبلي', 'admin', 'danger');
              showToast('✓ تم إعادة تهيئة مستويات الطلاب بنجاح', 'success');
              setUsers(getPortalUsers());
            }
          }}
          className="p-3 rounded-2xl bg-red-950/60 border border-red-500 text-red-200 text-center font-black text-xs hover:bg-red-900 transition cursor-pointer flex flex-col items-center justify-center"
        >
          <RotateCcw className="w-5 h-5 mb-1" />
          تصفير جميع المستويات
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#080b18] border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باليوزر (G1_Cp_01) أو اسم الطالب أو المجموعة..."
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

        {/* Group Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedGroupFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedGroupFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            الكل ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setSelectedGroupFilter('G1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black font-['Cairo'] transition-all cursor-pointer ${
              selectedGroupFilter === 'G1'
                ? 'bg-slate-300 text-slate-950 shadow-md border border-slate-400'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300 border border-slate-300'
            }`}
          >
            G1 (تنافسي/فوري)
          </button>

          <button
            type="button"
            onClick={() => setSelectedGroupFilter('G2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black font-['Cairo'] transition-all cursor-pointer ${
              selectedGroupFilter === 'G2'
                ? 'bg-slate-300 text-slate-950 shadow-md border border-slate-400'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300 border border-slate-300'
            }`}
          >
            G2 (تنافسي/مرجأ)
          </button>

          <button
            type="button"
            onClick={() => setSelectedGroupFilter('G3')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black font-['Cairo'] transition-all cursor-pointer ${
              selectedGroupFilter === 'G3'
                ? 'bg-slate-300 text-slate-950 shadow-md border border-slate-400'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300 border border-slate-300'
            }`}
          >
            G3 (تعاوني/فوري)
          </button>

          <button
            type="button"
            onClick={() => setSelectedGroupFilter('G4')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black font-['Cairo'] transition-all cursor-pointer ${
              selectedGroupFilter === 'G4'
                ? 'bg-slate-300 text-slate-950 shadow-md border border-slate-400'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300 border border-slate-300'
            }`}
          >
            G4 (تعاوني/مرجأ)
          </button>

          <button
            type="button"
            onClick={() => setSelectedGroupFilter('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedGroupFilter === 'admin'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-emerald-300 hover:text-white border border-slate-800'
            }`}
          >
            المشرف / الأدمن
          </button>
        </div>
      </div>

      {/* Users Table / Grid */}
      <div className="rounded-2xl border border-slate-800 bg-[#090c1e] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#0e1428] border-b border-slate-800 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">اسم المستخدم (اليوزر)</th>
                <th className="py-3.5 px-4">اسم الطالب / الحساب</th>
                <th className="py-3.5 px-4">المجموعة البحثية والنمط</th>
                <th className="py-3.5 px-4">كلمة المرور</th>
                <th className="py-3.5 px-4 text-center">حالة الحساب</th>
                <th className="py-3.5 px-4 text-center">الإجراءات والتحكم</th>
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
                    {/* Index */}
                    <td className="py-3 px-4 text-center text-slate-500 font-bold text-[11px]">
                      {index + 1}
                    </td>

                    {/* Username */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm px-2.5 py-1 rounded-lg border border-slate-700" style={{ backgroundColor: '#e1dbdb', color: '#000000' }}>
                          {user.username}
                        </span>
                        {isSupervisor && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold">
                            مشرف عام
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Full Name */}
                    <td className="py-3 px-4 font-medium" style={{ color: '#202227', fontFamily: 'Arial, sans-serif' }}>
                      {user.fullName || user.username}
                    </td>

                    {/* Group & Learning Mode */}
                    <td className="py-3 px-4">
                      {user.groupCode ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-lg bg-slate-200 border border-slate-300 font-black text-slate-900 font-['Cairo'] text-xs inline-block">
                              {meta?.name || user.groupName || user.groupCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <span>{meta?.learningMode}</span>
                            <span>•</span>
                            <span>{meta?.feedbackMode}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">حساب إداري عام</span>
                      )}
                    </td>

                    {/* Password with View Toggle */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-amber-300 font-bold tracking-wider text-xs">
                          {isPwVisible ? user.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(user.id)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                          title={isPwVisible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                        >
                          {isPwVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Account Status Switch */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(user)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                          user.isActive
                            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900'
                            : 'bg-red-950/80 border-red-500/60 text-red-300 hover:bg-red-900'
                        }`}
                        style={{ backgroundColor: '#18ff1b', color: '#242927' }}
                      >
                        {user.isActive ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" style={{ color: '#242927' }} />
                            <span style={{ color: '#242927' }}>نشط</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" style={{ color: '#242927' }} />
                            <span style={{ color: '#242927' }}>معطل</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Direct Login As Student */}
                        {onLoginAsStudent && user.role !== 'supervisor' && (
                          <button
                            type="button"
                            onClick={() => onLoginAsStudent(user.username)}
                            className="p-1.5 rounded-lg bg-blue-950/70 hover:bg-blue-900 border border-blue-500/50 text-blue-300 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                            title="تسجيل الدخول الفوري بهذا اليوزر لتجربة المنظومة كطالب"
                          >
                            <LogIn className="w-3.5 h-3.5" style={{ color: '#00ffd1' }} />
                          </button>
                        )}

                        {/* Copy credentials */}
                        <button
                          type="button"
                          onClick={() => handleCopySingle(user)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 cursor-pointer transition-all"
                          title="نسخ بيانات الدخول"
                        >
                          {copiedId === user.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" style={{ color: '#566a4c' }} />
                          ) : (
                            <Copy className="w-3.5 h-3.5" style={{ color: '#566a4c' }} />
                          )}
                        </button>

                        {/* Edit User */}
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-500/50 text-amber-300 hover:text-white cursor-pointer transition-all"
                          title="تعديل بيانات وكلمة مرور اليوزر"
                        >
                          <Edit className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                        </button>

                        {/* Reset password */}
                        <button
                          type="button"
                          onClick={() => handleResetPassword(user)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 cursor-pointer transition-all"
                          title="إعادة تعيين كلمة المرور الافتراضية"
                        >
                          <RefreshCw className="w-3.5 h-3.5" style={{ color: '#ff0004' }} />
                        </button>

                        {/* Reset Student Progress */}
                        {user.username !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleResetStudentProgress(user)}
                            className="p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer"
                            style={{ backgroundColor: '#57ff43', color: '#161e11' }}
                            title="تهيئة بيانات الطالب (تصفير الدرجات والتقدم)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" style={{ color: '#161e11' }} />
                          </button>
                        )}

                        {/* Delete User (safe) */}
                        {user.username !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 rounded-lg border transition-all cursor-pointer"
                            style={{ backgroundColor: '#0dffee', color: '#627eff' }}
                            title="حذف المستخدم"
                          >
                            <Trash2 className="w-3.5 h-3.5" style={{ color: '#627eff' }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-bold">لا يوجد أي مستخدم مطابق لمعايير البحث</p>
                    <p className="text-xs text-slate-500 mt-1">تأكد من كتابة اسم المستخدم أو إزالة الفلاتر</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0c1026] border-2 border-amber-500/70 p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white font-['Tajawal']">
                  تعديل بيانات اليوزر: {editingUser.username}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المستخدم (اليوزر):</label>
                <input
                  type="text"
                  disabled
                  value={editingUser.username}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 font-bold text-xs cursor-not-allowed"
                />
              </div>

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
                  className="w-4 h-4 text-emerald-500 accent-emerald-500 rounded"
                />
                <label htmlFor="chk-edit-active" className="text-xs font-bold text-slate-200 cursor-pointer">
                  حساب نشط ومصرح له بالدخول للمنظومة
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0c1026] border-2 border-blue-500/70 p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-black text-white font-['Tajawal']">
                  إضافة مستخدم جديد إلى المنظومة
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    اسم المستخدم (اليوزر): <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="مثال: G1_Cp_16 أو student1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    كلمة المرور: <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="مثال: Cp@9116 أو 123456"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold text-xs outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الكامل للطالب:</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="الاسم الرباعي للطالب..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نوع الحساب:</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
                  >
                    <option value="member">طالب (عضو مجموعة)</option>
                    <option value="supervisor">مشرف / أدمن</option>
                  </select>
                </div>

                {newRole === 'member' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">المجموعة البحثية:</label>
                    <select
                      value={newGroupCode}
                      onChange={(e) => setNewGroupCode(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
                    >
                      <option value="G1">المجموعة 1: تنافسي / فوري</option>
                      <option value="G2">المجموعة 2: تنافسي / مرجأ</option>
                      <option value="G3">المجموعة 3: تعاوني / فوري</option>
                      <option value="G4">المجموعة 4: تعاوني / مرجأ</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black cursor-pointer shadow-md"
                >
                  إضافة المستخدم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
