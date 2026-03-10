'use client';

import { useState, useEffect } from 'react';

interface Event {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
}

interface Announcement {
  id: number;
  title: string;
  created_at: string;
}

interface OverviewStats {
  whitelist: {
    total_whitelist: string;
    pending_applications: string;
    rejected_applications: string;
    new_whitelist_week: string;
  };
  complaints: {
    total_complaints: string;
    pending_complaints: string;
    processing_complaints: string;
    resolved_complaints: string;
    rejected_complaints: string;
  };
  blacklist: {
    total_blacklist: string;
    permanent_blacklist: string;
    temporary_blacklist: string;
  };
  announcements: {
    total_announcements: string;
  };
  events: {
    total_events: string;
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
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminInfo');
    if (savedAdmin) {
      setAdminInfo(JSON.parse(savedAdmin));
    }
    fetchStatistics();
    fetchEvents();
    fetchAnnouncements();
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

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('获取活动数据失败:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements');
      const data = await response.json();
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (error) {
      console.error('获取公告数据失败:', error);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="bg-linear-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">👥</span>
                <span className="text-green-400 text-sm">白名单</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.whitelist.total_whitelist}</div>
              <div className="text-gray-400 text-sm mt-1">总人数</div>
            </div>
            
            <div className="bg-linear-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">📝</span>
                <span className="text-yellow-400 text-sm">待审核</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.whitelist.pending_applications}</div>
              <div className="text-gray-400 text-sm mt-1">白名单申请</div>
            </div>
            
            <div className="bg-linear-to-br from-red-900/30 to-red-800/20 border border-red-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">❌</span>
                <span className="text-red-400 text-sm">已拒绝</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.whitelist.rejected_applications}</div>
              <div className="text-gray-400 text-sm mt-1">白名单申请</div>
            </div>
            
            <div className="bg-linear-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">📢</span>
                <span className="text-blue-400 text-sm">投诉</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.complaints.total_complaints}</div>
              <div className="text-gray-400 text-sm mt-1">总投诉数</div>
            </div>
            
            <div className="bg-linear-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🚫</span>
                <span className="text-purple-400 text-sm">黑名单</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.blacklist.total_blacklist}</div>
              <div className="text-gray-400 text-sm mt-1">封禁人数</div>
            </div>
            
            <div className="bg-linear-to-br from-orange-900/30 to-orange-800/20 border border-orange-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">⏳</span>
                <span className="text-orange-400 text-sm">处理中</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.complaints.processing_complaints}</div>
              <div className="text-gray-400 text-sm mt-1">投诉</div>
            </div>
            
            <div className="bg-linear-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">✅</span>
                <span className="text-green-400 text-sm">已解决</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.complaints.resolved_complaints}</div>
              <div className="text-gray-400 text-sm mt-1">投诉</div>
            </div>
            
            <div className="bg-linear-to-br from-red-900/30 to-red-800/20 border border-red-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">❌</span>
                <span className="text-red-400 text-sm">已驳回</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.complaints.rejected_complaints}</div>
              <div className="text-gray-400 text-sm mt-1">投诉</div>
            </div>
            
            <div className="bg-linear-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🔄</span>
                <span className="text-yellow-400 text-sm">临时封禁</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.blacklist.temporary_blacklist}</div>
              <div className="text-gray-400 text-sm mt-1">黑名单</div>
            </div>
            
            <div className="bg-linear-to-br from-red-900/30 to-red-800/20 border border-red-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🔒</span>
                <span className="text-red-400 text-sm">永久封禁</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.blacklist.permanent_blacklist}</div>
              <div className="text-gray-400 text-sm mt-1">黑名单</div>
            </div>
            
            <div className="bg-linear-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">📢</span>
                <span className="text-blue-400 text-sm">公告</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.announcements.total_announcements}</div>
              <div className="text-gray-400 text-sm mt-1">总条数</div>
            </div>
            
            <div className="bg-linear-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🎉</span>
                <span className="text-green-400 text-sm">活动</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.events.total_events}</div>
              <div className="text-gray-400 text-sm mt-1">总条数</div>
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

      {/* 日历组件 */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>📅</span> 活动和公告日历
        </h3>
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            上个月
          </button>
          <h4 className="text-xl font-bold text-white">
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
          </h4>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            下个月
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center">
          {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
            <div key={index} className="text-gray-400 font-semibold py-2">
              {day}
            </div>
          ))}
          
          {/* 生成日历日期 */}
          {(() => {
            const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
            const dates = [];
            
            // 填充上个月的日期
            for (let i = 0; i < firstDayOfMonth; i++) {
              dates.push(null);
            }
            
            // 填充当前月的日期
            for (let i = 1; i <= daysInMonth; i++) {
              dates.push(i);
            }
            
            return dates.map((date, index) => {
              if (!date) {
                return <div key={index} className="h-16 p-1"></div>;
              }
              
              const currentDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
              
              // 检查当天是否有活动
              const dayEvents = events.filter(event => {
                const eventStart = new Date(event.start_time);
                const eventEnd = new Date(event.end_time);
                const checkDate = new Date(currentDateStr);
                return checkDate >= eventStart && checkDate <= eventEnd;
              });
              
              // 检查当天是否有公告
              const dayAnnouncements = announcements.filter(announcement => {
                const announcementDate = new Date(announcement.created_at);
                return announcementDate.toDateString() === new Date(currentDateStr).toDateString();
              });
              
              return (
                <div 
                  key={index} 
                  className={`h-16 p-1 border rounded-lg transition-colors ${
                    new Date().toDateString() === new Date(currentDateStr).toDateString() 
                      ? 'bg-blue-900/30 border-blue-700' 
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <div className="text-white font-medium">{date}</div>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event, i) => (
                      <div key={i} className="text-xs text-green-400 truncate">
                        🎉 {event.title}
                      </div>
                    ))}
                    {dayAnnouncements.slice(0, 2).map((announcement, i) => (
                      <div key={i} className="text-xs text-blue-400 truncate">
                        📢 {announcement.title}
                      </div>
                    ))}
                    {(dayEvents.length + dayAnnouncements.length) > 4 && (
                      <div className="text-xs text-gray-400">
                        +{dayEvents.length + dayAnnouncements.length - 4} 更多
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
