'use client';

import { useState, useEffect } from 'react';

interface BlacklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, duration: number | null, isPermanent: boolean) => void;
  minecraftId: string;
  ipAddress?: string;
  loading?: boolean;
}

const PRESET_DURATIONS = [
  { label: '半小时', value: 30 },
  { label: '1小时', value: 60 },
  { label: '6小时', value: 360 },
  { label: '1天', value: 1440 },
  { label: '3天', value: 4320 },
  { label: '7天', value: 10080 },
  { label: '30天', value: 43200 },
];

export default function BlacklistModal({
  isOpen,
  onClose,
  onConfirm,
  minecraftId,
  ipAddress,
  loading = false
}: BlacklistModalProps) {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState<string>('1440');
  const [customDuration, setCustomDuration] = useState('');
  const [customUnit, setCustomUnit] = useState<'minutes' | 'hours' | 'days'>('days');
  const [isCustom, setIsCustom] = useState(false);
  const [isPermanent, setIsPermanent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setDuration('1440');
      setCustomDuration('');
      setIsCustom(false);
      setIsPermanent(false);
    }
  }, [isOpen]);

  const handlePresetClick = (value: number) => {
    setIsCustom(false);
    setIsPermanent(false);
    setDuration(value.toString());
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setIsPermanent(false);
  };

  const handlePermanentClick = () => {
    setIsPermanent(true);
    setIsCustom(false);
  };

  const handleConfirm = () => {
    let finalDuration: number | null = null;
    
    if (isPermanent) {
      finalDuration = null;
    } else if (isCustom && customDuration) {
      const num = parseInt(customDuration);
      if (!isNaN(num) && num > 0) {
        switch (customUnit) {
          case 'minutes':
            finalDuration = num;
            break;
          case 'hours':
            finalDuration = num * 60;
            break;
          case 'days':
            finalDuration = num * 1440;
            break;
        }
      }
    } else {
      finalDuration = parseInt(duration);
    }

    onConfirm(reason, finalDuration, isPermanent);
  };

  const getDurationText = () => {
    if (isPermanent) return '永久';
    if (isCustom && customDuration) {
      return `${customDuration}${customUnit === 'minutes' ? '分钟' : customUnit === 'hours' ? '小时' : '天'}`;
    }
    const mins = parseInt(duration);
    if (mins >= 1440) return `${mins / 1440}天`;
    if (mins >= 60) return `${mins / 60}小时`;
    return `${mins}分钟`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full mx-4 border border-gray-700 shadow-2xl transform animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">🚫</span> 拉黑用户
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <span className="text-gray-500">游戏ID：</span>
              <span className="text-white font-medium">{minecraftId}</span>
            </div>
            {ipAddress && (
              <div className="flex items-center gap-2 text-gray-300 text-sm mt-1">
                <span className="text-gray-500">IP地址：</span>
                <span className="text-white font-mono">{ipAddress}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">封禁原因</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
            >
              <option value="">请选择封禁原因</option>
              <option value="信息填写不符">信息填写不符</option>
              <option value="曾经上过封禁名单">曾经上过封禁名单</option>
              <option value="违规行为">违规行为</option>
              <option value="恶意破坏">恶意破坏</option>
              <option value="作弊行为">作弊行为</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">封禁时长</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_DURATIONS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handlePresetClick(item.value)}
                  disabled={loading}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    !isCustom && !isPermanent && duration === item.value.toString()
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } disabled:opacity-50`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">自定义时长</label>
            <div className="flex gap-2">
              <button
                onClick={handleCustomClick}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isCustom
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } disabled:opacity-50`}
              >
                自定义
              </button>
              {isCustom && (
                <div className="flex-1 flex gap-2">
                  <input
                    type="number"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="输入时长"
                    disabled={loading}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 disabled:opacity-50"
                    min="1"
                  />
                  <select
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value as 'minutes' | 'hours' | 'days')}
                    disabled={loading}
                    className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 disabled:opacity-50"
                  >
                    <option value="minutes">分钟</option>
                    <option value="hours">小时</option>
                    <option value="days">天</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={handlePermanentClick}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isPermanent
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50`}
            >
              永久封禁
            </button>
          </div>

          <div className="bg-gray-900 rounded-lg p-3">
            <div className="text-gray-400 text-sm">
              封禁时长：<span className="text-white font-medium">{getDurationText()}</span>
            </div>
          </div>

          <div className="text-gray-500 text-xs">
            该操作将：添加到黑名单、{ipAddress ? '封禁该IP地址、' : ''}从白名单移除
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !reason}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '处理中...' : '确认拉黑'}
          </button>
        </div>
      </div>
    </div>
  );
}
