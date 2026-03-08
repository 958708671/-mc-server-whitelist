'use client';

import { useState, useEffect } from 'react';

interface Application {
  id: number;
  minecraft_id: string;
  age: number | null;
  contact: string;
  reason: string;
  status: string;
  reviewed_by: string | null;
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ user: string; adminId: number } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminInfo');
    if (savedAdmin) {
      setAdminInfo(JSON.parse(savedAdmin));
    }
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const url = activeTab === 'pending' 
        ? '/api/applications?status=pending'
        : `/api/applications?adminId=${adminInfo?.adminId || ''}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setApplications(result.data);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('获取申请列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applications.map(app => app.id)));
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

  const handleBatchApprove = async () => {
    if (selectedIds.size === 0) {
      alert('请先选择要通过的申请');
      return;
    }
    if (!confirm(`确定要批量通过 ${selectedIds.size} 个申请吗？`)) return;
    
    setProcessing(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/applications/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'approved',
            reviewer: adminInfo?.user,
            reviewerId: adminInfo?.adminId,
            note: '批量通过'
          })
        });
      }
      alert('批量通过成功');
      fetchApplications();
    } catch (error) {
      alert('操作失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchReject = async () => {
    if (selectedIds.size === 0) {
      alert('请先选择要拒绝的申请');
      return;
    }
    if (!confirm(`确定要批量拒绝 ${selectedIds.size} 个申请吗？`)) return;
    
    setProcessing(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/applications/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'rejected',
            reviewer: adminInfo?.user,
            reviewerId: adminInfo?.adminId,
            note: '批量拒绝'
          })
        });
      }
      alert('批量拒绝成功');
      fetchApplications();
    } catch (error) {
      alert('操作失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = () => {
    const exportData = selectedIds.size > 0 
      ? applications.filter(app => selectedIds.has(app.id))
      : applications;
    
    if (exportData.length === 0) {
      alert('没有可导出的数据');
      return;
    }
    
    const csvContent = [
      ['游戏ID', '年龄', '联系方式', '申请理由', '状态', '申请时间'].join(','),
      ...exportData.map(app => [
        app.minecraft_id,
        app.age || '未填写',
        app.contact,
        (app.reason || '').replace(/"/g, '""'),
        app.status === 'pending' ? '待审核' : app.status === 'approved' ? '已通过' : '已拒绝',
        formatDate(app.created_at)
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `白名单申请_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    link.click();
  };

  const handleReview = async (appId: number, status: 'approved' | 'rejected') => {
    if (!adminInfo) return;
    
    setProcessing(true);
    try {
      const response = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewer: adminInfo.user,
          reviewerId: adminInfo.adminId,
          note: reviewNote
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setSelectedApp(null);
        setReviewNote('');
        fetchApplications();
      } else {
        alert(result.message || '操作失败');
      }
    } catch (error) {
      alert('操作失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">待审核</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">已通过</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">已拒绝</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>📝</span> 白名单审核
          </h1>
          <p className="text-gray-400 text-sm mt-1">审核玩家的白名单申请</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            待审核
          </button>
          <button
            onClick={() => setActiveTab('reviewed')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'reviewed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            我的审核记录
          </button>
        </div>
      </div>

      {applications.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-2"
          >
            📥 {selectedIds.size > 0 ? `导出选中 (${selectedIds.size})` : '导出全部'}
          </button>
          {activeTab === 'pending' && (
            <>
              <button
                onClick={handleBatchApprove}
                disabled={selectedIds.size === 0 || processing}
                className="px-4 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all flex items-center gap-2"
              >
                ✅ 批量通过 {selectedIds.size > 0 && `(${selectedIds.size})`}
              </button>
              <button
                onClick={handleBatchReject}
                disabled={selectedIds.size === 0 || processing}
                className="px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all flex items-center gap-2"
              >
                ❌ 批量拒绝 {selectedIds.size > 0 && `(${selectedIds.size})`}
              </button>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-4xl animate-bounce">⛏️</div>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-400 text-lg">
            {activeTab === 'pending' ? '暂无待审核的申请' : '暂无审核记录'}
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                {activeTab === 'pending' && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === applications.length && applications.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                    />
                  </th>
                )}
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">游戏ID</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">年龄</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">联系方式</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">申请理由</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">状态</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-700/30 transition-colors">
                  {activeTab === 'pending' && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(app.id)}
                        onChange={() => toggleSelect(app.id)}
                        className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 text-white font-medium">{app.minecraft_id}</td>
                  <td className="px-4 py-3 text-gray-300">{app.age || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">{app.contact}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm max-w-xs truncate">{app.reason}</td>
                  <td className="px-4 py-3">{getStatusBadge(app.status)}</td>
                  <td className="px-4 py-3">
                    {app.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setReviewNote('');
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm"
                      >
                        审核
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📋</span> 审核申请
              </h2>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">游戏ID</span>
                  <span className="text-white font-medium">{selectedApp.minecraft_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">年龄</span>
                  <span className="text-white">{selectedApp.age || '未填写'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">联系方式</span>
                  <span className="text-white">{selectedApp.contact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">申请时间</span>
                  <span className="text-white">{formatDate(selectedApp.created_at)}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">申请理由</label>
                <div className="bg-gray-800/50 rounded-xl p-4 text-gray-300 whitespace-pre-wrap">
                  {selectedApp.reason || '未填写'}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">审核备注</label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="填写审核备注（可选）"
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedApp(null)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
              >
                取消
              </button>
              <button
                onClick={() => handleReview(selectedApp.id, 'rejected')}
                disabled={processing}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>❌</span> 拒绝
              </button>
              <button
                onClick={() => handleReview(selectedApp.id, 'approved')}
                disabled={processing}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>✅</span> 通过
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
