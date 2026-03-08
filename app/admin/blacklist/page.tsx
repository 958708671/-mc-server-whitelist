'use client';

import { useState, useEffect } from 'react';

interface BlacklistPlayer {
  id: number;
  minecraft_id: string;
  reason: string;
  banned_by: string | null;
  created_at: string;
  expires_at: string | null;
}

export default function BlacklistPage() {
  const [players, setPlayers] = useState<BlacklistPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    minecraft_id: '',
    reason: ''
  });
  const [saving, setSaving] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ user: string; adminId: number } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminInfo');
    if (savedAdmin) {
      setAdminInfo(JSON.parse(savedAdmin));
    }
    fetchBlacklist();
  }, []);

  const fetchBlacklist = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const url = searchTerm 
        ? `/api/blacklist?search=${encodeURIComponent(searchTerm)}`
        : '/api/blacklist';
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setPlayers(result.data);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('获取黑名单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === players.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(players.map(p => p.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBatchRemove = async () => {
    if (selectedIds.size === 0) {
      alert('请先选择要解除封禁的玩家');
      return;
    }
    if (!confirm(`确定要解除 ${selectedIds.size} 个玩家的封禁吗？`)) return;
    
    setProcessing(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/blacklist/${id}`, { method: 'DELETE' });
      }
      alert('批量解除成功');
      fetchBlacklist();
    } catch (error) {
      alert('操作失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = () => {
    const exportData = selectedIds.size > 0 
      ? players.filter(p => selectedIds.has(p.id))
      : players;
    
    if (exportData.length === 0) {
      alert('没有可导出的数据');
      return;
    }
    
    const csvContent = [
      ['游戏ID', '封禁原因', '操作人', '封禁时间', '解封时间'].join(','),
      ...exportData.map(p => [
        p.minecraft_id,
        (p.reason || '').replace(/"/g, '""'),
        p.banned_by || '系统',
        formatDate(p.created_at),
        formatDate(p.expires_at)
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `黑名单列表_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    link.click();
  };

  const handleSearch = () => {
    fetchBlacklist(search);
  };

  const handleAdd = async () => {
    if (!formData.minecraft_id) {
      alert('请填写游戏ID');
      return;
    }
    if (!adminInfo) {
      alert('请先登录');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minecraft_id: formData.minecraft_id,
          reason: formData.reason,
          banned_by: adminInfo.user,
          banned_by_id: adminInfo.adminId
        })
      });
      const result = await response.json();
      if (result.success) {
        setShowAddModal(false);
        setFormData({ minecraft_id: '', reason: '' });
        fetchBlacklist();
      } else {
        alert(result.message || '添加失败');
      }
    } catch (error) {
      alert('添加失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: number, minecraftId: string) => {
    if (!confirm(`确定要将 ${minecraftId} 从黑名单移除吗？`)) return;
    
    try {
      const response = await fetch(`/api/blacklist/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        fetchBlacklist();
      } else {
        alert(result.message || '移除失败');
      }
    } catch (error) {
      alert('移除失败，请重试');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🚫</span> 黑名单管理
          </h1>
          <p className="text-gray-400 text-sm mt-1">管理被禁止加入的玩家</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all flex items-center gap-2"
        >
          <span>➕</span> 添加黑名单
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="搜索玩家ID..."
          className="flex-1 min-w-[200px] bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all"
        >
          搜索
        </button>
        <button
          onClick={() => { setSearch(''); fetchBlacklist(); }}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
        >
          重置
        </button>
        {players.length > 0 && (
          <>
            <button
              onClick={handleExport}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all flex items-center gap-2"
            >
              📥 {selectedIds.size > 0 ? `导出选中 (${selectedIds.size})` : '导出全部'}
            </button>
            <button
              onClick={handleBatchRemove}
              disabled={selectedIds.size === 0 || processing}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center gap-2"
            >
              🔓 批量解封 {selectedIds.size > 0 && `(${selectedIds.size})`}
            </button>
          </>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-4xl animate-bounce">🚫</div>
        </div>
      ) : players.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-gray-400 text-lg">黑名单为空</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === players.length && players.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                  />
                </th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">游戏ID</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">封禁原因</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">操作人</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">封禁时间</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {players.map((player) => (
                <tr key={player.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(player.id)}
                      onChange={() => toggleSelect(player.id)}
                      className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{player.minecraft_id}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm max-w-xs truncate">{player.reason || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">{player.banned_by || '系统'}</td>
                  <td className="px-4 py-3 text-gray-300">{formatDate(player.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemove(player.id, player.minecraft_id)}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all text-sm"
                    >
                      解除封禁
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🚫</span> 添加黑名单
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">游戏ID *</label>
                <input
                  type="text"
                  value={formData.minecraft_id}
                  onChange={(e) => setFormData({ ...formData, minecraft_id: e.target.value })}
                  placeholder="输入玩家游戏ID"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">封禁原因</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="输入封禁原因"
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? '添加中...' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
