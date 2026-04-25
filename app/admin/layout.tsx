'use client';
import React, { useState, useEffect, useRef } from 'react';
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
      <div className="bg-black border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-white">修改密码</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm mb-2">原密码</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/50 transition-colors"
              placeholder="请输入原密码"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm mb-2">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/50 transition-colors"
              placeholder="请输入新密码"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm mb-2">确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/50 transition-colors"
              placeholder="请再次输入新密码"
            />
          </div>
          
          {message && (
            <div className="text-sm text-white">
              {message}
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-transparent border border-white/20 hover:bg-white/10 text-white rounded-xl transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
          >
            {loading ? '修改中...' : '确认修改'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AdminInfo {
  user: string;
  adminId: number;
  qq: string;
  isOwner: boolean;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminInfo');
    if (savedAdmin) {
      try {
        const info = JSON.parse(savedAdmin);
        setAdminInfo(info);
      } catch (e) {
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setSidebarCollapsed(false);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setSidebarCollapsed(true);
    }, 300);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminInfo');
    window.location.href = '/';
  };

  const adminMenuItems = [
    { category: '审核管理', items: [
      { name: '白名单审核', path: '/admin/applications' },
      { name: '投诉处理', path: '/admin/complaints' },
    ]},
    { category: '玩家管理', items: [
      { name: '白名单列表', path: '/admin/whitelist' },
      { name: '黑名单管理', path: '/admin/blacklist' },
    ]},
    { category: '内容管理', items: [
      { name: '官网编辑', path: '/admin/website' },
      { name: '公告管理', path: '/admin/announcements' },
      { name: '活动管理', path: '/admin/events' },
    ]},
    { category: '数据统计', items: [
      { name: '数据面板', path: '/admin/statistics' },
    ]},
  ];

  const ownerMenuItems = [
    { category: '审核管理', items: [
      { name: '白名单审核', path: '/admin/applications' },
      { name: '投诉监管', path: '/admin/complaints-supervise' },
    ]},
    { category: '玩家管理', items: [
      { name: '白名单列表', path: '/admin/whitelist' },
      { name: '黑名单管理', path: '/admin/blacklist' },
    ]},
    { category: '内容管理', items: [
      { name: '官网编辑', path: '/admin/website' },
      { name: '公告管理', path: '/admin/announcements' },
      { name: '活动管理', path: '/admin/events' },
    ]},
    { category: '数据统计', items: [
      { name: '数据面板', path: '/admin/statistics' },
    ]},
    { category: '服主专属', items: [
      { name: '管理员管理', path: '/admin/admins' },
      { name: '操作日志', path: '/admin/logs' },
      { name: '系统设置', path: '/admin/settings' },
    ]},
  ];

  if (!adminInfo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-white font-bold">加载中...</div>
        </div>
      </div>
    );
  }

  const menuCategories = adminInfo.isOwner ? ownerMenuItems : adminMenuItems;

  return (
    <div className="h-screen overflow-hidden relative" style={{
      backgroundImage: 'url("/images/管理员后台背景图.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* 左侧边栏 */}
      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${
          sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
        } absolute left-0 top-0 bg-black/50 backdrop-blur-xl border-r border-white/20 transition-all duration-300 flex flex-col z-20 h-full w-72`}
      >
        <div className="p-4 border-b border-white/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                管理后台
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 bg-white/20 border border-white/20 rounded-lg overflow-hidden flex items-center justify-center">
                  {adminInfo.qq ? (
                    <img
                      src={`https://q.qlogo.cn/g?b=qq&nk=${adminInfo.qq}&s=100`}
                      alt="QQ头像"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full bg-white/20 flex items-center justify-center text-sm font-bold text-white';
                          fallback.textContent = adminInfo.user.charAt(0).toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                      {adminInfo.user.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{adminInfo.user}</p>
                  <p className="text-white/60 text-xs">{adminInfo.isOwner ? '服主' : '管理员'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-3">
          {menuCategories.map((category, idx) => (
            <CategoryModule
              key={idx}
              category={category}
              pathname={pathname}
              collapsed={false}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-white/20 space-y-2 flex-shrink-0">
          <Link
            href="/"
            className="w-full flex items-center justify-center px-4 py-2.5 bg-green-500/90 border border-green-400/50 hover:bg-green-500 text-white rounded-xl transition-all text-sm font-medium"
          >
            <span>返回主页</span>
          </Link>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-500/90 border border-blue-400/50 hover:bg-blue-500 text-white rounded-xl transition-all text-sm font-medium"
          >
            <span>修改密码</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-red-500/90 border border-red-400/50 hover:bg-red-500 text-white rounded-xl transition-all font-medium"
          >
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* 侧边栏展开按钮 */}
      {sidebarCollapsed && (
        <div
          onMouseEnter={handleMouseEnter}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 cursor-pointer"
        >
          <button
            className="w-6 h-32 bg-black/50 backdrop-blur-xl border-y border-r border-white/20 rounded-r-lg flex items-center justify-center hover:bg-white/15 transition-all"
          >
            <svg className="w-3 h-3 text-white/50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5l8 7-8 7V5z" />
            </svg>
          </button>
        </div>
      )}

      <main className="absolute inset-0 overflow-y-auto overflow-x-hidden z-10">
        <div className={`h-full ${pathname === '/admin/website' ? '' : 'p-6'}`}>{children}</div>
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

function CategoryModule({ category, pathname, collapsed }: { category: any; pathname: string; collapsed: boolean }) {
  const [expanded, setExpanded] = useState(true);
  
  const isActive = category.items.some((item: any) => pathname === item.path);
  
  if (collapsed) {
    return (
      <div className="space-y-1">
        {category.items.map((item: any) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center justify-center px-3 py-2.5 rounded-xl transition-all ${
              pathname === item.path
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="font-medium text-sm">{item.name}</span>
          </Link>
        ))}
      </div>
    );
  }
  
  return (
    <div className={`border rounded-xl transition-all duration-300 ${
      isActive
        ? 'border-white/50 bg-transparent'
        : 'border-white/20 hover:border-white/50'
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className={`font-semibold text-sm ${
          isActive ? 'text-white' : 'text-white/60'
        }`}>
          {category.category}
        </span>
        <svg 
          className={`w-3 h-3 text-white/60 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M8 5l8 7-8 7V5z" />
        </svg>
      </button>
      
      {expanded && (
        <div className="px-3 pb-3 space-y-1">
          {category.items.map((item: any) => (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                pathname === item.path
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
