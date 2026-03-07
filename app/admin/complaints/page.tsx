'use client';
import React, { useState, useEffect } from 'react';

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
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // 获取投诉列表
  const fetchComplaints = async () => {
    try {
      const response = await fetch(`/api/complaints?status=${filter}`);
      const result = await response.json();
      if (result.success) {
        setComplaints(result.data);
      }
    } catch (error) {
      console.error('获取投诉列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  // 更新状态
  const updateStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        fetchComplaints();
        if (selectedComplaint?.id === id) {
          setSelectedComplaint({ ...selectedComplaint, status: status as any });
        }
      }
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  // 删除投诉
  const deleteComplaint = async (id: number) => {
    if (!confirm('确定要删除这条投诉吗？')) return;
    
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchComplaints();
        if (selectedComplaint?.id === id) {
          setSelectedComplaint(null);
        }
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  // 状态标签样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'processing': return '处理中';
      case 'resolved': return '已解决';
      case 'rejected': return '已驳回';
      default: return '未知';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-2xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="text-xl font-bold text-blue-400">CT Cloud tops</div>
              <div className="text-xl font-bold text-white">云顶之境</div>
              <span className="text-gray-400 ml-4">|</span>
              <span className="text-lg text-gray-300">投诉管理后台</span>
            </div>
            <a 
              href="/"
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              返回首页
            </a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 pt-32 pb-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">投诉举报管理</h1>
          
          {/* 筛选器 */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">全部状态</option>
            <option value="pending">待处理</option>
            <option value="processing">处理中</option>
            <option value="resolved">已解决</option>
            <option value="rejected">已驳回</option>
          </select>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {['pending', 'processing', 'resolved', 'rejected'].map((status) => (
            <div key={status} className="bg-gray-800/70 p-4 rounded-xl border border-gray-700">
              <div className={`text-2xl font-bold ${getStatusStyle(status).split(' ')[1]}`}>
                {complaints.filter(c => c.status === status).length}
              </div>
              <div className="text-gray-400 text-sm">{getStatusText(status)}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 投诉列表 */}
          <div className="space-y-4">
            {complaints.length === 0 ? (
              <div className="bg-gray-800/70 p-8 rounded-xl border border-gray-700 text-center text-gray-400">
                暂无投诉记录
              </div>
            ) : (
              complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  onClick={() => setSelectedComplaint(complaint)}
                  className={`bg-gray-800/70 p-4 rounded-xl border cursor-pointer transition-all hover:bg-gray-700/70 ${
                    selectedComplaint?.id === complaint.id ? 'border-blue-500' : 'border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-gray-400 text-sm">被举报：</span>
                      <span className="text-white font-medium">{complaint.target_player}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs border ${getStatusStyle(complaint.status)}`}>
                      {getStatusText(complaint.status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    举报人：{complaint.reporter_name} | {complaint.created_at}
                  </div>
                  <div className="text-sm text-gray-300 truncate">
                    {complaint.violation_type}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 投诉详情 */}
          <div className="bg-gray-800/70 p-6 rounded-xl border border-gray-700 sticky top-32">
            {selectedComplaint ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold">投诉详情 #{selectedComplaint.id}</h2>
                  <button
                    onClick={() => deleteComplaint(selectedComplaint.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    删除
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-gray-400 text-sm">被举报玩家</div>
                    <div className="text-white font-medium">{selectedComplaint.target_player}</div>
                  </div>

                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-gray-400 text-sm">举报人</div>
                    <div className="text-white">{selectedComplaint.reporter_name}</div>
                    <div className="text-gray-400 text-sm mt-1">QQ: {selectedComplaint.reporter_qq}</div>
                  </div>

                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-gray-400 text-sm">违规时间</div>
                    <div className="text-white">{selectedComplaint.violation_time || '未填写'}</div>
                  </div>

                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-gray-400 text-sm">违规类型</div>
                    <div className="text-white">{selectedComplaint.violation_type}</div>
                  </div>

                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-gray-400 text-sm">违规描述</div>
                    <div className="text-white whitespace-pre-wrap">{selectedComplaint.description || '未填写'}</div>
                  </div>

                  {selectedComplaint.evidence && (
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-gray-400 text-sm">证据</div>
                      <div className="text-white">{selectedComplaint.evidence}</div>
                    </div>
                  )}

                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-gray-400 text-sm">提交时间</div>
                    <div className="text-white">{selectedComplaint.created_at}</div>
                  </div>
                </div>

                {/* 状态操作 */}
                <div className="pt-4 border-t border-gray-700">
                  <div className="text-gray-400 text-sm mb-3">更改状态</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'pending', label: '待处理', color: 'yellow' },
                      { value: 'processing', label: '处理中', color: 'blue' },
                      { value: 'resolved', label: '已解决', color: 'green' },
                      { value: 'rejected', label: '已驳回', color: 'red' },
                    ].map((status) => (
                      <button
                        key={status.value}
                        onClick={() => updateStatus(selectedComplaint.id, status.value)}
                        disabled={selectedComplaint.status === status.value}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedComplaint.status === status.value
                            ? `bg-${status.color}-500/30 text-${status.color}-400 cursor-default`
                            : `bg-gray-700 hover:bg-${status.color}-500/20 text-gray-300`
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                点击左侧投诉查看详情
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
