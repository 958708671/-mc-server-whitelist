'use client';

import { useState, useEffect } from 'react';

interface OverviewStats {
  whitelist: {
    total_whitelist: string;
    pending_applications: string;
    new_whitelist_week: string;
  };
  complaints: {
    total_complaints: string;
    pending_complaints: string;
    resolved_complaints: string;
  };
  blacklist: {
    total_blacklist: string;
  };
}

interface AdminRanking {
  username: string;
  id: number;
  whitelist_reviews: string;
  complaint_handles: string;
}

export default function StatisticsPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [rankings, setRankings] = useState<AdminRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<{ user: string; adminId: number; role?: string } | null>(null);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminInfo');
    if (savedAdmin) {
      setAdminInfo(JSON.parse(savedAdmin));
    }
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const [overviewRes, rankingsRes] = await Promise.all([
        fetch('/api/statistics?type=overview'),
        fetch('/api/statistics?type=admin-rankings')
      ]);
      
      const overviewData = await overviewRes.json();
      const rankingsData = await rankingsRes.json();
      
      if (overviewData.success) {
        setOverview(overviewData.data);
      }
      if (rankingsData.success) {
        setRankings(rankingsData.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-bounce">📊</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📊</span> 数据统计
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {adminInfo?.role === 'owner' ? '全局数据统计面板' : '查看服务器运营数据'}
        </p>
      </div>

      {overview && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">👥</span>
                <span className="text-green-400 text-sm">白名单</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.whitelist.total_whitelist}</div>
              <div className="text-gray-400 text-sm mt-1">总人数</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">📝</span>
                <span className="text-yellow-400 text-sm">待审核</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.whitelist.pending_applications}</div>
              <div className="text-gray-400 text-sm mt-1">白名单申请</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">📢</span>
                <span className="text-blue-400 text-sm">投诉</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.complaints.total_complaints}</div>
              <div className="text-gray-400 text-sm mt-1">总投诉数</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🚫</span>
                <span className="text-red-400 text-sm">黑名单</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.blacklist.total_blacklist}</div>
              <div className="text-gray-400 text-sm mt-1">封禁人数</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📈</span> 本周数据
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">新增白名单</span>
                  <span className="text-green-400 font-bold">{overview.whitelist.new_whitelist_week}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">待处理投诉</span>
                  <span className="text-yellow-400 font-bold">{overview.complaints.pending_complaints}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">已解决投诉</span>
                  <span className="text-blue-400 font-bold">{overview.complaints.resolved_complaints}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📊</span> 数据概览
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">白名单通过率</span>
                  <span className="text-green-400 font-bold">
                    {overview.whitelist.total_whitelist && overview.whitelist.pending_applications
                      ? Math.round(
                          (parseInt(overview.whitelist.total_whitelist) / 
                          (parseInt(overview.whitelist.total_whitelist) + parseInt(overview.whitelist.pending_applications))) * 100
                        )
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">投诉解决率</span>
                  <span className="text-blue-400 font-bold">
                    {overview.complaints.total_complaints && overview.complaints.resolved_complaints
                      ? Math.round(
                          (parseInt(overview.complaints.resolved_complaints) / 
                          parseInt(overview.complaints.total_complaints)) * 100
                        )
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">封禁比例</span>
                  <span className="text-red-400 font-bold">
                    {overview.whitelist.total_whitelist && overview.blacklist.total_blacklist
                      ? Math.round(
                          (parseInt(overview.blacklist.total_blacklist) / 
                          parseInt(overview.whitelist.total_whitelist)) * 100
                        )
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {adminInfo?.role === 'owner' && rankings.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🏆</span> 管理员工作量排行
          </h3>
          <div className="space-y-3">
            {rankings.map((admin, index) => (
              <div 
                key={admin.id}
                className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xl ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-300' :
                    index === 2 ? 'text-orange-400' : 'text-gray-500'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <span className="text-white font-medium">{admin.username}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-green-400">白名单: {admin.whitelist_reviews}</span>
                  <span className="text-blue-400">投诉: {admin.complaint_handles}</span>
                  <span className="text-purple-400 font-bold">
                    总计: {parseInt(admin.whitelist_reviews || '0') + parseInt(admin.complaint_handles || '0')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
