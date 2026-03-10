'use client';

import { useState, useEffect } from 'react';
import BlacklistModal from '../components/BlacklistModal';

interface WhitelistPlayer {
  id: number;
  minecraft_id: string;
  age: number | null;
  contact: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  ip_address?: string;
}

export default function WhitelistPage() {
  const [players, setPlayers] = useState<WhitelistPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0 });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [blacklistingId, setBlacklistingId] = useState<number | null>(null);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [blacklistTarget, setBlacklistTarget] = useState<{id: number; minecraftId: string; ipAddress?: string} | null>(null);

  useEffect(() => {
    fetchWhitelist();
  }, []);

  useEffect(() => {
    if (revokingId !== null) {
      const timeout = setTimeout(() => {
        console.log('安全重置revokingId');
        setRevokingId(null);
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [revokingId]);

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

  const handleRevoke = async (id: number, minecraftId: string) => {
    if (!confirm(`确定要撤销 ${minecraftId} 的白名单审核吗？\n该操作将：\n1. 把申请重新放回待审核列表\n2. 从服务器白名单移除该玩家`)) return;
    
    setRevokingId(id);
    let message = '';
    
    try {
      const response = await fetch(`/api/whitelist/${id}/revoke`, { method: 'POST' });
      
      if (!response.ok) {
        throw new Error('网络请求失败');
      }
      
      const result = await response.json();
      if (result.success) {
        message = '撤销成功，申请已回到待审核状态';
      } else {
        message = result.message || '撤销失败';
      }
    } catch (error) {
      console.error('撤销操作失败:', error);
      message = '操作失败，请重试';
    } finally {
      setRevokingId(null);
      // 强制刷新页面
      setTimeout(() => {
        fetchWhitelist();
        console.log('白名单列表已刷新');
      }, 100);
      if (message) {
        setTimeout(() => alert(message), 200);
      }
    }
  };

  const handleAddToBlacklistClick = (id: number, minecraftId: string, ipAddress?: string) => {
    setBlacklistTarget({ id, minecraftId, ipAddress });
    setShowBlacklistModal(true);
  };

  const handleBlacklistConfirm = async (reason: string, duration: number | null, isPermanent: boolean) => {
    if (!blacklistTarget) return;
    
    const id = blacklistTarget.id;
    const minecraftId = blacklistTarget.minecraftId;
    const ipAddress = blacklistTarget.ipAddress;
    
    setShowBlacklistModal(false);
    setBlacklistingId(id);
    
    try {
      const response = await fetch('/api/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minecraft_id: minecraftId,
          ip_address: ipAddress,
          reason: reason,
          banned_by: '管理员',
          whitelist_id: id,
          duration: duration,
          is_permanent: isPermanent
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const durationText = isPermanent ? '永久' : duration ? `${Math.round(duration / 1440)}天` : '永久';
        alert(`已拉入黑名单并封禁IP\n\n游戏ID：${minecraftId}\nIP地址：${ipAddress || '未知'}\n封禁原因：${reason}\n封禁时长：${durationText}\n\n服务器封禁结果：${result.banResult?.message || '未执行'}`);
        fetchWhitelist();
      } else {
        alert(result.message || '操作失败');
      }
    } catch (error) {
      console.error('拉黑操作失败:', error);
      alert('操作失败，请重试');
    } finally {
      setBlacklistingId(null);
      setBlacklistTarget(null);
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
      minute: '2-digit',
      second: '2-digit',
      hour12: false
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
              📥 {selectedIds.size > 0 ? `选中导出 (${selectedIds.size})` : '导出全部'}
            </button>
            <button
              onClick={handleBatchRemove}
              disabled={selectedIds.size === 0 || processing}
              className={`px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center gap-2`}
            >
              {processing ? '处理中...' : <>🗑️ 选中删除 {selectedIds.size > 0 && `(${selectedIds.size})`}</>}
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
                  <td className="px-4 py-3 text-gray-300">{player.age || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">{player.contact}</td>
                  <td className="px-4 py-3 text-gray-300">{player.reviewed_by || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">{formatDate(player.reviewed_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRevoke(player.id, player.minecraft_id)}
                        disabled={revokingId === player.id}
                        className={`px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm rounded-lg transition-all flex items-center gap-2`}
                      >
                        {revokingId === player.id ? '处理中...' : '撤销'}
                      </button>
                      <button
                        onClick={() => handleAddToBlacklistClick(player.id, player.minecraft_id, player.ip_address)}
                        disabled={blacklistingId === player.id}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded-lg transition-all"
                      >
                        {blacklistingId === player.id ? '处理中...' : '拉黑'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {showBlacklistModal && blacklistTarget && (
        <BlacklistModal
          isOpen={showBlacklistModal}
          onClose={() => {
            setShowBlacklistModal(false);
            setBlacklistTarget(null);
          }}
          onConfirm={handleBlacklistConfirm}
          minecraftId={blacklistTarget.minecraftId}
          ipAddress={blacklistTarget.ipAddress}
          loading={blacklistingId !== null}
        />
      )}
    </div>
  );
}
