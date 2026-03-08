'use client';

import { useState, useEffect } from 'react';

interface Log {
  id: number;
  admin_id: number;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: number;
  details: string;
  ip_address: string;
  created_at: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'login' | 'operation'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = activeTab === 'all' 
        ? '/api/logs'
        : `/api/logs?type=${activeTab}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setLogs(result.data);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('获取日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === logs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(logs.map(log => log.id)));
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

  const handleDelete = () => {
    if (selectedIds.size === 0) {
      alert('请先选择要删除的日志');
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setProcessing(true);
    try {
      const response = await fetch('/api/clear-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });
      const result = await response.json();
      if (result.success) {
        alert('删除成功');
        fetchLogs();
      } else {
        alert(result.message || '删除失败');
      }
    } catch (error) {
      alert('删除失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = () => {
    const exportData = selectedIds.size > 0 
      ? logs.filter(log => selectedIds.has(log.id))
      : logs;
    
    if (exportData.length === 0) {
      alert('没有可导出的数据');
      return;
    }
    
    const csvContent = [
      ['时间', '操作人', '操作类型', '目标', '详情', 'IP地址'].join(','),
      ...exportData.map(log => [
        formatDate(log.created_at),
        log.admin_name || `管理员#${log.admin_id}`,
        getActionText(log.action),
        log.target_type ? `${getTargetType(log.target_type)}#${log.target_id || ''}` : '-',
        (log.details || '').replace(/"/g, '""'),
        log.ip_address || '-'
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `操作日志_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    link.click();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionText = (action: string) => {
    const actionMap: Record<string, string> = {
      login: '登录',
      approve_application: '通过申请',
      reject_application: '拒绝申请',
      accept_complaint: '接取投诉',
      resolve_complaint: '解决投诉',
      reject_complaint: '驳回投诉',
      restart_complaint: '重启投诉',
      add_blacklist: '添加黑名单',
      remove_blacklist: '移除黑名单',
    };
    return actionMap[action] || action;
  };

  const getActionBadge = (action: string) => {
    const actionMap: Record<string, { color: string; text: string }> = {
      login: { color: 'bg-green-500/20 text-green-400', text: '登录' },
      approve_application: { color: 'bg-blue-500/20 text-blue-400', text: '通过申请' },
      reject_application: { color: 'bg-red-500/20 text-red-400', text: '拒绝申请' },
      accept_complaint: { color: 'bg-yellow-500/20 text-yellow-400', text: '接取投诉' },
      resolve_complaint: { color: 'bg-green-500/20 text-green-400', text: '解决投诉' },
      reject_complaint: { color: 'bg-red-500/20 text-red-400', text: '驳回投诉' },
      restart_complaint: { color: 'bg-purple-500/20 text-purple-400', text: '重启投诉' },
      add_blacklist: { color: 'bg-red-500/20 text-red-400', text: '添加黑名单' },
      remove_blacklist: { color: 'bg-green-500/20 text-green-400', text: '移除黑名单' },
    };
    
    const config = actionMap[action] || { color: 'bg-gray-500/20 text-gray-400', text: action };
    return <span className={`px-2 py-1 rounded text-xs ${config.color}`}>{config.text}</span>;
  };

  const getTargetType = (type: string | undefined) => {
    const typeMap: Record<string, string> = {
      whitelist: '白名单申请',
      complaint: '投诉举报',
      blacklist: '黑名单',
    };
    return type ? (typeMap[type] || type) : '-';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📝</span> 操作日志
        </h1>
        <p className="text-gray-400 text-sm mt-1">查看所有管理员的操作记录</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            全部日志
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'login'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            登录记录
          </button>
          <button
            onClick={() => setActiveTab('operation')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'operation'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            操作记录
          </button>
        </div>
        
        {logs.length > 0 && (
          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-2"
            >
              📥 {selectedIds.size > 0 ? `导出选中 (${selectedIds.size})` : '导出全部'}
            </button>
            <button
              onClick={handleDelete}
              disabled={selectedIds.size === 0 || processing}
              className="px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all flex items-center gap-2"
            >
              🗑️ 删除选中 {selectedIds.size > 0 && `(${selectedIds.size})`}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-4xl animate-bounce">📝</div>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-400 text-lg">暂无日志记录</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === logs.length && logs.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                  />
                </th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">时间</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">操作人</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">操作类型</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">目标</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">详情</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(log.id)}
                      onChange={() => toggleSelect(log.id)}
                      className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    {log.admin_name || `管理员#${log.admin_id}`}
                  </td>
                  <td className="px-4 py-3">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">
                    {log.target_type ? (
                      <span>
                        {getTargetType(log.target_type)}
                        {log.target_id && <span className="text-gray-500 ml-1">#{log.target_id}</span>}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm max-w-xs truncate">
                    {log.details || log.ip_address || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-white mb-2">确认删除</h3>
              <p className="text-gray-400 mb-6">
                确定要删除选中的 <span className="text-red-400 font-bold">{selectedIds.size}</span> 条日志吗？
                <br />
                <span className="text-sm text-gray-500">此操作不可恢复</span>
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={processing}
                  className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all"
                >
                  {processing ? '删除中...' : '确认删除'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
