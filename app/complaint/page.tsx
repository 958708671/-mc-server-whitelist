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
    violationCategory: '',
    violationSubCategory: '',
    violationDetail: '',
    description: '',
    evidence: ''
  });
  const [useDatePicker, setUseDatePicker] = useState(false); // 切换选择方式
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 违规类型数据结构（三级联动）
  const violationTypes = {
    building: {
      name: '🏗️ 建筑与地形',
      subcategories: {
        destroy: {
          name: '恶意破坏',
          details: ['破坏他人房屋', '破坏公共设施', '故意烧毁建筑', '炸毁他人基地', '破坏红石电路', '破坏农场/牧场']
        },
        terrain: {
          name: '地形改造',
          details: ['恶意挖空地形', '制造岩浆陷阱', '制造深坑陷阱', '破坏地形美观']
        },
        steal: {
          name: '偷窃行为',
          details: ['偷窃箱子物品', '偷窃展示框物品', '偷窃盔甲架装备', '偷窃矿车/船只', '偷窃宠物', '偷窃农作物']
        },
        occupy: {
          name: '强占建筑',
          details: ['强占他人房屋', '在他人家中建造', '堵塞他人通道', '恶意包围他人建筑']
        }
      }
    },
    cheating: {
      name: '💻 作弊与外挂',
      subcategories: {
        client: {
          name: '客户端作弊',
          details: ['使用Xray透视', '使用飞行外挂', '使用加速外挂', '使用杀戮光环', '使用自动点击器', '使用穿墙外挂', '使用无敌外挂', '使用瞬移外挂']
        },
        exploit: {
          name: '漏洞利用',
          details: ['利用刷物品漏洞', '利用复制漏洞', '利用透视漏洞', '利用伤害漏洞', '利用游戏机制漏洞']
        },
        automation: {
          name: '自动化作弊',
          details: ['使用挖矿脚本', '使用钓鱼脚本', '使用种植脚本', '使用攻击脚本', '使用移动脚本', '使用建造脚本']
        }
      }
    },
    pvp: {
      name: '⚔️ PVP与战斗',
      subcategories: {
        kill: {
          name: '恶意击杀玩家',
          details: ['恶意击杀其他玩家', '恶意攻击其他玩家', '恶意追杀其他玩家', '恶意堵截其他玩家']
        },
        abuse: {
          name: '战斗滥用',
          details: ['利用游戏机制击杀', '恶意卡位', '恶意消耗']
        }
      }
    },
    behavior: {
      name: '👤 玩家行为',
      subcategories: {
        harassment: {
          name: '骚扰行为',
          details: ['言语骚扰', '跟踪骚扰', '恶意打扰', '持续攻击', '恶意举报', '造谣诽谤']
        },
        threat: {
          name: '威胁恐吓',
          details: ['威胁人身安全', '威胁破坏建筑', '威胁盗取账号', '威胁泄露信息', '威胁踢出服务器']
        },
        scam: {
          name: '诈骗欺诈',
          details: ['交易诈骗', '装备诈骗', '虚假承诺', '冒充他人诈骗', '钓鱼链接']
        },
        impersonation: {
          name: '冒充行为',
          details: ['冒充管理员', '冒充服主', '冒充其他玩家', '冒充官方人员', '使用相似ID']
        }
      }
    },
    chat: {
      name: '💬 聊天与言论',
      subcategories: {
        spam: {
          name: '刷屏行为',
          details: ['重复发言刷屏', '无意义刷屏', '大段文字刷屏', '快速连续发言', '使用宏刷屏']
        },
        advertising: {
          name: '广告推广',
          details: ['宣传其他服务器', '发送广告链接', '推广QQ群/微信群', '推广Discord', '推广商业内容']
        },
        inappropriate: {
          name: '不当言论',
          details: ['辱骂他人', '人身攻击', '歧视言论', '政治敏感', '色情内容', '暴力内容', '恶意引战']
        },
        leak: {
          name: '信息泄露',
          details: ['泄露他人隐私', '泄露他人信息', '公开他人IP', '公开他人地址', '公开他人电话']
        }
      }
    },
    account: {
      name: '🔐 账号安全',
      subcategories: {
        theft: {
          name: '账号盗取',
          details: ['盗取他人账号', '尝试破解密码', '社工欺骗', '木马盗号']
        },
        ban: {
          name: '规避封禁',
          details: ['使用小号', '更换IP规避', '使用VPN规避', '冒用他人身份']
        }
      }
    },
    other: {
      name: '📌 其他违规',
      subcategories: {
        lag: {
          name: '制造卡顿',
          details: ['制造大量实体', '制造红石卡顿', '恶意放置方块', '制造粒子效果', '故意造成延迟']
        },
        abuse: {
          name: '权限滥用',
          details: ['滥用管理员权限', '滥用传送权限', '滥用创造模式']
        },
        other: {
          name: '其他行为',
          details: ['恶意举报', '虚假举报', '恶意投诉', '破坏游戏规则', '其他违规行为']
        }
      }
    }
  };

  // 获取某年某月的天数
  const getDaysInMonth = (year: string, month: string) => {
    if (!year || !month) return 31;
    const y = parseInt(year);
    const m = parseInt(month);
    // 2月特殊处理（闰年）
    if (m === 2) {
      return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0) ? 29 : 28;
    }
    // 4、6、9、11月有30天
    if ([4, 6, 9, 11].includes(m)) {
      return 30;
    }
    // 其他月份31天
    return 31;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // 如果年份或月份改变，重置日期
      if (name === 'violationYear' || name === 'violationMonth') {
        newData.violationDay = '';
      }
      
      // 如果违规大类改变，重置中类和小类
      if (name === 'violationCategory') {
        newData.violationSubCategory = '';
        newData.violationDetail = '';
      }
      
      // 如果违规中类改变，重置小类
      if (name === 'violationSubCategory') {
        newData.violationDetail = '';
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 调用API提交投诉
      const response = await fetch('/api/complaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmitStatus('success');
        // 重置表单
        setFormData({
          reporterName: '',
          reporterQQ: '',
          targetPlayer: '',
          violationYear: '',
          violationMonth: '',
          violationDay: '',
          violationTime: '',
          violationCategory: '',
          violationSubCategory: '',
          violationDetail: '',
          description: '',
          evidence: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('提交失败:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      // 3秒后重置状态
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const copyQQ = (qqNumber: string) => {
    navigator.clipboard.writeText(qqNumber);
    alert('QQ号已复制：' + qqNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="text-xl font-bold text-blue-400">CT Cloud tops</div>
              <div className="text-xl font-bold text-white">云顶之境</div>
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
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">投诉举报</h1>
        
        <div className="max-w-3xl mx-auto">
          {/* 说明文字 */}
          <div className="bg-gray-800/70 p-6 rounded-xl border border-gray-700 mb-6">
            <p className="text-lg text-gray-300">
              如果您在游戏中遇到违规行为或不愉快的体验，欢迎向我们举报。我们会认真处理每一份举报，维护良好的游戏环境。
            </p>
          </div>

          {/* 举报表单 */}
          <form onSubmit={handleSubmit} className="bg-gray-800/70 p-8 rounded-xl border border-gray-700 space-y-6">
            <h2 className="text-2xl font-bold text-red-400 mb-6">填写举报信息</h2>
            
            {/* 举报人信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">您的游戏ID <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="reporterName"
                  value={formData.reporterName}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="请输入您的游戏ID"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">您的QQ号 <span className="text-gray-500">(可选)</span></label>
                <input
                  type="text"
                  name="reporterQQ"
                  value={formData.reporterQQ}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="方便我们联系您"
                />
              </div>
            </div>

            {/* 被举报人信息 */}
            <div>
              <label className="block text-gray-300 mb-2">违规玩家ID <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="targetPlayer"
                value={formData.targetPlayer}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="请输入违规玩家的游戏ID"
              />
            </div>

            {/* 违规时间 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-300">违规时间 <span className="text-gray-500">(可选)</span></label>
                <button
                  type="button"
                  onClick={() => setUseDatePicker(!useDatePicker)}
                  className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
                >
                  {useDatePicker ? '使用快速选择' : '使用日期选择器'}
                </button>
              </div>
              
              {useDatePicker ? (
                // 日期选择器模式
                <input
                  type="datetime-local"
                  name="violationTime"
                  value={formData.violationTime}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              ) : (
                // 分步选择模式
                <div className="grid grid-cols-3 gap-3">
                  <select
                    name="violationYear"
                    value={formData.violationYear}
                    onChange={handleChange}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
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
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">选择月份</option>
                    <option value="01">1月</option>
                    <option value="02">2月</option>
                    <option value="03">3月</option>
                    <option value="04">4月</option>
                    <option value="05">5月</option>
                    <option value="06">6月</option>
                    <option value="07">7月</option>
                    <option value="08">8月</option>
                    <option value="09">9月</option>
                    <option value="10">10月</option>
                    <option value="11">11月</option>
                    <option value="12">12月</option>
                  </select>
                  <select
                    name="violationDay"
                    value={formData.violationDay}
                    onChange={handleChange}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">选择日期</option>
                    {Array.from({ length: getDaysInMonth(formData.violationYear, formData.violationMonth) }, (_, i) => {
                      const day = (i + 1).toString().padStart(2, '0');
                      return (
                        <option key={day} value={day}>
                          {i + 1}日
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            {/* 违规类型 - 三级联动 */}
            <div>
              <label className="block text-gray-300 mb-2">违规类型 <span className="text-red-400">*</span></label>
              <div className="space-y-3">
                {/* 第一级：大类 */}
                <select
                  name="violationCategory"
                  value={formData.violationCategory}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">请选择违规大类</option>
                  {Object.entries(violationTypes).map(([key, value]) => (
                    <option key={key} value={key}>{value.name}</option>
                  ))}
                </select>

                {/* 第二级：中类 */}
                {formData.violationCategory && (
                  <select
                    name="violationSubCategory"
                    value={formData.violationSubCategory}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">请选择违规中类</option>
                    {Object.entries(violationTypes[formData.violationCategory as keyof typeof violationTypes].subcategories).map(([key, value]) => (
                      <option key={key} value={key}>{value.name}</option>
                    ))}
                  </select>
                )}

                {/* 第三级：小类/详细 */}
                {formData.violationCategory && formData.violationSubCategory && (
                  <select
                    name="violationDetail"
                    value={formData.violationDetail}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">请选择具体违规行为</option>
                    {violationTypes[formData.violationCategory as keyof typeof violationTypes].subcategories[formData.violationSubCategory as keyof typeof violationTypes.building.subcategories].details.map((detail, index) => (
                      <option key={index} value={detail}>{detail}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* 违规描述 */}
            <div>
              <label className="block text-gray-300 mb-2">违规描述 <span className="text-red-400">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="请详细描述违规行为..."
              />
            </div>

            {/* 证据链接 */}
            <div>
              <label className="block text-gray-300 mb-2">证据链接 <span className="text-gray-500">(可选)</span></label>
              <input
                type="url"
                name="evidence"
                value={formData.evidence}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="截图或视频链接（如百度网盘、腾讯微云等）"
              />
              <p className="text-gray-500 text-sm mt-1">建议上传截图或视频到云盘，然后粘贴分享链接</p>
            </div>

            {/* 提交按钮 */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition duration-300 ${
                  isSubmitting 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {isSubmitting ? '提交中...' : '提交举报'}
              </button>
            </div>

            {/* 提交状态提示 */}
            {submitStatus === 'success' && (
              <div className="bg-green-600/20 border border-green-600 text-green-400 p-4 rounded-lg text-center">
                举报提交成功！我们会尽快处理。
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="bg-red-600/20 border border-red-600 text-red-400 p-4 rounded-lg text-center">
                提交失败，请稍后重试或联系管理员。
              </div>
            )}
          </form>

          {/* 管理员联系方式 */}
          <div className="bg-gray-800/70 p-6 rounded-xl border border-gray-700 mt-6">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">联系管理员</h2>
            <p className="text-gray-300 mb-4">紧急情况下，您也可以直接联系管理员：</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-700 p-3 rounded">
                <span>服主 - yan_hong_jun (QQ: 958708671)</span>
                <button
                  onClick={() => copyQQ('958708671')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm transition duration-300"
                >
                  复制QQ
                </button>
              </div>
            </div>
          </div>

          {/* 返回首页 */}
          <div className="mt-8 text-center">
            <a 
              href="/" 
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg transition duration-300 inline-block"
            >
              返回首页
            </a>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-black/50 border-t border-gray-800 py-8">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p>本服务器为玩家社群自发组建与维护，与 Mojang AB 无任何关联。</p>
          <p className="mt-2">遇到问题？请联系管理员 QQ: 958708671</p>
        </div>
      </footer>
    </div>
  );
}
