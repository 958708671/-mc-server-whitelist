'use client';

import { useState, useEffect } from 'react';

interface Complaint {
  id: number;
  reporter_name: string;
  reporter_contact: string;
  reported_player: string;
  violation_main: string;
  violation_sub: string;
  description: string;
  evidence_urls: string;
  status: string;
  handler: string | null;
  handler_id: number | null;
  resolution_note: string | null;
  resolution_images: string | null;
  investigation_note: string | null;
  created_at: string;
}

export default function ComplaintsSupervisePage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [restartNote, setRestartNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ user: string; adminId: number } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminInfo');
    if (savedAdmin) {
      setAdminInfo(JSON.parse(savedAdmin));
    }
    fetchComplaints();
  }, [statusFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/complaints?isOwner=true&status=${statusFilter}`);
      const result = await response.json();
      if (result.success) {
        setComplaints(result.data);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('获取投诉列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === complaints.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(complaints.map(c => c.id)));
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

  const handleBatchRestart = async () => {
    if (selectedIds.size === 0) {
      alert('请先选择要重启的案件');
      return;
    }
    if (!confirm(`确定要批量重启 ${selectedIds.size} 个案件吗？`)) return;
    
    setProcessing(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/complaints/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'restart',
            note: '批量重启',
            adminId: adminInfo?.adminId,
            adminName: adminInfo?.user
          })
        });
      }
      alert('批量重启成功');
      fetchComplaints();
    } catch (error) {
      alert('操作失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = () => {
    const exportData = selectedIds.size > 0 
      ? complaints.filter(c => selectedIds.has(c.id))
      : complaints;
    
    if (exportData.length === 0) {
      alert('没有可导出的数据');
      return;
    }
    
    const csvContent = [
      ['ID', '举报人', '联系方式', '被举报玩家', '违规类型', '描述', '状态', '处理人', '处理结果', '时间'].join(','),
      ...exportData.map(c => [
        c.id,
        c.reporter_name,
        c.reporter_contact,
        c.reported_player,
        `${c.violation_main} - ${c.violation_sub}`,
        (c.description || '').replace(/"/g, '""'),
        c.status === 'pending' ? '待处理' : c.status === 'processing' ? '处理中' : c.status === 'resolved' ? '已解决' : '已驳回',
        c.handler || '-',
        (c.resolution_note || '').replace(/"/g, '""'),
        formatDate(c.created_at)
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `投诉监管_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    link.click();
  };

  const handleRestart = async (complaintId: number) => {
    if (!restartNote.trim()) {
      alert('请填写重启原因');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restart',
          note: restartNote,
          adminId: adminInfo?.adminId,
          adminName: adminInfo?.user
        })
      });

      const result = await response.json();
      if (result.success) {
        setSelectedComplaint(null);
        setRestartNote('');
        fetchComplaints();
      } else {
        alert(result.message || '重启失败');
      }
    } catch (error) {
      alert('重启失败，请重试');
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
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">待处理</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">处理中</span>;
      case 'resolved':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">已解决</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">已驳回</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>👁️</span> 投诉监管
        </h1>
        <p className="text-gray-400 text-sm mt-1">查看所有投诉案件，可重启已处理的案件</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'processing', 'resolved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {status === 'all' ? '全部' :
             status === 'pending' ? '待处理' :
             status === 'processing' ? '处理中' :
             status === 'resolved' ? '已解决' : '已驳回'}
          </button>
        ))}
      </div>

      {complaints.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-2"
          >
            📥 {selectedIds.size > 0 ? `导出选中 (${selectedIds.size})` : '导出全部'}
          </button>
          <button
            onClick={handleBatchRestart}
            disabled={selectedIds.size === 0 || processing}
            className="px-4 py-2 rounded-lg font-medium bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all flex items-center gap-2"
          >
            🔄 批量重启 {selectedIds.size > 0 && `(${selectedIds.size})`}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-4xl animate-bounce">👁️</div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-400 text-lg">暂无投诉记录</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === complaints.length && complaints.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                  />
                </th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">ID</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">举报人</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">被举报</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">违规类型</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">状态</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">处理人</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-sm">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(complaint.id)}
                      onChange={() => toggleSelect(complaint.id)}
                      className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-white font-medium">#{complaint.id}</td>
                  <td className="px-4 py-3 text-gray-300">{complaint.reporter_name}</td>
                  <td className="px-4 py-3 text-red-400">{complaint.reported_player}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{complaint.violation_main} - {complaint.violation_sub}</td>
                  <td className="px-4 py-3">{getStatusBadge(complaint.status)}</td>
                  <td className="px-4 py-3 text-gray-300">{complaint.handler || '-'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setRestartNote('');
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all text-sm"
                    >
                      详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700 rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📋</span> 投诉详情 #{selectedComplaint.id}
              </h2>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 text-sm">举报人</span>
                    <p className="text-white">{selectedComplaint.reporter_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">联系方式</span>
                    <p className="text-white">{selectedComplaint.reporter_contact}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">被举报玩家</span>
                    <p className="text-red-400">{selectedComplaint.reported_player}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">状态</span>
                    <p>{getStatusBadge(selectedComplaint.status)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <span className="text-gray-400 text-sm">违规类型</span>
                <p className="text-white">{selectedComplaint.violation_main} - {selectedComplaint.violation_sub}</p>
              </div>
              
              <div>
                <span className="text-gray-400 text-sm">详细描述</span>
                <div className="bg-gray-800/50 rounded-xl p-4 text-gray-300 whitespace-pre-wrap mt-2">
                  {selectedComplaint.description}
                </div>
              </div>
              
              {selectedComplaint.evidence_urls && (
                <div>
                  <span className="text-gray-400 text-sm">证据图片</span>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedComplaint.evidence_urls.split(',').map((url, idx) => (
                      <img 
                        key={idx}
                        src={url.trim()}
                        alt={`证据${idx + 1}`}
                        className="rounded-lg cursor-pointer hover:opacity-80"
                        onClick={() => window.open(url.trim(), '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {selectedComplaint.handler && (
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
                  <h4 className="text-blue-400 font-medium mb-2">处理信息</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">处理人: {selectedComplaint.handler}</p>
                    {selectedComplaint.investigation_note && (
                      <p className="text-gray-300">调查记录: {selectedComplaint.investigation_note}</p>
                    )}
                    {selectedComplaint.resolution_note && (
                      <p className="text-gray-300">处理结果: {selectedComplaint.resolution_note}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">重启原因</label>
                <textarea
                  value={restartNote}
                  onChange={(e) => setRestartNote(e.target.value)}
                  placeholder="填写重启此案件的原因..."
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
              >
                关闭
              </button>
              {selectedComplaint.status !== 'pending' && (
                <button
                  onClick={() => handleRestart(selectedComplaint.id)}
                  disabled={processing}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>🔄</span> 重启案件
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
