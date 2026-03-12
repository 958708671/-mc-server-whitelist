import React from 'react';

interface DbErrorNotificationProps {
  onClose: () => void;
}

export default function DbErrorNotification({ onClose }: DbErrorNotificationProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-red-900 border-2 border-red-500 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-red-500 rounded-full p-2">
              <span className="text-white text-xl">⚠️</span>
            </div>
            <h3 className="text-white text-xl font-bold">数据库连接失败</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="mt-4 text-red-100">
          <p className="mb-2">无法连接到数据库，已自动切换到模拟数据库模式。</p>
          <p className="text-sm opacity-80">所有操作将在本地模拟数据库中进行，网络恢复后可同步数据。</p>
        </div>
        <div className="mt-6 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            知道了
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg transition-colors"
          >
            缩小到角落
          </button>
        </div>
      </div>
    </div>
  );
}
