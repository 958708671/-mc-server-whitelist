'use client';

import { useState, useEffect } from 'react';

interface WhitelistPlayer {
  id: number;
  minecraft_id: string;
  age: number | null;
  contact: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export default function WhitelistPage() {
  const [players, setPlayers] = useState<WhitelistPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0 });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWhitelist();
  }, []);

  const fetchWhitelist = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const url = searchTerm 
        ? `/api/whitelist?search=${encodeURIComponent(searchTerm)}`
        : '/api/whitelist';
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setPlayers(result.data);
        calculateStats(result.data);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('获取白名单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: WhitelistPlayer[]) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    setStats({
      total: data.length,
      today: data.filter(p => new Date(p.reviewed_at || p.created_at) >= todayStart).length,
      thisWeek: data.filter(p => new Date(p.reviewed_at || p.created_at) >= weekStart).length
    });
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
      alert('请先选择要移除的玩家');
      return;
    }
    if (!confirm(`确定要从白名单移除 ${selectedIds.size} 个玩家吗？`)) return;
    
    setProcessing(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/whitelist/${id}`, { method: 'DELETE' });
      }
      alert('批量移除成功');
      fetchWhitelist();
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
      ['游戏ID', '年龄', '联系方式', '审核人', '通过时间'].join(','),
      ...exportData.map(p => [
        p.minecraft_id,
        p.age || '未填写',
        p.contact,
        p.reviewed_by || '-',
        formatDate(p.reviewed_at)
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `白名单列表_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    link.click();
  };

  const handleSearch = () => {
    fetchWhitelist(search);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>📜</span> 白名单列表
          </h1>
          <p className="text-gray-400 text-sm mt-1">查看已通过审核的玩家</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-xl p-4">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-green-400">{stats.total}</div>
          <div className="text-gray-400 text-sm">总人数</div>
        </div>
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-xl p-4">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-2xl font-bold text-blue-400">{stats.today}</div>
          <div className="text-gray-400 text-sm">今日新增</div>
        </div>
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-xl p-4">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-purple-400">{stats.thisWeek}</div>
          <div className="text-gray-400 text-sm">本周新增</div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="搜索玩家ID..."
          className="flex-1 min-w-[200px] bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
        >
          搜索
        </button>
        <button
          onClick={() => { setSearch(''); fetchWhitelist(); }}
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
              className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center gap-2"
            >
              🗑️ 移除选中 {selectedIds.size > 0 && `(${selectedIds.size})`}
            </button>
          </>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-4xl animate-bounce">📜</div>
        </div>
      ) : players.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-400 text-lg">暂无数据</p>
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
                <th className="text-left px-4 py-3 text-gray-400 font-medium">年龄</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">联系方式</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">审核人</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">通过时间</th>
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
                  <td className="px-4 py-3 text-gray-300">{player.age || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">{player.contact}</td>
                  <td className="px-4 py-3 text-gray-300">{player.reviewed_by || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">{formatDate(player.reviewed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
