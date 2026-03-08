'use client';
import React, { useState } from 'react';

export default function ComplaintPage() {
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterQQ: '',
    targetPlayer: '',
    violationYear: '',
    violationMonth: '',
    violationDay: '',
    violationTime: '',
    violationType: '',
    description: '',
    evidence: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [useDatePicker, setUseDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const violationCategories = [
    { category: '破坏行为', types: ['破坏他人房屋', '破坏公共设施', '故意烧毁建筑', '炸毁他人基地', '破坏红石电路', '破坏农场/牧场'], icon: '💥' },
    { category: '地形破坏', types: ['恶意挖空地形', '制造岩浆陷阱', '制造深坑陷阱', '破坏地形美观'], icon: '🏔️' },
    { category: '偷窃行为', types: ['偷窃箱子物品', '偷窃展示框物品', '偷窃盔甲架装备', '偷窃矿车/船只', '偷窃宠物', '偷窃农作物'], icon: '📦' },
    { category: '侵占行为', types: ['强占他人房屋', '在他人家中建造', '堵塞他人通道', '恶意包围他人建筑'], icon: '🏠' },
    { category: '作弊外挂', types: ['使用Xray透视', '使用飞行外挂', '使用加速外挂', '使用杀戮光环', '使用自动点击器', '使用穿墙外挂', '使用无敌外挂', '使用瞬移外挂'], icon: '⚡' },
    { category: '漏洞利用', types: ['利用刷物品漏洞', '利用复制漏洞', '利用透视漏洞', '利用伤害漏洞', '利用游戏机制漏洞'], icon: '🔧' },
    { category: '脚本使用', types: ['使用挖矿脚本', '使用钓鱼脚本', '使用种植脚本', '使用攻击脚本', '使用移动脚本', '使用建造脚本'], icon: '🤖' },
    { category: '恶意PVP', types: ['恶意击杀其他玩家', '恶意攻击其他玩家', '恶意追杀其他玩家', '恶意堵截其他玩家', '利用游戏机制击杀', '恶意卡位', '恶意消耗'], icon: '⚔️' },
    { category: '骚扰行为', types: ['言语骚扰', '跟踪骚扰', '恶意打扰', '持续攻击', '恶意举报', '造谣诽谤'], icon: '😤' },
    { category: '威胁行为', types: ['威胁人身安全', '威胁破坏建筑', '威胁盗取账号', '威胁泄露信息', '威胁踢出服务器'], icon: '⚠️' },
    { category: '诈骗行为', types: ['交易诈骗', '装备诈骗', '虚假承诺', '冒充他人诈骗', '钓鱼链接'], icon: '🎭' },
    { category: '冒充行为', types: ['冒充管理员', '冒充服主', '冒充其他玩家', '冒充官方人员', '使用相似ID'], icon: '👤' },
    { category: '刷屏行为', types: ['重复发言刷屏', '无意义刷屏', '大段文字刷屏', '快速连续发言', '使用宏刷屏'], icon: '💬' },
    { category: '广告宣传', types: ['宣传其他服务器', '发送广告链接', '推广QQ群/微信群', '推广Discord', '推广商业内容'], icon: '📢' },
    { category: '不当内容', types: ['辱骂他人', '人身攻击', '歧视言论', '政治敏感', '色情内容', '暴力内容', '恶意引战'], icon: '🚫' },
    { category: '隐私泄露', types: ['泄露他人隐私', '泄露他人信息', '公开他人IP', '公开他人地址', '公开他人电话'], icon: '🔓' },
    { category: '账号安全', types: ['盗取他人账号', '尝试破解密码', '社工欺骗', '木马盗号'], icon: '🔐' },
    { category: '规避行为', types: ['使用小号', '更换IP规避', '使用VPN规避', '冒用他人身份'], icon: '🏃' },
    { category: '恶意卡顿', types: ['制造大量实体', '制造红石卡顿', '恶意放置方块', '制造粒子效果', '故意造成延迟'], icon: '🔴' },
    { category: '权限滥用', types: ['滥用管理员权限', '滥用传送权限', '滥用创造模式'], icon: '👑' },
    { category: '其他违规', types: ['虚假举报', '恶意投诉', '破坏游戏规则', '其他违规行为'], icon: '❓' }
  ];

  const getDaysInMonth = (year: string, month: string) => {
    if (!year || !month) return 31;
    const y = parseInt(year);
    const m = parseInt(month);
    if (m === 2) {
      return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0) ? 29 : 28;
    }
    if ([4, 6, 9, 11].includes(m)) {
      return 30;
    }
    return 31;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'violationYear' || name === 'violationMonth') {
        newData.violationDay = '';
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmitStatus('success');
        setFormData({
          reporterName: '',
          reporterQQ: '',
          targetPlayer: '',
          violationYear: '',
          violationMonth: '',
          violationDay: '',
          violationTime: '',
          violationType: '',
          description: '',
          evidence: ''
        });
        setSelectedCategory('');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('提交失败:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const copyQQ = (qqNumber: string) => {
    navigator.clipboard.writeText(qqNumber);
    alert('QQ号已复制：' + qqNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b-2 border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center text-xl shadow-lg border-2 border-emerald-400/50 group-hover:scale-110 transition-transform">
                ⛏️
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-400">CT Cloud tops</div>
                <div className="text-sm text-gray-400">云顶之境</div>
              </div>
            </a>
            <a 
              href="/"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl border border-gray-700"
            >
              <span>🏠</span>
              <span>返回首页</span>
            </a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 pt-32 pb-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl text-4xl shadow-2xl border-2 border-rose-400/50 mb-6">
            📋
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-rose-400 via-red-400 to-orange-400 bg-clip-text text-transparent">
            投诉举报中心
          </h1>
          <p className="text-gray-400 text-lg">维护服务器秩序，共建和谐游戏环境</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6 rounded-2xl border-2 border-cyan-500/30 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                ℹ️
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">举报须知</h3>
                <p className="text-gray-300">
                  如果您在游戏中遇到违规行为，欢迎向我们举报。请提供准确的信息和证据，我们会认真处理每一份举报，维护良好的游戏环境。
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-800/50 p-8 rounded-2xl border-2 border-gray-700 space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center text-xl">
                ✏️
              </div>
              <h2 className="text-2xl font-bold text-white">填写举报信息</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
                <label className="flex items-center gap-2 text-gray-300 mb-3 font-medium">
                  <span className="text-lg">👤</span>
                  您的游戏ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="reporterName"
                  value={formData.reporterName}
                  onChange={handleChange}
                  required
                  pattern="[a-zA-Z0-9_]+"
                  title="游戏ID只能包含英文字母、数字和下划线"
                  className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                  placeholder="请输入您的游戏ID"
                />
                <p className="text-gray-500 text-sm mt-2">仅限英文、数字、下划线</p>
              </div>
              <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
                <label className="flex items-center gap-2 text-gray-300 mb-3 font-medium">
                  <span className="text-lg">💬</span>
                  您的QQ号 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="reporterQQ"
                  value={formData.reporterQQ}
                  onChange={handleChange}
                  required
                  pattern="[1-9][0-9]{4,10}"
                  title="请输入正确的QQ号（5-11位数字）"
                  className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                  placeholder="请输入您的QQ号"
                />
                <p className="text-gray-500 text-sm mt-2">用于联系您反馈处理结果</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-rose-500/10 to-orange-500/10 p-5 rounded-xl border border-rose-500/30">
              <label className="flex items-center gap-2 text-gray-300 mb-3 font-medium">
                <span className="text-lg">🎮</span>
                违规玩家游戏ID <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="targetPlayer"
                value={formData.targetPlayer}
                onChange={handleChange}
                required
                pattern="[a-zA-Z0-9_]+"
                title="游戏ID只能包含英文字母、数字和下划线"
                className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-all"
                placeholder="请输入违规玩家的游戏ID"
              />
            </div>

            <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-gray-300 font-medium">
                  <span className="text-lg">⏰</span>
                  违规时间 <span className="text-gray-500 text-sm">(可选)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setUseDatePicker(!useDatePicker)}
                  className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors flex items-center gap-1"
                >
                  <span>{useDatePicker ? '📅' : '🗓️'}</span>
                  {useDatePicker ? '使用快速选择' : '使用日期选择器'}
                </button>
              </div>
              
              {useDatePicker ? (
                <div className="space-y-3">
                  <input
                    type="date"
                    value={formData.violationTime ? formData.violationTime.split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value;
                      const time = formData.violationTime ? formData.violationTime.split('T')[1] || '12:00' : '12:00';
                      setFormData(prev => ({ ...prev, violationTime: `${date}T${time}` }));
                    }}
                    className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
                  />
                  <input
                    type="time"
                    value={formData.violationTime ? formData.violationTime.split('T')[1] || '' : ''}
                    onChange={(e) => {
                      const date = formData.violationTime ? formData.violationTime.split('T')[0] : new Date().toISOString().split('T')[0];
                      const time = e.target.value;
                      setFormData(prev => ({ ...prev, violationTime: `${date}T${time}` }));
                    }}
                    className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <select
                    name="violationYear"
                    value={formData.violationYear}
                    onChange={handleChange}
                    className="bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
                  >
                    <option value="">选择年份</option>
                    <option value="2026">2026年</option>
                    <option value="2025">2025年</option>
                    <option value="2024">2024年</option>
                  </select>
                  <select
                    name="violationMonth"
                    value={formData.violationMonth}
                    onChange={handleChange}
                    className="bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
                  >
                    <option value="">选择月份</option>
                    {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                      <option key={m} value={m}>{parseInt(m)}月</option>
                    ))}
                  </select>
                  <select
                    name="violationDay"
                    value={formData.violationDay}
                    onChange={handleChange}
                    className="bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
                  >
                    <option value="">选择日期</option>
                    {Array.from({ length: getDaysInMonth(formData.violationYear, formData.violationMonth) }, (_, i) => {
                      const day = (i + 1).toString().padStart(2, '0');
                      return <option key={day} value={day}>{i + 1}日</option>;
                    })}
                  </select>
                </div>
              )}
            </div>

            <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
              <label className="flex items-center gap-2 text-gray-300 mb-3 font-medium">
                <span className="text-lg">🏷️</span>
                违规类型 <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm mb-2">第一步：选择大分类</p>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setFormData(prev => ({ ...prev, violationType: '' }));
                    }}
                    required
                    className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
                  >
                    <option value="">请选择大分类</option>
                    {violationCategories.map((cat, index) => (
                      <option key={index} value={cat.category}>{cat.icon} {cat.category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-2">第二步：选择具体违规</p>
                  <select
                    name="violationType"
                    value={formData.violationType}
                    onChange={handleChange}
                    required
                    disabled={!selectedCategory}
                    className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">请选择具体违规</option>
                    {selectedCategory && violationCategories.find(c => c.category === selectedCategory)?.types.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
              <label className="flex items-center gap-2 text-gray-300 mb-3 font-medium">
                <span className="text-lg">📝</span>
                违规描述 <span className="text-rose-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all resize-none"
                placeholder="请详细描述违规行为，包括时间、地点、经过等..."
              />
            </div>

            <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700">
              <label className="flex items-center gap-2 text-gray-300 mb-3 font-medium">
                <span className="text-lg">🔗</span>
                证据链接 <span className="text-gray-500 text-sm">(可选)</span>
              </label>
              <input
                type="url"
                name="evidence"
                value={formData.evidence}
                onChange={handleChange}
                className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                placeholder="截图或视频链接（如百度网盘、腾讯微云等）"
              />
              <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                <span>💡</span>
                <span>建议上传截图或视频到云盘，然后粘贴分享链接</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
                  isSubmitting 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-lg hover:shadow-rose-500/25'
                } text-white`}
              >
                <span className="text-xl">{isSubmitting ? '⏳' : '📤'}</span>
                <span>{isSubmitting ? '提交中...' : '提交举报'}</span>
              </button>
            </div>

            {submitStatus === 'success' && (
              <div className="bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 p-5 rounded-xl text-center flex items-center justify-center gap-3">
                <span className="text-2xl">✅</span>
                <span className="text-lg">举报提交成功！我们会尽快处理。</span>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="bg-rose-500/20 border-2 border-rose-500/50 text-rose-400 p-5 rounded-xl text-center flex items-center justify-center gap-3">
                <span className="text-2xl">❌</span>
                <span className="text-lg">提交失败，请稍后重试或联系管理员。</span>
              </div>
            )}
          </form>

          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6 rounded-2xl border-2 border-amber-500/30 mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-xl">
                👑
              </div>
              <h2 className="text-xl font-bold text-amber-400">联系管理员</h2>
            </div>
            <p className="text-gray-300 mb-4">紧急情况下，您也可以直接联系管理员：</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-lg">
                    👑
                  </div>
                  <div>
                    <span className="text-white font-medium">服主 - yan_hong_jun</span>
                    <p className="text-gray-400 text-sm">QQ: 958708671</p>
                  </div>
                </div>
                <button
                  onClick={() => copyQQ('958708671')}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-all flex items-center gap-2"
                >
                  <span>📋</span>
                  复制QQ
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25"
            >
              <span>🏠</span>
              <span>返回首页</span>
            </a>
          </div>
        </div>
      </div>

      <footer className="bg-black/50 border-t-2 border-gray-700 py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center text-lg">
              ⛏️
            </div>
            <span className="text-gray-400">CT Cloud tops 云顶之境</span>
          </div>
          <p className="text-gray-500 text-sm">本服务器为玩家社群自发组建与维护，与 Mojang AB 无任何关联。</p>
          <p className="text-gray-500 text-sm mt-2">遇到问题？请联系管理员 QQ: 958708671</p>
        </div>
      </footer>
    </div>
  );
}
