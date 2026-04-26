'use client';

import { useState, useEffect } from 'react';

interface QuizAttempt {
  ip_address: string;
  attempt_date: string;
  attempt_count: number;
  created_at: string;
  updated_at: string;
}

export default function QuizAttemptsPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchIP, setSearchIP] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [actionIP, setActionIP] = useState('');
  const [actionType, setActionType] = useState<'reset' | 'unlock' | ''>('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchIP) params.append('ip', searchIP);
      if (searchDate) params.append('date', searchDate);

      const res = await fetch(`/api/admin/quiz-attempts?${params}`);
      const data = await res.json();

      if (data.success) {
        setAttempts(data.data);
      }
    } catch (error) {
      console.error('获取答题记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchAttempts();
  };

  const handleAction = async () => {
    if (!actionIP || !actionType) return;

    try {
      const res = await fetch('/api/admin/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: actionIP, action: actionType })
      });

      const data = await res.json();

      if (data.success) {
        alert(data.message);
        setShowConfirm(false);
        setActionIP('');
        setActionType('');
        fetchAttempts();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败');
    }
  };

  const openActionModal = (ip: string, action: 'reset' | 'unlock') => {
    setActionIP(ip);
    setActionType(action);
    setShowConfirm(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">答题次数管理</h1>
        <p className="text-gray-400">管理用户的答题次数限制（普通用户每天最多答题 3 次）</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-400 mb-2">IP 地址</label>
            <input
              type="text"
              value={searchIP}
              onChange={(e) => setSearchIP(e.target.value)}
              placeholder="搜索 IP 地址"
              className="bg-gray-700 text-white px-4 py-2 rounded-lg w-64"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">日期</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            搜索
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchIP('');
              setSearchDate('');
              setLoading(true);
              fetchAttempts();
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
          >
            重置
          </button>
        </form>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">IP 地址</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">日期</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">答题次数</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">更新时间</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  加载中...
                </td>
              </tr>
            ) : attempts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  暂无记录
                </td>
              </tr>
            ) : (
              attempts.map((attempt, index) => (
                <tr key={index} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-white font-mono">{attempt.ip_address}</td>
                  <td className="px-6 py-4 text-gray-300">{attempt.attempt_date}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${
                      attempt.attempt_count >= 3 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {attempt.attempt_count}/3
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{attempt.updated_at}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openActionModal(attempt.ip_address, 'reset')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                      >
                        重置
                      </button>
                      <button
                        onClick={() => openActionModal(attempt.ip_address, 'unlock')}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        解除限制
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">确认操作</h3>
            <p className="text-gray-300 mb-2">
              确定要对 IP <span className="font-mono text-yellow-400">{actionIP}</span> 执行"
              {actionType === 'reset' ? '重置答题次数' : '解除限制'}
              "吗？
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {actionType === 'reset'
                ? '将该 IP 的今日答题次数重置为 0'
                : '完全删除该 IP 的答题记录，解除所有限制'}
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleAction}
                className={`${
                  actionType === 'reset'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-red-600 hover:bg-red-700'
                } text-white px-6 py-2 rounded-lg`}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
