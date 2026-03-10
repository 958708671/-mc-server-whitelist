'use client';
import React, { useState, useEffect } from 'react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const formatViolationTime = (time: string) => {
  if (!time) return '未知';
  try {
    const date = new Date(time);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return time;
  }
};

interface Complaint {
  id: number;
  reporter_name: string;
  reporter_qq: string;
  target_player: string;
  violation_time: string;
  violation_type: string;
  description: string;
  evidence: string;
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
  created_at: string;
  handler?: string;
  handler_id?: number;
  resolution_note?: string;
  resolution_images?: string;
  investigation_note?: string;
}

interface AdminInfo {
  id: number;
  user: string;
  isOwner: boolean;
}

function DetailModal({
  complaint,
  onClose,
  onStatusUpdate,
  onDelete,
  adminInfo
}: {
  complaint: Complaint;
  onClose: () => void;
  onStatusUpdate: (id: number, status: string, note?: string, images?: string) => Promise<boolean>;
  onDelete: (id: number) => void;
  adminInfo: AdminInfo;
}) {
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [note, setNote] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localStatus, setLocalStatus] = useState(complaint.status);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'processing': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      case 'resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'rejected': return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ 待处理';
      case 'processing': return '⛏️ 处理中';
      case 'resolved': return '✅ 已解决';
      case 'rejected': return '❌ 已驳回';
      default: return '未知';
    }
  };

  const handleResolve = async () => {
    if (!note.trim()) {
      alert('请填写处理说明');
      return;
    }
    setIsSubmitting(true);
    try {
      const success = await onStatusUpdate(complaint.id, 'resolved', note, imageUrls);
      if (success) {
        setLocalStatus('resolved');
        setShowResolveForm(false);
        setNote('');
        setImageUrls('');
      } else {
        alert('操作失败，请重试');
      }
    } catch (e) {
      alert('操作失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!note.trim()) {
      alert('请填写驳回原因');
      return;
    }
    setIsSubmitting(true);
    try {
      const success = await onStatusUpdate(complaint.id, 'rejected', note, imageUrls);
      if (success) {
        setLocalStatus('rejected');
        setShowRejectForm(false);
        setNote('');
        setImageUrls('');
      } else {
        alert('操作失败，请重试');
      }
    } catch (e) {
      alert('操作失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      const success = await onStatusUpdate(complaint.id, 'processing');
      if (success) {
        setLocalStatus('processing');
      } else {
        alert('操作失败，请重试');
      }
    } catch (e) {
      alert('操作失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStatus = localStatus;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-emerald-600/20 via-cyan-600/20 to-blue-600/20 p-5 border-b-2 border-gray-700 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-2xl shadow-lg border-2 border-amber-400/50">
                📋
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  投诉详情
                  <span className="text-sm font-normal text-gray-400">#{complaint.id}</span>
                </h2>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(currentStatus)}`}>
                  {getStatusText(currentStatus)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {adminInfo.isOwner && (
                <button
                  onClick={() => onDelete(complaint.id)}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 text-sm px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                >
                  🗑️ 删除
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-700 p-1.5 rounded-lg transition-all text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="bg-gradient-to-r from-rose-500/10 to-orange-500/10 p-4 rounded-xl border border-rose-500/30">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">🎮</span>
              <span className="text-gray-400 text-sm">被举报玩家</span>
            </div>
            <div className="text-white font-bold text-xl">{complaint.target_player}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <span>👤</span>
                <span className="text-gray-400 text-xs">举报人</span>
              </div>
              <div className="text-white font-semibold">{complaint.reporter_name}</div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <span>💬</span>
                <span className="text-gray-400 text-xs">QQ号</span>
              </div>
              <div className="text-white font-semibold">{complaint.reporter_qq}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <span>⏰</span>
                <span className="text-gray-400 text-xs">违规时间</span>
              </div>
              <div className="text-white text-sm">{formatViolationTime(complaint.violation_time)}</div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <span>🏷️</span>
                <span className="text-gray-400 text-xs">违规类型</span>
              </div>
              <div className="text-white text-sm">{complaint.violation_type}</div>
            </div>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <span>📝</span>
              <span className="text-gray-400 text-xs">违规描述</span>
            </div>
            <div className="text-white text-sm whitespace-pre-wrap">{complaint.description || '未填写'}</div>
          </div>

          {complaint.evidence && (
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-4 rounded-xl border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span>🔗</span>
                <span className="text-gray-400 text-sm">举报人提交的证据</span>
              </div>
              <a 
                href={complaint.evidence} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline break-all text-sm flex items-center gap-1"
              >
                点击查看证据链接 <span>↗</span>
              </a>
            </div>
          )}

          {complaint.handler && (
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-3 rounded-xl border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-1">
                <span>⚔️</span>
                <span className="text-gray-400 text-xs">处理人</span>
              </div>
              <div className="text-cyan-400 font-semibold">{complaint.handler === '服主' && adminInfo.user ? adminInfo.user : complaint.handler}</div>
              <div className="text-gray-400 text-xs mt-1">
                职位: {adminInfo.isOwner ? '服主' : '管理员'}
              </div>
            </div>
          )}

          {complaint.investigation_note && (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-3 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-2 mb-1">
                <span>🔍</span>
                <span className="text-gray-400 text-xs">调查记录</span>
              </div>
              <div className="text-amber-400 text-sm whitespace-pre-wrap">{complaint.investigation_note}</div>
            </div>
          )}

          {complaint.resolution_note && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 p-3 rounded-xl border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-1">
                <span>📜</span>
                <span className="text-gray-400 text-xs">处理说明</span>
              </div>
              <div className="text-emerald-400 text-sm whitespace-pre-wrap">{complaint.resolution_note}</div>
            </div>
          )}

          {complaint.resolution_images && (
            <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span>🖼️</span>
                <span className="text-gray-400 text-xs">处理结果图片</span>
              </div>
              <div className="space-y-2">
                {complaint.resolution_images.split(',').filter(url => url.trim()).map((url, index) => (
                  <a 
                    key={index}
                    href={url.trim()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline break-all text-sm block"
                  >
                    图片 {index + 1} ↗
                  </a>
                ))}
              </div>
            </div>
          )}


        </div>

        <div className="p-4 border-t-2 border-gray-700 bg-gray-900/80 flex-shrink-0">
          {showResolveForm || showRejectForm ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-base font-semibold text-white">
                <span>{showResolveForm ? '✅' : '❌'}</span>
                <span>{showResolveForm ? '填写解决说明' : '填写驳回原因'}</span>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={showResolveForm ? '请详细说明处理结果，包括调查过程、处理方式等...' : '请说明驳回原因...'}
                className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none text-sm"
                rows={3}
              />
              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                  <span>🖼️</span>
                  百度云盘证据编号（单个文件夹，格式：日期+被举报人）
                </label>
                <input
                  type="text"
                  value={imageUrls}
                  onChange={(e) => setImageUrls(e.target.value)}
                  placeholder="例如：20240101a"
                  className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowResolveForm(false); setShowRejectForm(false); setNote(''); setImageUrls(''); }}
                  className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all text-sm"
                >
                  取消
                </button>
                <button
                  onClick={showResolveForm ? handleResolve : handleReject}
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 text-sm ${
                    showResolveForm 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {isSubmitting ? '处理中...' : (showResolveForm ? '确认解决' : '确认驳回')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              {currentStatus === 'pending' && (
                <button
                  onClick={handleAccept}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg text-sm"
                >
                  <span>⛏️</span>
                  <span>{isSubmitting ? '接取中...' : (adminInfo.isOwner ? '服主接取' : '接取处理')}</span>
                </button>
              )}
              {currentStatus === 'processing' && (
                <>
                  <button
                    onClick={() => setShowResolveForm(true)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg text-sm"
                  >
                    <span>✅</span>
                    <span>已解决</span>
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg text-sm"
                  >
                    <span>❌</span>
                    <span>已驳回</span>
                  </button>
                </>
              )}
              {(currentStatus === 'resolved' || currentStatus === 'rejected') && (
                <>
                  <div className="w-full text-center py-2 text-gray-400 text-sm mb-2">
                    此投诉已处理完毕
                  </div>
                  {adminInfo.isOwner && (
                    <button
                      onClick={async () => {
                        if (confirm('确定要重启此案件吗？案件将重置为待处理状态。')) {
                          const success = await onStatusUpdate(complaint.id, 'pending');
                          if (success) {
                            setLocalStatus('pending');
                          }
                        }
                      }}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg text-sm"
                    >
                      <span>🔄</span>
                      <span>重启案件</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminInfo, setAdminInfo] = useState<AdminInfo>({ id: 0, user: '', isOwner: false });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminInfo');
    if (savedAdmin) {
      try {
        const info = JSON.parse(savedAdmin);
        setAdminInfo({ id: info.adminId, user: info.user, isOwner: info.isOwner || false });
      } catch (e) {
        window.location.href = '/admin';
      }
    } else {
      window.location.href = '/admin';
    }

    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status) {
      setFilter(status);
    }
  }, []);

  const fetchComplaints = async (adminId: number, isOwner: boolean) => {
    try {
      const response = await fetch(`/api/complaints?status=${filter}&adminId=${adminId}&isOwner=${isOwner}`);
      const result = await response.json();
      if (result.success) {
        // 检查并更新处理人为"服主"的记录
        const updatedComplaints = result.data.map((complaint: any) => {
          if (complaint.handler === '服主' && adminInfo.user) {
            // 如果处理人是"服主"且当前管理员用户名不为空，将其改为当前管理员的用户名
            return {
              ...complaint,
              handler: adminInfo.user
            };
          }
          return complaint;
        });
        setComplaints(updatedComplaints);
      }
    } catch (error) {
      console.error('获取投诉列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminInfo.id && adminInfo.user) {
      fetchComplaints(adminInfo.id, adminInfo.isOwner);
    }
  }, [filter, adminInfo.id, adminInfo.isOwner, adminInfo.user]);

  const updateStatus = async (id: number, status: string, note?: string, images?: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminId: adminInfo.id,
          adminName: adminInfo.user,
          resolutionNote: note,
          resolutionImages: images
        }),
      });

      const result = await response.json();
      if (result.success) {
        fetchComplaints(adminInfo.id, adminInfo.isOwner);
        if (selectedComplaint?.id === id) {
          setSelectedComplaint({ 
            ...selectedComplaint, 
            status: status as any,
            handler: adminInfo.user,
            handler_id: adminInfo.id,
            resolution_note: note,
            resolution_images: images
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('更新状态失败:', error);
      return false;
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteModalOpen(false);
    setProcessing(true);

    try {
      const response = await fetch(
        `/api/complaints/${deleteTargetId}?adminId=${adminInfo.id}&adminName=${encodeURIComponent(adminInfo.user || '')}`,

        { method: 'DELETE' }
      );

      const result = await response.json();
      if (result.success) {
        fetchComplaints(adminInfo.id, adminInfo.isOwner);
        setSelectedComplaint(null);
      }
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setProcessing(false);
      setDeleteTargetId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'processing': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      case 'resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'rejected': return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ 待处理';
      case 'processing': return '⛏️ 处理中';
      case 'resolved': return '✅ 已解决';
      case 'rejected': return '❌ 已驳回';
      default: return '未知';
    }
  };

  // 关键修复函数：将存储的 UTC 时间字符串转换为本地时间显示
  const formatStoredTimeForDisplay = (utcTimeString: string) => {
    // 1. 正确解析：将数据库中的字符串转换为 Date 对象
    //    数据库里的 "2026-03-08T13:05:01.315Z" 会被理解为 UTC 时间 13:05
    const utcDate = new Date(utcTimeString);
    
    // 2. 转换为本地时间：这一步会让 JavaScript 自动根据您电脑的时区（UTC+8）进行转换
    const localDate = new Date(utcDate.getTime()); // 或者直接使用 utcDate 也可以
    
    // 3. 格式化为可读的北京时间字符串
    return localDate.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai', // 显式指定时区更可靠
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // 使用24小时制
    }).replace(/\//g, '/');
    // 返回结果示例："2026/03/08 21:05:01"
  };

  const formatDate = (dateStr: string) => {
    return formatStoredTimeForDisplay(dateStr);
  };

  const formatViolationTime = (timeStr: string | undefined) => {
    if (!timeStr || timeStr === '未填写') return '未填写';
    
    if (timeStr.includes('T')) {
      // 确保ISO格式时间被解析为UTC时间
      if (!timeStr.endsWith('Z')) {
        // 如果没有Z后缀，手动构建UTC时间
        const [datePart, timePart] = timeStr.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute, second] = timePart.split(':').map(Number);
        const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second || 0));
        return formatStoredTimeForDisplay(utcDate.toISOString());
      }
      // 使用标准的时区转换函数
      return formatStoredTimeForDisplay(timeStr);
    }
    
    const chineseMatch = timeStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/);
    if (chineseMatch) {
      const [, year, month, day, hour, minute] = chineseMatch;
      // 构建UTC日期对象并使用时区转换
      const utcDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)));
      return formatStoredTimeForDisplay(utcDate.toISOString());
    }
    
    const slashMatch = timeStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})\s*(\d{1,2}):(\d{2})/);
    if (slashMatch) {
      const [, year, month, day, hour, minute] = slashMatch;
      // 构建UTC日期对象并使用时区转换
      const utcDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)));
      return formatStoredTimeForDisplay(utcDate.toISOString());
    }
    
    const dashMatch = timeStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})\s*(\d{1,2}):(\d{2})/);
    if (dashMatch) {
      const [, year, month, day, hour, minute] = dashMatch;
      // 构建UTC日期对象并使用时区转换
      const utcDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)));
      return formatStoredTimeForDisplay(utcDate.toISOString());
    }
    
    return timeStr;
  };

  const filteredComplaints = complaints.filter(c =>
    c.target_player.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.reporter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.violation_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    processing: complaints.filter(c => c.status === 'processing').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce" suppressHydrationWarning>⛏️</div>
          <div className="text-2xl text-white font-bold">加载中...</div>
          <div className="text-gray-400 mt-2">正在获取投诉数据</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
            📋
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {adminInfo.isOwner ? '投诉管理' : '处理举报'}
            </h1>
            <p className="text-gray-400 text-sm">共 {stats.total} 条投诉记录</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div 
          onClick={() => setFilter('all')}
          className={`bg-gray-800/50 border-2 p-4 rounded-xl cursor-pointer transition-all hover:scale-105 ${filter === 'all' ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-700 hover:border-gray-600'}`}
        >
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-gray-400 text-xs flex items-center gap-1 mt-1">
            <span>📊</span> 总计
          </div>
        </div>
        <div 
          onClick={() => setFilter('pending')}
          className={`bg-amber-500/10 border-2 p-4 rounded-xl cursor-pointer transition-all hover:scale-105 ${filter === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-amber-500/30 hover:border-amber-500/50'}`}
        >
          <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
          <div className="text-amber-400/70 text-xs flex items-center gap-1 mt-1">
            <span>⏳</span> 待处理
          </div>
        </div>
        <div 
          onClick={() => setFilter('processing')}
          className={`bg-cyan-500/10 border-2 p-4 rounded-xl cursor-pointer transition-all hover:scale-105 ${filter === 'processing' ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-cyan-500/30 hover:border-cyan-500/50'}`}
        >
          <div className="text-2xl font-bold text-cyan-400">{stats.processing}</div>
          <div className="text-cyan-400/70 text-xs flex items-center gap-1 mt-1">
            <span>⛏️</span> 处理中
          </div>
        </div>
        <div 
          onClick={() => setFilter('resolved')}
          className={`bg-emerald-500/10 border-2 p-4 rounded-xl cursor-pointer transition-all hover:scale-105 ${filter === 'resolved' ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-emerald-500/30 hover:border-emerald-500/50'}`}
        >
          <div className="text-2xl font-bold text-emerald-400">{stats.resolved}</div>
          <div className="text-emerald-400/70 text-xs flex items-center gap-1 mt-1">
            <span>✅</span> 已解决
          </div>
        </div>
        <div 
          onClick={() => setFilter('rejected')}
          className={`bg-rose-500/10 border-2 p-4 rounded-xl cursor-pointer transition-all hover:scale-105 ${filter === 'rejected' ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-rose-500/30 hover:border-rose-500/50'}`}
        >
          <div className="text-2xl font-bold text-rose-400">{stats.rejected}</div>
          <div className="text-rose-400/70 text-xs flex items-center gap-1 mt-1">
            <span>❌</span> 已驳回
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="搜索玩家ID、举报人或违规类型..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-800/50 border-2 border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
        >
          <option value="all">全部状态</option>
          <option value="pending">待处理</option>
          <option value="processing">处理中</option>
          <option value="resolved">已解决</option>
          <option value="rejected">已驳回</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredComplaints.length === 0 ? (
          <div className="bg-gray-800/30 border-2 border-gray-700 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-3">📭</div>
            <div className="text-lg text-gray-400">暂无投诉记录</div>
            <div className="text-gray-500 mt-1 text-sm">当前筛选条件下没有数据</div>
          </div>
        ) : (
          filteredComplaints.map((complaint) => (
            <div
              key={complaint.id}
              onClick={() => {
                // 检查并更新处理人为"服主"的记录
                const updatedComplaint = {
                  ...complaint,
                  handler: complaint.handler === '服主' && adminInfo.user ? adminInfo.user : complaint.handler
                };
                setSelectedComplaint(updatedComplaint);
              }}
              className="bg-gray-800/50 border-2 border-gray-700 p-4 rounded-xl cursor-pointer transition-all hover:border-cyan-500/50 hover:bg-gray-800/80"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center text-2xl border-2 border-gray-600">
                    🎮
                  </div>
                  <div>
                    <div className="text-white font-bold">{complaint.target_player}</div>
                    <div className="text-gray-400 text-xs">被举报玩家</div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(complaint.status)}`}>
                  {getStatusText(complaint.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-3">
                <div className="bg-gray-900/50 p-2 rounded-lg">
                  <span className="text-gray-500">👤</span>
                  <span className="text-gray-300 ml-1">{complaint.reporter_name}</span>
                </div>
                <div className="bg-gray-900/50 p-2 rounded-lg">
                  <span className="text-gray-500">🏷️</span>
                  <span className="text-gray-300 ml-1">{complaint.violation_type}</span>
                </div>
                <div className="bg-gray-900/50 p-2 rounded-lg">
                  <span className="text-gray-500">⏰</span>
                  <span className="text-gray-300 ml-1">{formatViolationTime(complaint.violation_time)}</span>
                </div>
                <div className="bg-gray-900/50 p-2 rounded-lg">
                  <span className="text-gray-500">📅</span>
                  <span className="text-gray-300 ml-1">{formatDate(complaint.created_at)}</span>
                </div>
              </div>

              {complaint.handler && (
                <div className="text-xs text-cyan-400 mb-2 flex items-center gap-1">
                  <span>⚔️</span>
                  <span>处理人: {complaint.handler === '服主' && adminInfo.user ? adminInfo.user : complaint.handler}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                <span className="text-gray-500 text-xs">点击查看详情</span>
                <span className="text-cyan-400 text-xs flex items-center gap-1">
                  查看详情 <span>→</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedComplaint && (
        <DetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onStatusUpdate={updateStatus}
          onDelete={handleDeleteClick}
          adminInfo={adminInfo}
        />
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
        onConfirm={confirmDelete}
        title="删除投诉"
        message="确定要删除这条投诉吗？"
        count={1}
        itemName="条投诉"
        processing={processing}
      />
    </div>
  );
}
