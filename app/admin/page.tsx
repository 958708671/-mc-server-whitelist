'use client';
import React from 'react';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">欢迎来到管理后台</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          href="/admin/complaints"
          className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-colors group"
        >
          <div className="flex items-center space-x-4">
            <div className="text-4xl">📋</div>
            <div>
              <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                投诉管理
              </h3>
              <p className="text-gray-400 text-sm mt-1">查看和处理玩家投诉</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/website"
          className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-colors group"
        >
          <div className="flex items-center space-x-4">
            <div className="text-4xl">🌐</div>
            <div>
              <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                官网编辑
              </h3>
              <p className="text-gray-400 text-sm mt-1">编辑官网内容和设置</p>
            </div>
          </div>
        </a>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 opacity-50">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">📊</div>
            <div>
              <h3 className="text-xl font-semibold text-white">数据统计</h3>
              <p className="text-gray-400 text-sm mt-1">即将上线</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">快速操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/complaints?status=pending"
            className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-center hover:bg-yellow-500/30 transition-colors"
          >
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-yellow-400 font-semibold">待处理投诉</div>
          </a>
          <a
            href="/admin/complaints?status=processing"
            className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-center hover:bg-blue-500/30 transition-colors"
          >
            <div className="text-2xl mb-2">🔄</div>
            <div className="text-blue-400 font-semibold">处理中</div>
          </a>
          <a
            href="/admin/complaints?status=resolved"
            className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center hover:bg-green-500/30 transition-colors"
          >
            <div className="text-2xl mb-2">✅</div>
            <div className="text-green-400 font-semibold">已解决</div>
          </a>
          <a
            href="/admin/complaints?status=rejected"
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center hover:bg-red-500/30 transition-colors"
          >
            <div className="text-2xl mb-2">❌</div>
            <div className="text-red-400 font-semibold">已驳回</div>
          </a>
        </div>
      </div>
    </div>
  );
}
