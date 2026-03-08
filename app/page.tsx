'use client';
import React, { useState, useEffect, useRef } from 'react';

// 功能卡片组件
const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => {
  const imageSrc = icon ? `/images/${icon}` : '';
  
  return (
    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 backdrop-blur-sm hover:border-blue-500 transition-all duration-300 group">
      <div className="flex items-center mb-4">
        <div className="w-14 h-14 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt={title}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement;
                if (fallback) {
                  const span = document.createElement('span');
                  span.className = 'text-2xl';
                  span.textContent = '🔧';
                  fallback.appendChild(span);
                }
              }}
            />
          ) : (
            <span className="text-2xl">🔧</span>
          )}
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <p className="text-gray-300">{description}</p>
    </div>
  );
};

// 简单图片轮播组件
const SimpleImageCarousel = ({ currentImage = 0, onImageChange }: { currentImage?: number, onImageChange: (index: number) => void }) => {
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const images = [
    {
      id: 1,
      src: "/images/1.png",
      alt: "宣传图 1"
    },
    {
      id: 2,
      src: "/images/2.png",
      alt: "宣传图 2"
    },
    {
      id: 3,
      src: "/images/3.png",
      alt: "宣传图 3"
    },
    {
      id: 4,
      src: "/images/4.png",
      alt: "宣传图 4"
    },
    {
      id: 5,
      src: "/images/5.png",
      alt: "宣传图 5"
    },
    {
      id: 6,
      src: "/images/6.png",
      alt: "宣传图 6"
    },
    {
      id: 7,
      src: "/images/7.png",
      alt: "宣传图 7"
    },
    {
      id: 8,
      src: "/images/8.png",
      alt: "宣传图 8"
    },
    {
      id: 9,
      src: "/images/9.png",
      alt: "宣传图 9"
    },
    {
      id: 10,
      src: "/images/10.png",
      alt: "宣传图 10"
    }
  ];

  // 确保索引在有效范围内
  const validIndex = Math.max(0, Math.min(currentImage, images.length - 1));

  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      const nextIndex = (validIndex + 1) % images.length;
      onImageChange(nextIndex);
    }, 3000);
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [validIndex, images.length, onImageChange]);

  const currentImageData = images[validIndex];

  return (
    <div className="h-full flex flex-col">
      {/* 图片展示区域 */}
      <div className="flex-1 relative overflow-hidden rounded-lg">
        {currentImageData ? (
          <img 
            src={currentImageData.src} 
            alt={currentImageData.alt}
            className="w-full h-full object-cover transition-opacity duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full bg-gray-800 flex items-center justify-center';
                fallback.innerHTML = '<span class="text-gray-400">图片加载失败</span>';
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-400">加载中...</span>
          </div>
        )}
      </div>
    </div>
  );
};

// 赞助二维码弹窗组件
const SponsorModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'wechat' | 'alipay'>('wechat');
  const [wechatLoaded, setWechatLoaded] = useState(false);
  const [alipayLoaded, setAlipayLoaded] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const isAlipay = activeTab === 'alipay';
  const bgFrom = isAlipay ? 'from-blue-50' : 'from-green-50';
  const bgTo = isAlipay ? 'to-blue-100' : 'to-green-100';
  const borderColor = isAlipay ? 'border-blue-200' : 'border-green-200';
  const buttonBg = isAlipay ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700';
  const titleColor = isAlipay ? 'text-blue-800' : 'text-green-800';
  const tabBg = isAlipay ? 'bg-blue-200' : 'bg-green-200';
  const tabActiveBg = isAlipay ? 'bg-blue-600' : 'bg-green-600';
  const tabText = isAlipay ? 'text-blue-700' : 'text-green-700';
  const tabTextActive = isAlipay ? 'text-blue-900' : 'text-green-900';
  const closeColor = isAlipay ? 'text-blue-600 hover:text-blue-800' : 'text-green-600 hover:text-green-800';
  const qrTitleColor = isAlipay ? 'text-blue-700' : 'text-green-700';
  const qrTextColor = isAlipay ? 'text-blue-600' : 'text-green-600';
  const infoBg = isAlipay ? 'bg-blue-50' : 'bg-green-50';
  const infoBorder = isAlipay ? 'border-blue-200' : 'border-green-200';
  const infoText = isAlipay ? 'text-blue-800' : 'text-green-800';
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className={`bg-gradient-to-br ${bgFrom} ${bgTo} p-6 rounded-2xl border-2 ${borderColor} shadow-2xl max-w-md mx-4`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-2xl font-bold ${titleColor}`}>自愿赞助</h3>
          <button 
            onClick={onClose}
            className={`${closeColor} text-2xl font-bold`}
          >
            ✕
          </button>
        </div>
        
        {/* 切换标签 */}
        <div className={`flex mb-6 ${tabBg} rounded-lg p-1`}>
          <button
            onClick={() => setActiveTab('wechat')}
            className={`flex-1 py-3 rounded-md text-center font-semibold transition-colors duration-200 ${
              activeTab === 'wechat' 
                ? `${tabActiveBg} text-white shadow-md` 
                : `${tabText} hover:${tabTextActive}`
            }`}
          >
            微信赞助
          </button>
          <button
            onClick={() => setActiveTab('alipay')}
            className={`flex-1 py-3 rounded-md text-center font-semibold transition-colors duration-200 ${
              activeTab === 'alipay' 
                ? `${tabActiveBg} text-white shadow-md` 
                : `${tabText} hover:${tabTextActive}`
            }`}
          >
            支付宝赞助
          </button>
        </div>
        
        {/* 二维码显示区域 */}
        <div className="bg-white p-4 rounded-xl border border-gray-300 shadow-lg mb-6">
          {activeTab === 'wechat' ? (
            <div className="text-center">
              <p className={`font-semibold mb-3 text-lg ${qrTitleColor}`}>微信收款码</p>
              <div className="flex justify-center">
                <img 
                  src="/images/微信收款码.png" 
                  alt="微信收款码" 
                  className="w-64 h-64 object-contain"
                  loading="lazy"
                  onLoad={() => setWechatLoaded(true)}
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'%3E%3Crect width='256' height='256' fill='%23f0f0f0' rx='12'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' text-anchor='middle' fill='%23999' dy='.3em'%3E微信二维码%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              {!wechatLoaded && (
                <p className="text-sm mt-2 text-gray-500">正在加载二维码...</p>
              )}
              <p className={`text-sm mt-3 ${qrTextColor}`}>打开微信，扫描上方二维码</p>
            </div>
          ) : (
            <div className="text-center">
              <p className={`font-semibold mb-3 text-lg ${qrTitleColor}`}>支付宝收款码</p>
              <div className="flex justify-center">
                <img 
                  src="/images/支付宝收款码.png" 
                  alt="支付宝收款码" 
                  className="w-64 h-64 object-contain"
                  loading="lazy"
                  onLoad={() => setAlipayLoaded(true)}
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'%3E%3Crect width='256' height='256' fill='%23f0f0f0' rx='12'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' text-anchor='middle' fill='%23999' dy='.3em'%3E支付宝二维码%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              {!alipayLoaded && (
                <p className="text-sm mt-2 text-gray-500">正在加载二维码...</p>
              )}
              <p className={`text-sm mt-3 ${qrTextColor}`}>打开支付宝，扫描上方二维码</p>
            </div>
          )}
        </div>
        
        <div className={`${infoBg} rounded-xl p-4 border ${infoBorder} mb-6`}>
          <p className={`text-sm text-center ${infoText}`}>
            <span className="font-semibold">重要提示：</span>服务器为公益性质，自愿赞助将用于服务器维护和升级，非常感谢您的支持！
          </p>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={onClose}
            className={`${buttonBg} text-white font-semibold py-3 px-8 rounded-lg transition duration-300`}
          >
            关闭窗口
          </button>
        </div>
      </div>
    </div>
  );
};

// 联系管理弹窗组件
const ContactAdminModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchAdmins();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/list');
      const result = await response.json();
      if (result.success && result.data) {
        const filteredAdmins = result.data.filter((admin: any) => admin.show_in_contact !== false);
        setAdmins(filteredAdmins);
      }
    } catch (error) {
      console.error('获取管理员列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] overflow-y-auto py-8" 
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 md:p-8 rounded-2xl border-2 border-blue-200 shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center mb-6 pb-4 border-b border-blue-300">
          <h3 className="text-2xl md:text-3xl font-bold text-blue-800">联系管理团队</h3>
          <button 
            onClick={onClose}
            className="text-blue-600 hover:text-blue-800 text-2xl font-bold"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
              {/* 表头 */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-blue-50 border-b border-blue-200 text-center">
                <div className="text-blue-800 font-semibold">头像</div>
                <div className="text-blue-800 font-semibold">标签</div>
                <div className="text-blue-800 font-semibold">QQ号</div>
                <div className="text-blue-800 font-semibold">复制</div>
              </div>
              
              {/* 数据行 */}
              {admins.map((admin) => (
                <div key={admin.id} className="grid grid-cols-4 gap-4 p-4 border-b border-blue-100 last:border-b-0 items-center hover:bg-blue-50/50 transition-colors text-center">
                  {/* 头像列 */}
                  <div className="flex justify-center">
                    <div className="w-14 h-14 bg-white border-2 border-blue-300 rounded-full flex items-center justify-center overflow-hidden">
                      <img
                        src={`https://q.qlogo.cn/g?b=qq&nk=${admin.qq}&s=100`}
                        alt={`${admin.is_owner ? '服主' : '管理员'}的头像`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = 'text-blue-500 text-2xl font-bold';
                            fallback.textContent = admin.is_owner ? "👑" : "👤";
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* 标签列 */}
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${admin.is_owner ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {admin.is_owner ? '服主' : '管理员'}
                    </span>
                    <div className="text-gray-500 text-sm mt-1">{admin.username}</div>
                  </div>
                  
                  {/* QQ号列 */}
                  <div className="text-blue-800 font-medium">
                    {admin.qq}
                  </div>
                  
                  {/* 复制按钮列 */}
                  <div>
                    <button
                      onClick={() => navigator.clipboard.writeText(admin.qq)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      复制QQ号
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex-shrink-0 mt-6 pt-4 border-t border-blue-300">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
            <h4 className="font-semibold text-blue-800 mb-2">使用说明：</h4>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• 点击"复制QQ号"按钮可以复制对应的QQ号</li>
              <li>• 添加好友时请备注"CloudTops服务器"以便管理员识别</li>
              <li>• 服主和管理员会在24小时内处理好友申请</li>
              <li>• 紧急问题请直接联系服主</li>
            </ul>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
            >
              关闭窗口
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 法律声明弹窗组件
const LegalModal = ({ isOpen, onClose, type }: { isOpen: boolean, onClose: () => void, type: 'terms' | 'privacy' | 'copyright' | 'disclaimer' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const titles: Record<string, string> = {
    terms: '服务条款',
    privacy: '隐私政策',
    copyright: '版权声明',
    disclaimer: '免责声明'
  };

  const contents: Record<string, { summary: string; details: string[] }> = {
    terms: {
      summary: '欢迎使用Cloud tops云顶之境Minecraft服务器。在使用本服务器前，请仔细阅读以下服务条款。',
      details: [
        '1. 服务内容：本服务器为公益性质的Minecraft原版生存服务器，不收取任何费用。',
        '2. 用户行为规范：玩家需遵守游戏规则，禁止使用作弊客户端、恶意破坏他人建筑、盗取他人财物等行为。',
        '3. 白名单制度：服务器采用白名单审核制度，只有通过审核的玩家才能加入服务器。',
        '4. 管理员权利：管理员有权对违规玩家进行警告、踢出、封禁等处理。',
        '5. 服务变更：服务器保留随时修改服务内容和规则的权利。',
        '6. 免责声明：服务器不对因网络问题、服务器故障等原因造成的损失承担责任。'
      ]
    },
    privacy: {
      summary: '我们重视您的隐私保护。本政策说明我们如何收集、使用和保护您的个人信息。',
      details: [
        '1. 信息收集：我们收集您的Minecraft游戏ID、QQ号等必要信息用于白名单审核和联系。',
        '2. 信息使用：收集的信息仅用于服务器管理、白名单审核和重要通知。',
        '3. 信息保护：我们采取合理的安全措施保护您的个人信息不被泄露。',
        '4. 信息共享：我们不会将您的个人信息出售或分享给第三方。',
        '5. 信息删除：您可以联系管理员删除您的个人信息。',
        '6. Cookie使用：本网站可能使用Cookie来改善用户体验。'
      ]
    },
    copyright: {
      summary: '本声明涉及服务器内所有创作内容的版权归属问题。',
      details: [
        '1. Minecraft版权：Minecraft是Mojang AB的注册商标，本服务器与Mojang AB无任何关联。',
        '2. 服务器内容：服务器内由玩家创作的建筑、红石机械等内容，其版权归创作者所有。',
        '3. 服务器资源：服务器的地图、插件配置等资源版权归服务器所有。',
        '4. 宣传材料：服务器的宣传视频、图片等材料版权归服务器所有。',
        '5. 侵权处理：如发现侵权内容，请联系管理员进行处理。',
        '6. 授权使用：使用服务器相关内容需获得授权。'
      ]
    },
    disclaimer: {
      summary: '本免责声明适用于使用Cloud tops云顶之境服务器的所有用户。',
      details: [
        '1. 服务可用性：我们不保证服务器24小时不间断运行，可能会因维护、故障等原因暂停服务。',
        '2. 数据安全：虽然我们定期备份数据，但不保证数据不会丢失，建议玩家自行备份重要物品。',
        '3. 用户行为：用户需对自己的行为负责，服务器不对用户之间的纠纷承担责任。',
        '4. 第三方链接：本网站可能包含第三方链接，我们不对第三方网站的内容负责。',
        '5. 免责范围：在法律允许的范围内，服务器不对任何间接、偶然、特殊或惩罚性损害承担责任。',
        '6. 法律适用：本免责声明受中华人民共和国法律管辖。'
      ]
    }
  };

  const content = contents[type];

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] overflow-y-auto py-8" 
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:p-8 rounded-2xl border-2 border-gray-700 shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
          <h3 className="text-2xl md:text-3xl font-bold text-white">{titles[type]}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700 mb-6">
            <p className="text-gray-300 leading-relaxed">{content.summary}</p>
          </div>
          
          <div className="space-y-4">
            {content.details.map((detail, index) => (
              <div key={index} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-300 text-sm leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-shrink-0 mt-6 pt-4 border-t border-gray-700 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
          >
            关闭
          </button>
          <a 
            href={`/legal/${type}`}
            target="_blank"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 text-center"
          >
            查看详情页
          </a>
        </div>
      </div>
    </div>
  );
};

// 公告弹窗组件
const AnnouncementModal = ({ isOpen, onClose, announcement }: { isOpen: boolean, onClose: () => void, announcement: any }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !announcement) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] overflow-y-auto py-8" 
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:p-8 rounded-2xl border-2 border-gray-700 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
          <h3 className="text-2xl font-bold text-white">{announcement.title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
            <span>发布时间: {new Date(announcement.created_at).toLocaleDateString('zh-CN')}</span>
            {announcement.is_important && (
              <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">重要</span>
            )}
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
          </div>
        </div>
        
        <div className="flex-shrink-0 mt-6">
          <button 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

// 活动弹窗组件
const EventModal = ({ isOpen, onClose, event }: { isOpen: boolean, onClose: () => void, event: any }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-yellow-500/20 text-yellow-400';
      case 'ongoing': return 'bg-green-500/20 text-green-400';
      case 'ended': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return '即将开始';
      case 'ongoing': return '进行中';
      case 'ended': return '已结束';
      default: return '未知';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] overflow-y-auto py-8" 
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:p-8 rounded-2xl border-2 border-gray-700 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
          <h3 className="text-2xl font-bold text-white">{event.title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center gap-4 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
              {getStatusText(event.status)}
            </span>
            <span className="text-sm text-gray-400">
              {new Date(event.start_time).toLocaleDateString('zh-CN')} - {new Date(event.end_time).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700 mb-4">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>
          {event.rewards && (
            <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
              <h4 className="text-yellow-400 font-semibold mb-2">🎁 活动奖励</h4>
              <p className="text-yellow-300/80 text-sm">{event.rewards}</p>
            </div>
          )}
        </div>
        
        <div className="flex-shrink-0 mt-6">
          <button 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isSponsorHovered, setIsSponsorHovered] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  
  // 安全地设置当前图片索引
  const safeSetCurrentImage = (index: number) => {
    const validIndex = Math.max(0, Math.min(index, 9));
    setCurrentImage(validIndex);
  };
  const [bgImagesLoaded, setBgImagesLoaded] = useState({
    bg1: false,
    bg2: false,
    bg3: false
  });
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const whitelistSectionRef = useRef<HTMLElement>(null);
  
  // 公告、活动、黑名单相关状态
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalType, setLegalType] = useState<'terms' | 'privacy' | 'copyright' | 'disclaimer'>('terms');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // 网站配置状态
  const [websiteConfig, setWebsiteConfig] = useState<{
    server_name?: string;
    server_description?: string;
    welcome_message?: string;
    elements?: any[];
  }>({});
  
  // 获取公告、活动、黑名单数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [announcementsRes, eventsRes, blacklistRes] = await Promise.all([
          fetch('/api/announcements'),
          fetch('/api/events'),
          fetch('/api/blacklist')
        ]);
        
        const announcementsData = await announcementsRes.json();
        const eventsData = await eventsRes.json();
        const blacklistData = await blacklistRes.json();
        
        if (announcementsData.success) {
          setAnnouncements(announcementsData.data.slice(0, 3));
        }
        if (eventsData.success) {
          setEvents(eventsData.data.filter((e: any) => e.status !== 'ended').slice(0, 3));
        }
        if (blacklistData.success) {
          setBlacklist(blacklistData.data.slice(0, 5));
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    };
    fetchData();
  }, []);
  
  // 获取网站配置
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/website/config');
        const result = await response.json();
        if (result.success && result.data) {
          setWebsiteConfig(result.data);
        }
      } catch (error) {
        console.error('获取网站配置失败:', error);
      }
    };
    fetchConfig();
  }, []);
  
  // 管理员登录相关状态
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  // 从 elements 获取内容的辅助函数
  const getElementContent = (id: string, defaultValue: string): string => {
    if (!websiteConfig.elements) return defaultValue;
    const element = websiteConfig.elements.find((el: any) => el.id === id);
    return element?.content || defaultValue;
  };
  
  // 从 elements 获取图标的辅助函数
  const getElementIcon = (id: string, defaultIcon: string): string => {
    if (!websiteConfig.elements) return defaultIcon;
    const element = websiteConfig.elements.find((el: any) => el.id === id);
    return element?.content || defaultIcon;
  };
  
  // 从localStorage恢复登录状态
  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminInfo');
    if (savedAdmin) {
      try {
        const adminInfo = JSON.parse(savedAdmin);
        setAdminLoggedIn(true);
        setAdminUser(adminInfo.user);
        setAdminId(adminInfo.adminId);
        setIsOwner(adminInfo.isOwner || false);
      } catch (e) {
        localStorage.removeItem('adminInfo');
      }
    }
  }, []);
  
  // Logo点击处理 - 连续点击5次显示登录弹窗（仅未登录时）
  const handleLogoClick = () => {
    if (adminLoggedIn) return;
    
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    
    if (newCount >= 5) {
      setShowAdminLogin(true);
      setLogoClickCount(0);
    }
    
    // 3秒后重置计数
    setTimeout(() => setLogoClickCount(0), 3000);
  };
  
  // 管理员登录
  const handleAdminLogin = async () => {
    try {
      console.log('发送登录请求:', loginForm);
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      
      console.log('响应状态:', response.status);
      const result = await response.json();
      console.log('响应结果:', result);
      
      if (result.success) {
        const adminInfo = {
          user: result.user,
          adminId: result.adminId,
          isOwner: result.isOwner || false
        };
        
        // 保存到localStorage
        localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
        
        setAdminLoggedIn(true);
        setAdminUser(result.user);
        setAdminId(result.adminId);
        setIsOwner(result.isOwner || false);
        setShowAdminLogin(false);
        setLoginForm({ username: '', password: '' });
        setLoginError('');
      } else {
        setLoginError(result.message || '登录失败');
      }
    } catch (error: any) {
      console.error('登录请求失败:', error);
      setLoginError('登录失败: ' + (error.message || '网络错误'));
    }
  };
  
  // 管理员登出
  const handleAdminLogout = () => {
    localStorage.removeItem('adminInfo');
    setAdminLoggedIn(false);
    setAdminUser(null);
    setAdminId(null);
    setIsOwner(false);
  };
  
  // 简单的滚动监听，只更新当前section指示器
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // 找到当前可见的section
      sectionsRef.current.forEach((section, index) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          // 如果section的顶部在视口中部附近
          if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
            setCurrentSection(index);
          }
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 背景图片预加载
  useEffect(() => {
    const preloadImages = async () => {
      const imagePaths = [
        '/images/主页背景图.png',
        '/images/主页背景图2.png',
        '/images/主页背景图3.png',
        '/images/草方块.png',
        '/images/红石.png',
        '/images/床.png',
        '/images/虞美人.png',
        '/images/钻石.png',
        '/images/微信收款码.png',
        '/images/支付宝收款码.png'
      ];
      
      imagePaths.forEach((src) => {
        const img = new Image();
        img.onload = () => {
          console.log(`成功加载图片: ${src}`);
          if (src.includes('主页背景图')) {
            const bgKey = src.includes('主页背景图2') ? 'bg2' : 
                        src.includes('主页背景图3') ? 'bg3' : 'bg1';
            setBgImagesLoaded(prev => ({ ...prev, [bgKey]: true }));
          }
        };
        img.onerror = () => {
          console.warn(`无法加载图片: ${src}`);
        };
        img.src = src;
      });
    };
    
    preloadImages();
  }, []);
  
  // 处理弹窗打开/关闭
  useEffect(() => {
    if (showContactModal || showComplaintModal || showSponsorModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [showContactModal, showComplaintModal, showSponsorModal]);

  // 简化滚动到指定部分
  const scrollToSection = (index: number) => {
    if (sectionsRef.current[index]) {
      window.scrollTo({
        top: sectionsRef.current[index].offsetTop,
        behavior: 'smooth'
      });
      setCurrentSection(index);
    }
  };
  
  return (
    <div className="min-h-screen relative" ref={mainContainerRef}>
      {/* 背景图片 - 修复了空字符串问题 */}
      <div className="fixed inset-0 z-0">
        {/* 第一页背景图 */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat transition-opacity duration-1000" 
          style={{ 
            backgroundImage: bgImagesLoaded.bg1 
              ? 'url(/images/主页背景图.png)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: currentSection === 0 ? 1 : 0
          }}
        />
        
        {/* 第二页背景图 */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat transition-opacity duration-1000" 
          style={{ 
            backgroundImage: bgImagesLoaded.bg2 
              ? 'url(/images/主页背景图2.png)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: currentSection === 1 ? 1 : 0
          }}
        />
        
        {/* 第三页背景图 */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat transition-opacity duration-1000" 
          style={{ 
            backgroundImage: bgImagesLoaded.bg3 
              ? 'url(/images/主页背景图3.png)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: currentSection === 2 ? 1 : 0
          }}
        />
        
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40"></div>
      </div>
      
      {/* 滚动指示器 */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 hidden md:flex flex-col space-y-3">
        {[0, 1, 2, 3, 4].map((index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 flex items-center justify-center ${
              index === currentSection 
                ? 'bg-blue-400 w-4 h-4 ring-2 ring-blue-300 ring-opacity-50' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            aria-label={`跳转到第 ${index + 1} 部分`}
          >
            {index === currentSection && (
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>
      
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center space-x-2 cursor-pointer select-none"
              onClick={handleLogoClick}
            >
              <div className="text-xl font-bold text-blue-400">CT Cloud tops</div>
              <div className="text-xl font-bold text-white">云顶之境</div>
            </div>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => scrollToSection(0)}
                className={`text-gray-300 hover:text-white transition-colors duration-300 ${currentSection === 0 ? 'text-blue-400' : ''}`}
              >
                首页
              </button>
              <button 
                onClick={() => scrollToSection(1)}
                className={`text-gray-300 hover:text-white transition-colors duration-300 ${currentSection === 1 ? 'text-blue-400' : ''}`}
              >
                服务器介绍
              </button>
              <button 
                onClick={() => scrollToSection(2)}
                className={`text-gray-300 hover:text-white transition-colors duration-300 ${currentSection === 2 ? 'text-blue-400' : ''}`}
              >
                服务器风采
              </button>
              <button 
                onClick={() => scrollToSection(3)}
                className={`text-gray-300 hover:text-white transition-colors duration-300 ${currentSection === 3 ? 'text-blue-400' : ''}`}
              >
                加入我们
              </button>
              <button 
                onClick={() => {
                  if (whitelistSectionRef.current) {
                    whitelistSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition duration-300"
              >
                申请白名单
              </button>
              {adminLoggedIn ? (
                <>
                  <a 
                    href="/admin"
                    className="text-green-400 hover:text-green-300 text-sm transition-colors duration-300"
                  >
                    管理后台
                  </a>
                  <span className="text-gray-500 text-sm">|</span>
                  <span className="text-gray-400 text-sm">{adminUser}</span>
                  <button 
                    onClick={handleAdminLogout}
                    className="text-red-400 hover:text-red-300 text-sm transition-colors duration-300"
                  >
                    登出
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* 第一部分：首页 */}
        <section 
          ref={el => { 
            if (el && !sectionsRef.current.includes(el)) {
              sectionsRef.current[0] = el;
            }
          }}
          className="min-h-screen flex items-center justify-center px-6 py-24"
        >
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-blue-400">{getElementContent('hero-title', 'Cloud tops 云顶之境')}</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-white">{getElementContent('hero-subtitle', 'Minecraft 原版生存服务器')}</h2>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              {getElementContent('hero-desc', '一个由玩家共建的纯原版 Minecraft 生存社区。服务器为公益性质，不向玩家收取任何费用，旨在打造一个纯净、友好、充满创造乐趣的游戏环境。')}
            </p>
            
            <div className="inline-flex items-center justify-center space-x-6 bg-black/50 backdrop-blur-sm px-8 py-4 rounded-full mb-16 border border-gray-700">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-white">在线</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-white">24/7 稳定运行</span>
              <span className="text-gray-400">|</span>
              <span className="text-white">728 位玩家</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <FeatureCard 
                icon={getElementIcon('card1-icon', '草方块.png')} 
                title={getElementContent('card1-title', '原版生存')} 
                description={getElementContent('card1-desc', '基于最新版本 Minecraft 的纯原版生存体验，不添加任何影响平衡的插件。')}
              />
              <FeatureCard 
                icon={getElementIcon('card2-icon', '红石.png')} 
                title={getElementContent('card2-title', '生电技术友好')} 
                description={getElementContent('card2-desc', '鼓励红石机械、自动化农场、大型工程，一起探索Minecraft的无限可能。')}
              />
              <FeatureCard 
                icon={getElementIcon('card3-icon', '床.png')} 
                title={getElementContent('card3-title', '永久公益')} 
                description={getElementContent('card3-desc', '服务器永远免费，由服主自愿维护，打造真正的玩家社区，无任何付费特权。')}
              />
              <FeatureCard 
                icon={getElementIcon('card4-icon', '虞美人.png')} 
                title={getElementContent('card4-title', '友好社区')} 
                description={getElementContent('card4-desc', '白名单审核确保每位玩家都遵守社区规范，共同维护友好的游戏环境。')}
              />
            </div>
          </div>
        </section>

        {/* 第二部分：服务器介绍 */}
        <section 
          ref={el => { 
            if (el && !sectionsRef.current.includes(el)) {
              sectionsRef.current[1] = el;
            }
          }}
          className="min-h-screen flex items-center justify-center px-6 py-24"
        >
          <div className="container mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white">服务器介绍</h2>
            
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-lg md:text-xl text-gray-300 text-center mb-12 leading-relaxed">
                Cloud tops 云顶之境是一个专注于原版生存的Minecraft服务器，我们致力于为玩家提供一个纯净、稳定、友好的游戏环境。服务器采用白名单审核制度，确保每一位玩家都能在一个安全、和谐的环境中享受游戏。
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-900/70 p-8 rounded-xl border border-gray-700 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-6 text-center text-white">服务器特色</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-300">100% 原版生存体验</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-300">稳定的服务器性能</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-300">友好的玩家社区</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-300">定期的社区活动</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-300">活跃的管理团队</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-300">永久免费公益运营</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-900/70 p-8 rounded-xl border border-gray-700 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-6 text-center text-white">技术规格</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-300">服务器版本：Minecraft 1.20.4</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-300">在线时间：24/7 不间断</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-300">服务器位置：中国上海</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-300">网络带宽：100Mbps</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-300">防御能力：DDoS防护</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-300">数据备份：每日自动备份</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 最新公告和近期活动 */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* 公告区域 */}
              <div className="bg-gray-900/70 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📢</span> 最新公告
                  </h3>
                  <a href="/announcements" className="text-blue-400 hover:text-blue-300 text-sm">查看全部 →</a>
                </div>
                {announcements.length > 0 ? (
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <div 
                        key={announcement.id}
                        className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-blue-500 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedAnnouncement(announcement);
                          setShowAnnouncementModal(true);
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {announcement.is_important && (
                            <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs">重要</span>
                          )}
                          <span className="text-gray-500 text-xs">{new Date(announcement.created_at).toLocaleDateString('zh-CN')}</span>
                        </div>
                        <h4 className="text-white font-medium truncate">{announcement.title}</h4>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{announcement.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">暂无公告</div>
                )}
              </div>
              
              {/* 活动区域 */}
              <div className="bg-gray-900/70 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>🎉</span> 近期活动
                  </h3>
                  <a href="/events" className="text-blue-400 hover:text-blue-300 text-sm">查看全部 →</a>
                </div>
                {events.length > 0 ? (
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div 
                        key={event.id}
                        className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-green-500 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventModal(true);
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            event.status === 'ongoing' ? 'bg-green-500/20 text-green-400' :
                            event.status === 'upcoming' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {event.status === 'ongoing' ? '进行中' : event.status === 'upcoming' ? '即将开始' : '已结束'}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {new Date(event.start_time).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <h4 className="text-white font-medium truncate">{event.title}</h4>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{event.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">暂无活动</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 第三部分：服务器风采 */}
        <section 
          ref={el => { 
            if (el && !sectionsRef.current.includes(el)) {
              sectionsRef.current[2] = el;
            }
          }}
          className="min-h-screen flex items-center justify-center px-6 py-24"
        >
          <div className="container mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white">服务器风采</h2>
            
            {/* 主要内容区域 */}
            <div className="bg-gray-900/70 rounded-xl border border-gray-700 overflow-hidden">
              {/* 顶部视频和轮播图 */}
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* 左侧视频 */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-4 text-white">宣传视频</h3>
                  <div className="w-full bg-gray-800/50 rounded-lg overflow-hidden">
                    <div className="aspect-video w-full">
                      <iframe 
                        src="//player.bilibili.com/player.html?isOutside=true&aid=113028121035948&bvid=BV1iPs7ehEs3&cid=500001663036289&p=1" 
                        scrolling="no" 
                        frameBorder="no" 
                        allowFullScreen={true}
                        className="w-full h-full"
                        title="云顶之境服务器宣传视频"
                      ></iframe>
                    </div>
                  </div>
                </div>
                
                {/* 右侧轮播图 */}
                <div className="p-6 border-l border-gray-700">
                  <h3 className="text-2xl font-bold mb-4 text-white">宣传图</h3>
                  <div className="w-full bg-gray-800/50 rounded-lg overflow-hidden">
                    <SimpleImageCarousel 
                      currentImage={currentImage} 
                      onImageChange={safeSetCurrentImage} 
                    />
                  </div>
                </div>
              </div>
              
              {/* 底部图片 */}
              <div className="p-6 border-t border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <button className="text-gray-400 hover:text-white text-2xl transition-colors duration-300">‹</button>
                  <h4 className="text-lg font-semibold text-white">图片集</h4>
                  <button className="text-gray-400 hover:text-white text-2xl transition-colors duration-300">›</button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                    <div 
                      key={item} 
                      className="bg-gray-800/50 rounded-lg border border-gray-700 aspect-video overflow-hidden cursor-pointer transition-all duration-300 hover:border-blue-400 hover:scale-105"
                      onMouseEnter={() => safeSetCurrentImage(item - 1)}
                    >
                      <img 
                        src={`/images/${item}.png`} 
                        alt={`宣传图 ${item}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 第四部分：白名单申请 */}
        <section 
          ref={el => { 
            if (el && !sectionsRef.current.includes(el)) {
              sectionsRef.current[3] = el;
            }
            whitelistSectionRef.current = el;
          }}
          className="min-h-screen flex items-center justify-center px-6 py-24"
        >
          <div className="container mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-white text-center">加入我们的社区</h2>
            
            <div className="max-w-6xl mx-auto">
              {/* 黑名单区域 */}
              {blacklist.length > 0 && (
                <div className="bg-red-900/20 p-6 rounded-xl border border-red-700/50 mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                      <span>🚫</span> 黑名单公示
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {blacklist.map((player) => (
                      <div key={player.id} className="bg-gray-900/50 p-3 rounded-lg border border-red-700/30 text-center">
                        <div className="text-white font-medium truncate">{player.minecraft_id}</div>
                        <div className="text-red-400/70 text-xs mt-1">{player.reason || '违规玩家'}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-red-400/60 text-xs mt-4 text-center">以上玩家因违反服务器规则已被永久封禁</p>
                </div>
              )}
              
              {/* 白名单申请 */}
              <div className="bg-gray-900/70 p-8 rounded-xl border border-gray-700 mb-12">
                <h3 className="text-2xl font-bold mb-6 text-white text-center">申请白名单</h3>
                <p className="text-lg text-gray-300 mb-6 text-center">
                  为了维护纯净的游戏环境，我们采用白名单制度。申请通过后即可加入服务器，与数百位玩家一起创造属于你们的 Minecraft 世界。
                </p>
                
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 mb-6">
                  <h4 className="text-lg font-semibold text-white mb-4 text-center">📋 申请流程</h4>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                      <span className="text-gray-300">选择题目类型</span>
                    </div>
                    <div className="text-gray-600 hidden md:block">→</div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                      <span className="text-gray-300">答题测试</span>
                    </div>
                    <div className="text-gray-600 hidden md:block">→</div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                      <span className="text-gray-300">填写申请表</span>
                    </div>
                    <div className="text-gray-600 hidden md:block">→</div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
                      <span className="text-gray-300">等待审核</span>
                    </div>
                    <div className="text-gray-600 hidden md:block">→</div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">5</div>
                      <span className="text-gray-300">邮件通知</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <a 
                    href="/apply"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-300 inline-block"
                  >
                    开始申请
                  </a>
                </div>
              </div>
              
              <div className="bg-gray-900/70 p-8 rounded-xl border border-gray-700">
                <h3 className="text-2xl font-bold mb-6 text-white text-center">社区规则</h3>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-blue-400">游戏规则</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• 禁止使用任何作弊客户端</li>
                      <li>• 禁止恶意破坏他人建筑</li>
                      <li>• 禁止盗取他人财物</li>
                      <li>• 尊重其他玩家</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-blue-400">社区规范</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• 保持友好交流</li>
                      <li>• 互帮互助共同发展</li>
                      <li>• 遵守管理员安排</li>
                      <li>• 共建和谐社区</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 页脚 */}
        <section 
          ref={el => { 
            if (el && !sectionsRef.current.includes(el)) {
              sectionsRef.current[4] = el;
            }
          }}
          className="min-h-80 bg-black/90 border-t border-gray-800 flex items-center"
        >
          <div className="container mx-auto px-6 py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Cloud tops 云顶之境</h3>
                <p className="text-gray-400 mb-4 text-sm">一个由玩家共建的纯原版 Minecraft 生存社区，致力于打造纯净、友好的游戏环境。</p>
                <p className="text-gray-500 text-xs">© 2026 Cloud tops 云顶之境服务器</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-4">快速导航</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <span 
                      onClick={() => scrollToSection(0)}
                      className="hover:text-blue-400 cursor-pointer transition-colors duration-300 block"
                    >
                      首页
                    </span>
                  </li>
                  <li>
                    <span 
                      onClick={() => scrollToSection(1)}
                      className="hover:text-blue-400 cursor-pointer transition-colors duration-300 block"
                    >
                      服务器介绍
                    </span>
                  </li>
                  <li>
                    <span 
                      onClick={() => scrollToSection(2)}
                      className="hover:text-blue-400 cursor-pointer transition-colors duration-300 block"
                    >
                      服务器风采
                    </span>
                  </li>
                  <li>
                    <span 
                      onClick={() => scrollToSection(3)}
                      className="hover:text-blue-400 cursor-pointer transition-colors duration-300 block"
                    >
                      申请白名单
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-4">常见问题</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><span className="hover:text-blue-400 cursor-pointer transition-colors duration-300 block">如何申请白名单？</span></li>
                  <li><span className="hover:text-blue-400 cursor-pointer transition-colors duration-300 block">服务器有哪些规则？</span></li>
                  <li><span className="hover:text-blue-400 cursor-pointer transition-colors duration-300 block">如何加入QQ群？</span></li>
                  <li><span className="hover:text-blue-400 cursor-pointer transition-colors duration-300 block">服务器IP地址是什么？</span></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-4">法律声明</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <button 
                      onClick={() => {
                        setLegalType('terms');
                        setShowLegalModal(true);
                      }}
                      className="hover:text-blue-400 cursor-pointer transition-colors duration-300 block text-left"
                    >
                      服务条款
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        setLegalType('privacy');
                        setShowLegalModal(true);
                      }}
                      className="hover:text-blue-400 cursor-pointer transition-colors duration-300 block text-left"
                    >
                      隐私政策
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        setLegalType('copyright');
                        setShowLegalModal(true);
                      }}
                      className="hover:text-blue-400 cursor-pointer transition-colors duration-300 block text-left"
                    >
                      版权声明
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        setLegalType('disclaimer');
                        setShowLegalModal(true);
                      }}
                      className="hover:text-blue-400 cursor-pointer transition-colors duration-300 block text-left"
                    >
                      免责声明
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
              <p>本服务器为玩家社群自发组建与维护，与 Mojang AB 无任何关联。</p>
              <p className="mt-2">遇到问题？请联系管理员 QQ: 123456789 或发送邮件至 admin@cloudtops.com</p>
            </div>
          </div>
        </section>
      </main>

      {/* 右下角固定按钮 */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
        <div className="relative"
          onMouseEnter={() => setIsSponsorHovered(true)}
          onMouseLeave={() => setIsSponsorHovered(false)}
        >
          <button 
            onClick={() => setShowSponsorModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg shadow-lg transition duration-300 flex items-center justify-center space-x-2 min-w-[140px]"
            title="自愿赞助"
          >
            <img 
              src="/images/钻石.png" 
              alt="钻石" 
              className="w-8 h-8" 
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ffffff' d='M19 12l-7 10-7-10 7-10z'/%3E%3C/svg%3E";
              }}
            />
            <span>自愿赞助</span>
          </button>
          
          {isSponsorHovered && (
            <div className="absolute bottom-full right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg px-4 py-2 whitespace-nowrap">
              <p className="text-white text-sm">点击查看赞助二维码</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => setShowContactModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-lg transition duration-300 flex items-center justify-center space-x-2 min-w-[140px]"
          title="联系管理"
        >
          <span className="text-lg">📞</span>
          <span>联系管理</span>
        </button>
        <a 
          href="/complaint"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg shadow-lg transition duration-300 flex items-center justify-center space-x-2 min-w-[140px]"
          title="投诉举报"
        >
          <span className="text-lg">🚫</span>
          <span>投诉举报</span>
        </a>
      </div>

      {/* 赞助二维码弹窗 */}
      <SponsorModal isOpen={showSponsorModal} onClose={() => setShowSponsorModal(false)} />

      {/* 联系管理弹窗 */}
      <ContactAdminModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
      
      {/* 法律声明弹窗 */}
      <LegalModal isOpen={showLegalModal} onClose={() => setShowLegalModal(false)} type={legalType} />
      
      {/* 公告弹窗 */}
      <AnnouncementModal isOpen={showAnnouncementModal} onClose={() => setShowAnnouncementModal(false)} announcement={selectedAnnouncement} />
      
      {/* 活动弹窗 */}
      <EventModal isOpen={showEventModal} onClose={() => setShowEventModal(false)} event={selectedEvent} />

      {/* 管理员登录弹窗 */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">管理员登录</h3>
            
            {loginError && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg mb-4 text-center">
                {loginError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">用户名</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">密码</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="请输入密码"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAdminLogin(false);
                  setLoginForm({ username: '', password: '' });
                  setLoginError('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAdminLogin}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
              >
                登录
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}