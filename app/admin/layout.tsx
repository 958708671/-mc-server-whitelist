'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function PasswordModal({ adminId, onClose }: { adminId: number; onClose: () => void }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage('请填写所有字段');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage('两次输入的新密码不一致');
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage('密码长度至少6位');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId,
          oldPassword,
          newPassword
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setMessage('密码修改成功！');
        setTimeout(() => onClose(), 1500);
      } else {
        setMessage(result.message || '修改失败');
      }
    } catch (error) {
      setMessage('修改失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-xl">
            🔑
          </div>
          <h2 className="text-xl font-bold text-white">修改密码</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">原密码</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm mb-2">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm mb-2">确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>
        </div>
        
        {message && (
          <div className={`mt-4 p-3 rounded-xl text-sm flex items-center gap-2 ${
            message.includes('成功') 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}>
            <span>{message.includes('成功') ? '✅' : '❌'}</span>
            {message}
          </div>
        )}
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? '修改中...' : '确认修改'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [adminInfo, setAdminInfo] = useState<{
    user: string;
    adminId: number;
    isOwner: boolean;
  } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminInfo');
    if (!savedAdmin) {
      window.location.href = '/';
      return;
    }
    try {
      const info = JSON.parse(savedAdmin);
      setAdminInfo(info);
    } catch (e) {
      window.location.href = '/';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminInfo');
    window.location.href = '/';
  };

  const adminMenuItems = [
    { category: '📋 审核管理', items: [
      { name: '白名单审核', path: '/admin/applications', icon: '📝', desc: '审核玩家白名单申请' },
      { name: '投诉处理', path: '/admin/complaints', icon: '📢', desc: '处理玩家投诉举报' },
    ]},
    { category: '👥 玩家管理', items: [
      { name: '白名单列表', path: '/admin/whitelist', icon: '📜', desc: '查看已通过玩家' },
      { name: '黑名单管理', path: '/admin/blacklist', icon: '🚫', desc: '管理黑名单玩家' },
    ]},
    { category: '🌐 内容管理', items: [
      { name: '官网编辑', path: '/admin/website', icon: '🌐', desc: '编辑官网内容' },
      { name: '公告管理', path: '/admin/announcements', icon: '📢', desc: '发布服务器公告' },
      { name: '活动管理', path: '/admin/events', icon: '🎉', desc: '管理服务器活动' },
    ]},
    { category: '📊 数据统计', items: [
      { name: '数据面板', path: '/admin/statistics', icon: '📊', desc: '查看数据统计' },
    ]},
  ];

  const ownerMenuItems = [
    { category: '📋 审核管理', items: [
      { name: '白名单审核', path: '/admin/applications', icon: '📝', desc: '审核玩家白名单申请' },
      { name: '投诉监管', path: '/admin/complaints-supervise', icon: '👁️', desc: '监管所有投诉案件' },
    ]},
    { category: '👥 玩家管理', items: [
      { name: '白名单列表', path: '/admin/whitelist', icon: '📜', desc: '查看已通过玩家' },
      { name: '黑名单管理', path: '/admin/blacklist', icon: '🚫', desc: '管理黑名单玩家' },
    ]},
    { category: '🌐 内容管理', items: [
      { name: '官网编辑', path: '/admin/website', icon: '🌐', desc: '编辑官网内容' },
      { name: '公告管理', path: '/admin/announcements', icon: '📢', desc: '发布服务器公告' },
      { name: '活动管理', path: '/admin/events', icon: '🎉', desc: '管理服务器活动' },
    ]},
    { category: '📊 数据统计', items: [
      { name: '数据面板', path: '/admin/statistics', icon: '📊', desc: '查看全局数据统计' },
    ]},
    { category: '👑 服主专属', items: [
      { name: '管理员管理', path: '/admin/admins', icon: '👥', desc: '管理管理员账号' },
      { name: '操作日志', path: '/admin/logs', icon: '📝', desc: '查看所有操作记录' },
      { name: '系统设置', path: '/admin/settings', icon: '⚙️', desc: '系统配置' },
    ]},
  ];

  if (!adminInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce" suppressHydrationWarning>⛏️</div>
          <div className="text-2xl text-white font-bold">加载中...</div>
        </div>
      </div>
    );
  }

  const menuCategories = adminInfo.isOwner ? ownerMenuItems : adminMenuItems;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex overflow-hidden">
      <aside
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } bg-gray-900/80 border-r-2 border-gray-700 transition-all duration-300 flex flex-col flex-shrink-0`}
      >
        <div className="p-4 border-b-2 border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">⚔️</span>
                  管理后台
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-sm font-bold text-white">
                    {adminInfo.user.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">{adminInfo.user}</p>
                    {adminInfo.isOwner && (
                      <span className="inline-block px-2 py-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 text-xs rounded border border-amber-500/30">
                        👑 服主
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-all"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
          {menuCategories.map((category, idx) => (
            <div key={idx} className="mb-4">
              {!sidebarCollapsed && (
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  {category.category}
                </h3>
              )}
              <div className="space-y-1">
                {category.items.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                      pathname === item.path
                        ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{item.name}</span>
                        <p className="text-xs text-gray-500 truncate">{item.desc}</p>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t-2 border-gray-700 space-y-2 flex-shrink-0">
          <Link
            href="/"
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl transition-all text-sm"
          >
            <span>🏠</span>
            {!sidebarCollapsed && <span>返回主页</span>}
          </Link>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all text-sm"
          >
            <span>🔑</span>
            {!sidebarCollapsed && <span>修改密码</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl transition-all text-sm"
          >
            <span>🚪</span>
            {!sidebarCollapsed && <span>退出登录</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-6">{children}</div>
      </main>

      {showPasswordModal && (
        <PasswordModal 
          adminId={adminInfo.adminId}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
}
