'use client';

import { useState, useEffect } from 'react';

interface BlacklistEntry {
  id: number;
  minecraft_id: string;
  ip_address: string | null;
  reason: string;
  banned_by: string;
  banned_by_id: number | null;
  is_permanent: boolean;
  duration_minutes: number | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export default function BlacklistPage() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBlacklist();
  }, [pagination.page]);

  const fetchBlacklist = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const url = searchTerm 
        ? `/api/blacklist?search=${encodeURIComponent(searchTerm)}&page=${pagination.page}&limit=${pagination.limit}`
        : `/api/blacklist?page=${pagination.page}&limit=${pagination.limit}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setEntries(result.entries);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('获取黑名单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchBlacklist(search);
  };

  const handleRemove = async (id: number, minecraftId: string) => {
    if (!confirm(`确定要将 ${minecraftId} 从黑名单移除吗？\n\n该操作将：\n1. 从黑名单移除\n2. 解封该IP地址`)) return;
    
    setRemovingId(id);
    
    try {
      const response = await fetch(`/api/blacklist?id=${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`已从黑名单移除并解封IP\n\n游戏ID：${minecraftId}`);
        fetchBlacklist();
      } else {
        alert(result.message || '操作失败');
      }
    } catch (error) {
      console.error('移除黑名单失败:', error);
      alert('操作失败，请重试');
    } finally {
      setRemovingId(null);
    }
  };

  const handleRevoke = async (id: number, minecraftId: string) => {
    if (!confirm(`确定要撤回 ${minecraftId} 的封禁吗？\n\n该操作将：\n1. 从黑名单移除\n2. 解封该IP地址\n3. 用户需重新提交白名单申请`)) return;
    
    setRevokingId(id);
    
    try {
      const response = await fetch(`/api/blacklist?id=${id}&action=revoke`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`已撤回封禁\n\n游戏ID：${minecraftId}\n\n用户将回到待审核状态，需要重新提交白名单申请`);
        fetchBlacklist();
      } else {
        alert(result.message || '操作失败');
      }
    } catch (error) {
      console.error('撤回封禁失败:', error);
      alert('操作失败，请重试');
    } finally {
      setRevokingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
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

  const formatExpiresAt = (expiresAt: string | null, isPermanent: boolean) => {
    if (isPermanent) return '永久';
    if (!expiresAt) return '-';
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return '已过期';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}天${hours % 24}小时`;
    if (hours > 0) return `${hours}小时${minutes % 60}分钟`;
    return `${minutes}分钟`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🚫</span> 黑名单管理
          </h1>
          <p className="text-gray-400 text-sm mt-1">管理被封禁的玩家和IP地址</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="搜索游戏ID或IP地址..."
          className="flex-1 min-w-[200px] bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
        >
          搜索
        </button>
        <button
          onClick={() => { setSearch(''); fetchBlacklist(); }}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
        >
          重置
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-4xl animate-bounce">🚫</div>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-400 text-lg">暂无黑名单记录</p>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">游戏ID</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">IP地址</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">封禁原因</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">封禁时长</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">到期时间</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">封禁人</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">封禁时间</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{entry.minecraft_id}</td>
                    <td className="px-4 py-3 text-gray-300 font-mono text-sm">{entry.ip_address || '-'}</td>
                    <td className="px-4 py-3 text-gray-300 max-w-xs truncate" title={entry.reason}>
                      {entry.reason}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {entry.is_permanent ? (
                        <span className="text-red-400">永久</span>
                      ) : entry.duration_minutes ? (
                        <span>{Math.round(entry.duration_minutes / 1440)}天</span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {entry.is_permanent ? (
                        <span className="text-gray-500">永久</span>
                      ) : entry.expires_at ? (
                        <span className={formatExpiresAt(entry.expires_at, entry.is_permanent) === '已过期' ? 'text-green-400' : 'text-orange-400'}>
                          {formatExpiresAt(entry.expires_at, entry.is_permanent)}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{entry.banned_by}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{formatDate(entry.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRevoke(entry.id, entry.minecraft_id)}
                          disabled={revokingId === entry.id || removingId === entry.id}
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm rounded-lg transition-all"
                        >
                          {revokingId === entry.id ? '处理中...' : '撤回'}
                        </button>
                        <button
                          onClick={() => handleRemove(entry.id, entry.minecraft_id)}
                          disabled={removingId === entry.id || revokingId === entry.id}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm rounded-lg transition-all"
                        >
                          {removingId === entry.id ? '处理中...' : '移除'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-all"
              >
                上一页
              </button>
              <span className="px-4 py-2 text-gray-300">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-all"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
