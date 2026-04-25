'use client';

import { useState, useEffect } from 'react';
import { Application, AdminInfo } from './types';
import { formatDate, exportToCsv } from './utils';
import BlacklistModal from '../components/BlacklistModal';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [blacklistingId, setBlacklistingId] = useState<number | null>(null);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [blacklistTarget, setBlacklistTarget] = useState<Application | null>(null);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminInfo');
    if (savedAdmin) {
      setAdminInfo(JSON.parse(savedAdmin));
    }
    fetchApplications();
  }, [activeTab]);

  useEffect(() => {
    if (processing) {
      const timeout = setTimeout(() => {
        console.log('安全重置processing');
        setProcessing(false);
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [processing]);

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
    
    exportToCsv(exportData, `白名单申请_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`);
  };

  const handleReview = async (appId: number, status: 'approved' | 'rejected') => {
    if (!adminInfo) return;
    
    setProcessing(true);
    let message = '';
    
    // 立即关闭弹窗
    setSelectedApp(null);
    
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
      
      if (!response.ok) {
        throw new Error('网络请求失败');
      }
      
      const result = await response.json();
      if (result.success) {
        message = status === 'approved' ? '审核通过成功' : '审核拒绝成功';
        // 如果是审核通过，显示白名单添加结果
        if (status === 'approved' && result.whitelistResult) {
          const whitelistMsg = result.whitelistResult.success 
            ? `白名单添加成功: ${result.whitelistResult.message}`
            : `白名单添加失败: ${result.whitelistResult.message}`;
          message += `\n${whitelistMsg}`;
        }
      } else {
        message = result.message || '操作失败';
      }
    } catch (error) {
      console.error('操作失败:', error);
      message = '操作失败，请重试';
    } finally {
      setReviewNote('');
      setProcessing(false);
      // 强制刷新页面
      setTimeout(() => {
        fetchApplications();
        console.log('申请列表已刷新');
      }, 100);
      if (message) {
        setTimeout(() => alert(message), 200);
      }
    }
  };

  const handleAddToBlacklistClick = (app: Application) => {
    setBlacklistTarget(app);
    setShowBlacklistModal(true);
  };

  const handleBlacklistConfirm = async (reason: string, duration: number | null, isPermanent: boolean) => {
    if (!blacklistTarget) return;
    
    const app = blacklistTarget;
    setShowBlacklistModal(false);
    setBlacklistingId(app.id);
    
    try {
      const response = await fetch('/api/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minecraft_id: app.minecraft_id,
          ip_address: app.ip_address,
          reason: reason,
          banned_by: adminInfo?.user || '管理员',
          banned_by_id: adminInfo?.adminId,
          application_id: app.id,
          duration: duration,
          is_permanent: isPermanent
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const durationText = isPermanent ? '永久' : duration ? `${Math.round(duration / 1440)}天` : '永久';
        alert(`已拉入黑名单并封禁IP\n\n游戏ID：${app.minecraft_id}\nIP地址：${app.ip_address || '未知'}\n封禁原因：${reason}\n封禁时长：${durationText}\n\n服务器封禁结果：${result.banResult?.message || '未执行'}`);
        fetchApplications();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-transparent text-white rounded text-xs" style={{border: '1px solid rgba(93, 122, 156, 0.8)'}}>{status === 'pending' ? '待审核' : status === 'approved' ? '已通过' : '已拒绝'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">白名单审核</h1>
          <p className="text-white/60 text-sm mt-1">审核玩家的白名单申请</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'pending'
                ? 'text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
            style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: activeTab === 'pending' ? 'rgba(138, 158, 255, 0.9)' : 'transparent'}}>
            待审核
          </button>
          <button
            onClick={() => setActiveTab('reviewed')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'reviewed'
                ? 'text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
            style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: activeTab === 'reviewed' ? 'rgba(138, 158, 255, 0.9)' : 'transparent'}}>
            我的审核记录
          </button>
        </div>
      </div>

      {applications.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg font-medium hover:bg-white/10 text-white transition-all flex items-center gap-2"
            style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}>
             {selectedIds.size > 0 ? `选中导出 (${selectedIds.size})` : '导出全部'}
          </button>
          {activeTab === 'pending' && (
            <>
              <button
                onClick={handleBatchApprove}
                disabled={selectedIds.size === 0 || processing}
                className={`px-4 py-2 rounded-lg font-medium hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all flex items-center gap-2`}
                style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}>
                {processing ? '处理中...' : <> 选中通过 {selectedIds.size > 0 && `(${selectedIds.size})`}</>}
              </button>
              <button
                onClick={handleBatchReject}
                disabled={selectedIds.size === 0 || processing}
                className={`px-4 py-2 rounded-lg font-medium hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all flex items-center gap-2`}
                style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}>
                {processing ? '处理中...' : <> 选中拒绝 {selectedIds.size > 0 && `(${selectedIds.size})`}</>}
              </button>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-4xl animate-bounce"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <p className="text-white/60 text-lg">暂无申请记录</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <table className="w-full">
            <thead className="bg-transparent">
              <tr>
                {activeTab === 'pending' && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === applications.length && applications.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded bg-transparent text-white focus:ring-white/50"
                    style={{border: '1px solid rgba(93, 122, 156, 0.8)'}}
                    />
                  </th>
                )}
                <th className="text-left px-4 py-3 text-white/60 font-medium text-sm">游戏ID</th>
                <th className="text-left px-4 py-3 text-white/60 font-medium text-sm">年龄</th>
                <th className="text-left px-4 py-3 text-white/60 font-medium text-sm">联系方式</th>
                <th className="text-left px-4 py-3 text-white/60 font-medium text-sm">状态</th>
                <th className="text-left px-4 py-3 text-white/60 font-medium text-sm">操作</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-white/5 transition-colors" style={{borderBottom: '1px solid rgba(93, 122, 156, 0.5)'}}>
                  {activeTab === 'pending' && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(app.id)}
                        onChange={() => toggleSelect(app.id)}
                        className="w-4 h-4 rounded bg-transparent text-white focus:ring-white/50"
                    style={{border: '1px solid rgba(93, 122, 156, 0.8)'}}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 text-white font-medium">{app.minecraft_id}</td>
                  <td className="px-4 py-3 text-white/60">{app.age || '-'}</td>
                  <td className="px-4 py-3 text-white/60">{app.contact}</td>
                  <td className="px-4 py-3">{getStatusBadge(app.status)}</td>
                  <td className="px-4 py-3">
                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setReviewNote('');
                          }}
                          className="px-3 py-1.5 hover:bg-white/30 text-white rounded-lg transition-all text-sm"
                          style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}>
                          审核
                        </button>
                        <button
                          onClick={() => handleAddToBlacklistClick(app)}
                          disabled={blacklistingId === app.id}
                          className="px-3 py-1.5 hover:bg-white/30 disabled:opacity-50 text-white rounded-lg transition-all text-sm"
                          style={{border: '1px solid rgba(93, 122, 156, 0.8)', backgroundColor: 'rgba(93, 122, 156, 0.5)'}}
                        >
                          {blacklistingId === app.id ? '处理中...' : '拉黑'}
                        </button>
                      </div>
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
          <div className="rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" style={{border: '2px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span></span> 审核申请
              </h2>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-xl p-4 space-y-3" style={{border: '1px solid rgba(93, 122, 156, 0.8)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                <div className="flex justify-between">
                  <span className="text-white/60">游戏ID</span>
                  <span className="text-white font-medium">{selectedApp.minecraft_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">年龄</span>
                  <span className="text-white">{selectedApp.age || '未填写'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">联系方式</span>
                  <span className="text-white">{selectedApp.contact}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 游戏经验相关 */}
                <div className="rounded-lg p-4" style={{border: '1px solid rgba(93, 122, 156, 0.8)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                  <h3 className="text-lg font-bold text-white mb-3">游戏经验</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">游戏时间</span>
                      <span className="text-white">{selectedApp.play_time || 0} 个月</span>
                    </div>
                  </div>
                </div>
                
                {/* 个人信息相关 */}
                <div className="rounded-lg p-4" style={{border: '1px solid rgba(93, 122, 156, 0.8)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                  <h3 className="text-lg font-bold text-white mb-3">个人信息</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">性别</span>
                      <span className="text-white">{selectedApp.gender || '未填写'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">如何知道服务器</span>
                      <span className="text-white">{selectedApp.how_found || '未填写'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 答题相关 */}
              {selectedApp.quiz_category && (
                <div className="rounded-lg p-4" style={{border: '1px solid rgba(93, 122, 156, 0.8)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                  <h3 className="text-lg font-bold text-white mb-3">答题信息</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">答题类别</span>
                      <span className="text-white">{selectedApp.quiz_category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">答题得分</span>
                      <span className="text-white">{selectedApp.quiz_score || 0} / {selectedApp.quiz_total || 0}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 其他信息 */}
              {selectedApp.server_experience || selectedApp.griefing_history || selectedApp.additional_info && (
                <div className="rounded-lg p-4" style={{border: '1px solid rgba(93, 122, 156, 0.8)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                  <h3 className="text-lg font-bold text-white mb-3">其他信息</h3>
                  {selectedApp.server_experience && (
                    <div className="mb-3">
                      <div className="text-white/60 mb-1">服务器经验</div>
                      <div className="text-white text-sm">{selectedApp.server_experience}</div>
                    </div>
                  )}
                  {selectedApp.griefing_history && (
                    <div className="mb-3">
                      <div className="text-white/60 mb-1">破坏行为历史</div>
                      <div className="text-white text-sm">{selectedApp.griefing_history}</div>
                    </div>
                  )}
                  {selectedApp.additional_info && (
                    <div>
                      <div className="text-white/60 mb-1">其他信息</div>
                      <div className="text-white text-sm">{selectedApp.additional_info}</div>
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-white/60 text-sm mb-2 font-medium">审核备注</label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="填写审核备注（可选）"
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-white focus:outline-none resize-none"
                  style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedApp(null)}
                className="flex-1 px-4 py-3 hover:bg-white/10 text-white rounded-xl transition-all"
                style={{border: '1px solid rgba(93, 122, 156, 0.8)', backgroundColor: 'rgba(93, 122, 156, 0.5)'}}
              >
                取消
              </button>
              <button
                onClick={() => handleReview(selectedApp.id, 'rejected')}
                disabled={processing}
                className={`flex-1 px-4 py-3 hover:bg-white/30 text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}>
                {processing ? '处理中...' : <><span></span> 拒绝</>}
              </button>
              <button
                onClick={() => handleReview(selectedApp.id, 'approved')}
                disabled={processing}
                className={`flex-1 px-4 py-3 hover:bg-white/30 text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}>
                {processing ? '处理中...' : <><span></span> 通过</>}
              </button>
            </div>
          </div>
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
          minecraftId={blacklistTarget.minecraft_id}
          ipAddress={blacklistTarget.ip_address}
          loading={blacklistingId !== null}
        />
      )}
    </div>
  );
}
