'use client';

import { useState, useEffect } from 'react';

interface Settings {
  server_name: string;
  server_description: string;
  contact_qq: string;
  contact_email: string;
  whitelist_enabled: string;
  registration_enabled: string;
  maintenance_mode: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    server_name: '',
    server_description: '',
    contact_qq: '',
    contact_email: '',
    whitelist_enabled: 'true',
    registration_enabled: 'true',
    maintenance_mode: 'false'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings');
      const result = await response.json();
      if (result.success) {
        setSettings(prev => ({ ...prev, ...result.data }));
      }
    } catch (error) {
      console.error('获取设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const result = await response.json();
      if (result.success) {
        setMessage('设置保存成功！');
      } else {
        setMessage(result.message || '保存失败');
      }
    } catch (error) {
      setMessage('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-bounce">⚙️</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>⚙️</span> 系统设置
        </h1>
        <p className="text-gray-400 text-sm mt-1">配置服务器基本信息和功能开关</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🌐</span> 服务器信息
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2 font-medium">服务器名称</label>
              <input
                type="text"
                value={settings.server_name}
                onChange={(e) => setSettings({ ...settings, server_name: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm mb-2 font-medium">服务器描述</label>
              <textarea
                value={settings.server_description}
                onChange={(e) => setSettings({ ...settings, server_description: e.target.value })}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>📞</span> 联系方式
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2 font-medium">联系QQ</label>
              <input
                type="text"
                value={settings.contact_qq}
                onChange={(e) => setSettings({ ...settings, contact_qq: e.target.value })}
                placeholder="QQ号码或群号"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm mb-2 font-medium">联系邮箱</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                placeholder="admin@example.com"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 lg:col-span-2">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🔧</span> 功能开关
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl">
              <div>
                <p className="text-white font-medium">白名单系统</p>
                <p className="text-gray-400 text-sm">开启后只有白名单玩家可进入</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.whitelist_enabled === 'true'}
                  onChange={(e) => setSettings({ ...settings, whitelist_enabled: e.target.checked ? 'true' : 'false' })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl">
              <div>
                <p className="text-white font-medium">开放申请</p>
                <p className="text-gray-400 text-sm">允许玩家提交白名单申请</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.registration_enabled === 'true'}
                  onChange={(e) => setSettings({ ...settings, registration_enabled: e.target.checked ? 'true' : 'false' })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl">
              <div>
                <p className="text-white font-medium">维护模式</p>
                <p className="text-gray-400 text-sm">开启后网站显示维护页面</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode === 'true'}
                  onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked ? 'true' : 'false' })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${
          message.includes('成功') 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          <span>{message.includes('成功') ? '✅' : '❌'}</span>
          {message}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={fetchSettings}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
        >
          重置
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? '保存中...' : '保存设置'}
        </button>
      </div>
    </div>
  );
}
