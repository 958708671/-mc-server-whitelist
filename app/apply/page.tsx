// 文件位置： app/apply/page.tsx
"use client"; // 这意味着这个页面会有交互功能（如点击提交）

import { useState } from 'react';

export default function ApplyPage() {
  // 状态，用于存储表单填写的数据
  const [formData, setFormData] = useState({
    minecraftId: '',
    age: '',
    contact: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // 处理输入框变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理表单提交（模拟）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 阻止页面刷新
    setIsSubmitting(true);
    setSubmitMessage('');

    // 这里是模拟提交，后续会连接真实数据库
    console.log('提交的数据：', formData);
    
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    // 模拟成功
    setSubmitMessage('✅ 申请已成功提交！管理员将在24小时内审核，请留意您的联系方式（QQ/邮箱）。提交后不可自行修改。');
    // 清空表单
    setFormData({ minecraftId: '', age: '', contact: '', reason: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* 返回首页链接 */}
        <a href="/" className="inline-flex items-center text-green-400 hover:text-green-300 mb-8">
          ← 返回首页
        </a>

        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">星光之境 白名单申请</h1>
          <p className="text-xl text-gray-300">
            请认真填写以下信息。我们希望通过这份申请了解您，共同维护友好的游戏环境。
          </p>
          <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-left">
            <p className="font-bold text-yellow-300">⚠️ 重要须知：</p>
            <ul className="mt-2 text-gray-300 list-disc list-inside space-y-1 text-sm">
              <li>本服务器为<strong>纯净生存</strong>，无特权、无赞助。</li>
              <li>服主“甩手”，服务器由社群共治，请确保您能遵守<a href="/rules" className="text-green-400 underline">服务器规则</a>。</li>
              <li>申请提交后<strong>无法自行修改</strong>，如需修改请联系管理员。</li>
              <li>审核通过后，管理员会通过您留下的联系方式（QQ/邮箱）通知您。</li>
              <li>我们通常会在<strong>24小时内</strong>完成审核，请耐心等待。</li>
            </ul>
          </div>
        </div>

        {/* 申请表单 */}
        <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 游戏ID */}
            <div>
              <label htmlFor="minecraftId" className="block text-lg font-medium mb-2">
                您的 Minecraft 游戏ID (正版ID) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="minecraftId"
                name="minecraftId"
                value={formData.minecraftId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="请输入您的正版游戏ID，例如: Steve_2024"
              />
              <p className="mt-2 text-sm text-gray-500">请确保ID准确无误，这是您加入服务器的唯一身份标识。</p>
            </div>

            {/* 年龄 */}
            <div>
              <label htmlFor="age" className="block text-lg font-medium mb-2">
                您的年龄 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="12"
                max="80"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="请输入您的年龄，例如: 18"
              />
              <p className="mt-2 text-sm text-gray-500">我们建议玩家年龄在16岁以上，以确保良好的交流氛围。</p>
            </div>

            {/* 联系方式 */}
            <div>
              <label htmlFor="contact" className="block text-lg font-medium mb-2">
                主要联系方式 (QQ 或 邮箱) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="例如: 123456789 或 your-email@example.com"
              />
              <p className="mt-2 text-sm text-gray-500">审核结果将通过此方式通知您，请务必填写准确。</p>
            </div>

            {/* 申请理由 */}
            <div>
              <label htmlFor="reason" className="block text-lg font-medium mb-2">
                请简单说说您为什么想加入我们？ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                placeholder="可以谈谈您对Minecraft的喜好、游戏风格、对社群共建的看法，或者任何想对我们说的话..."
              />
              <p className="mt-2 text-sm text-gray-500">真诚的自我介绍能帮助管理员更快地了解您。至少50字为佳。</p>
            </div>

            {/* 提交按钮 */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 text-xl font-bold rounded-lg transition duration-300 ${isSubmitting
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 shadow-lg'
                  }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">...</svg>
                    提交中...
                  </span>
                ) : (
                  '📨 提交白名单申请'
                )}
              </button>

              {/* 提交后的提示信息 */}
              {submitMessage && (
                <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-lg">
                  <p className="text-green-300">{submitMessage}</p>
                </div>
              )}

              <p className="mt-6 text-center text-gray-500 text-sm">
                点击提交即表示您已阅读并同意遵守服务器规则。如有疑问，请通过首页底部的联系方式咨询。
              </p>
            </div>
          </form>
        </div>

        {/* 页脚备注 */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>星光之境管理组 保留对本申请的最终解释权。我们承诺公平审核每一份申请。</p>
          <p className="mt-2">服务器运行状态及更多信息，请访问<a href="/" className="text-green-400 underline">官网首页</a>。</p>
        </div>
      </div>
    </div>
  );
}