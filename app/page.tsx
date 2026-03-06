'use client';
import React, { useState, useEffect, useRef } from 'react';

// 服务器特色图标组件
const FeatureIcon = ({ type }: { type: 'grass' | 'redstone' | 'bed' | 'poppy' }) => {
  const getIconSrc = (type: string) => {
    switch (type) {
      case 'grass':
        return '/草方块.png';
      case 'redstone':
        return '/红石.png';
      case 'bed':
        return '/床.png';
      case 'poppy':
        return '/虞美人.png';
      default:
        return '';
    }
  };

  return (
    <img 
      src={getIconSrc(type)} 
      alt={type}
      className="w-12 h-12 object-contain mx-auto"
    />
  );
};

// 服务器特色卡片组件
const FeatureCard = ({ icon, title, description }: { icon: 'grass' | 'redstone' | 'bed' | 'poppy'; title: string; description: string }) => (
  <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700 text-center hover:bg-gray-800/90 transition-all duration-300">
    <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
      <FeatureIcon type={icon} />
    </div>
    <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
    <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
  </div>
);

// 简化的图片轮播组件
const SimpleImageCarousel = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  
  // 图片数据
  const images = [
    {
      id: 1,
      title: "生存基地展示",
      description: "玩家精心打造的生存基地，融合了功能性与美观性",
      emoji: "🏡"
    },
    {
      id: 2,
      title: "樱花城堡景观",
      description: "服务器内玩家建造的像素风格樱花树和城堡，展现独特的建筑美学",
      emoji: "🏰"
    },
    {
      id: 3,
      title: "红石科技装置",
      description: "高级红石自动化农场，展示玩家的技术实力和创造力",
      emoji: "⚡"
    },
    {
      id: 4,
      title: "社区活动广场",
      description: "服务器定期举办的社区活动场地，促进玩家间的交流与合作",
      emoji: "🎪"
    }
  ];

  // 自动轮播功能
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [images.length]);

  // 切换到指定图片
  const goToImage = (index: number) => {
    setCurrentImage(index);
  };

  return (
    <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 h-full flex flex-col">
      <h3 className="text-3xl font-bold mb-6 text-center text-white">服务器风采展示</h3>
      
      {/* 图片展示区域 */}
      <div className="flex-1 relative overflow-hidden rounded-xl shadow-2xl bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-700">
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
          <div className="max-w-2xl">
            <div className="text-8xl mb-8">{images[currentImage].emoji}</div>
            <h4 className="text-4xl text-white font-bold mb-6">{images[currentImage].title}</h4>
            <p className="text-gray-200 text-xl mb-8">{images[currentImage].description}</p>
            <div className="text-gray-300 text-lg">
              图片 {currentImage + 1} / {images.length}
            </div>
          </div>
        </div>
      </div>
      
      {/* 缩略图指示点 */}
      <div className="flex justify-center space-x-2 mt-8">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentImage ? 'bg-blue-400 w-10' : 'bg-gray-500 hover:bg-gray-400'}`}
            aria-label={`切换到第 ${index + 1} 张图片`}
          />
        ))}
      </div>
    </div>
  );
};

// 赞助二维码弹窗组件
const SponsorModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'wechat' | 'alipay'>('wechat');
  
  if (!isOpen) return null;
  
  // 根据选择的标签决定主题颜色
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
                  src="/微信收款码.png" 
                  alt="微信收款码" 
                  className="w-64 h-64 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'%3E%3Crect width='256' height='256' fill='%23f0f0f0' rx='12'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' text-anchor='middle' fill='%23999' dy='.3em'%3E微信二维码%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              <p className={`text-sm mt-3 ${qrTextColor}`}>打开微信，扫描上方二维码</p>
            </div>
          ) : (
            <div className="text-center">
              <p className={`font-semibold mb-3 text-lg ${qrTitleColor}`}>支付宝收款码</p>
              <div className="flex justify-center">
                <img 
                  src="/支付宝收款码.png" 
                  alt="支付宝收款码" 
                  className="w-64 h-64 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'%3E%3Crect width='256' height='256' fill='%23f0f0f0' rx='12'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' text-anchor='middle' fill='%23999' dy='.3em'%3E支付宝二维码%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
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
  // 管理员数据
  const admins = [
    { id: 1, qqNumber: "123456789", qqId: "CT_Owner", gameId: "CloudTops_Owner", role: "服主" },
    { id: 2, qqNumber: "987654321", qqId: "CT_Admin1", gameId: "CloudTops_Admin1", role: "管理员" },
    { id: 3, qqNumber: "111222333", qqId: "CT_Admin2", gameId: "CloudTops_Admin2", role: "管理员" },
    { id: 4, qqNumber: "222333444", qqId: "CT_Admin3", gameId: "CloudTops_Admin3", role: "管理员" },
    { id: 5, qqNumber: "333444555", qqId: "CT_Admin4", gameId: "CloudTops_Admin4", role: "管理员" },
    { id: 6, qqNumber: "444555666", qqId: "CT_Admin5", gameId: "CloudTops_Admin5", role: "管理员" },
    { id: 7, qqNumber: "555666777", qqId: "CT_Admin6", gameId: "CloudTops_Admin6", role: "管理员" },
    { id: 8, qqNumber: "666777888", qqId: "CT_Admin7", gameId: "CloudTops_Admin7", role: "管理员" },
    { id: 9, qqNumber: "777888999", qqId: "CT_Admin8", gameId: "CloudTops_Admin8", role: "管理员" },
    { id: 10, qqNumber: "888999000", qqId: "CT_Admin9", gameId: "CloudTops_Admin9", role: "管理员" }
  ];

  // 处理一键添加QQ好友
  const handleAddQQ = (qqNumber: string) => {
    const qqLink = `tencent://AddContact/?fromId=45&fromSubId=1&subcmd=all&uin=${qqNumber}&website=www.oicqzone.com`;
    window.location.href = qqLink;
  };

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      // 保存当前滚动位置
      const scrollY = window.scrollY;
      // 禁止body滚动
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // 恢复body滚动
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] overflow-y-auto py-8" 
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 md:p-8 rounded-2xl border-2 border-blue-200 shadow-2xl max-w-5xl w-full mx-4 h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        {/* 标题栏 - 固定在最上层 */}
        <div className="flex-shrink-0 flex justify-between items-center mb-6 pb-4 border-b border-blue-300 sticky top-0 bg-gradient-to-br from-blue-50 to-blue-100 z-10">
          <h3 className="text-2xl md:text-3xl font-bold text-blue-800">联系管理团队</h3>
          <button 
            onClick={onClose}
            className="text-blue-600 hover:text-blue-800 text-2xl font-bold"
          >
            ✕
          </button>
        </div>
        
        {/* 表格容器 - 可滚动区域 */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {/* 表格区域 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-200 flex-1 flex flex-col">
            {/* 表头 - 固定在表格顶部 */}
            <div className="grid grid-cols-12 bg-blue-100 text-blue-800 font-semibold text-sm md:text-base py-3 md:py-4 px-4 md:px-6 border-b border-blue-300 sticky top-0 z-10">
              <div className="col-span-2 text-center hidden md:block">头像</div>
              <div className="col-span-3 md:col-span-3">QQ号</div>
              <div className="col-span-4 md:col-span-3">QQ ID</div>
              <div className="col-span-4 md:col-span-3">游戏ID</div>
              <div className="col-span-1 md:col-span-1 text-center">操作</div>
            </div>
            
            {/* 管理员列表 - 可滚动区域 */}
            <div className="flex-1 overflow-y-auto divide-y divide-blue-100">
              {admins.map((admin) => (
                <div key={admin.id} className="grid grid-cols-12 items-center py-3 md:py-4 px-4 md:px-6 hover:bg-blue-50 transition-colors duration-200">
                  {/* 头像 - 桌面端显示 */}
                  <div className="col-span-2 hidden md:flex justify-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white border-2 border-blue-300 rounded-full flex items-center justify-center overflow-hidden">
                      <div className="text-blue-500 text-lg md:text-2xl font-bold">
                        {admin.role === "服主" ? "👑" : "👤"}
                      </div>
                    </div>
                  </div>
                  
                  {/* QQ号 */}
                  <div className="col-span-3 md:col-span-3">
                    <div className="text-blue-800 font-semibold text-sm md:text-lg">{admin.qqNumber}</div>
                    <div className="text-blue-600 text-xs md:text-sm mt-1">{admin.role}</div>
                  </div>
                  
                  {/* QQ ID */}
                  <div className="col-span-4 md:col-span-3">
                    <div className="text-blue-800 font-medium text-sm md:text-lg">{admin.qqId}</div>
                  </div>
                  
                  {/* 游戏ID */}
                  <div className="col-span-4 md:col-span-3">
                    <div className="text-blue-800 font-medium text-sm md:text-lg">{admin.gameId}</div>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => handleAddQQ(admin.qqNumber)}
                      className="bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold py-1 md:py-2 px-2 md:px-4 rounded-lg transition-colors duration-200 whitespace-nowrap text-xs md:text-sm"
                    >
                      添加
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 说明区域 */}
        <div className="flex-shrink-0 mt-6">
          <div className="bg-blue-50 rounded-xl p-4 md:p-6 border border-blue-200">
            <h4 className="text-lg md:text-xl font-semibold text-blue-800 mb-3">使用说明：</h4>
            <ul className="text-blue-700 space-y-2 text-sm md:text-base">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                <span>点击"添加"按钮可以快速添加对应的QQ好友</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                <span>添加好友时请备注"CloudTops服务器"以便管理员识别</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                <span>服主和管理员会在24小时内处理好友申请</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                <span>紧急问题请直接联系服主(QQ: 123456789)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                <span>建议优先联系在线时间长的管理员，回复更快</span>
              </li>
            </ul>
          </div>
          
          <div className="flex justify-center mt-6">
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

export default function HomePage() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isSponsorHovered, setIsSponsorHovered] = useState(false);
  const [showSponsorMobile, setShowSponsorMobile] = useState(false);
  const [showSimpleSponsor, setShowSimpleSponsor] = useState(false);
  
  // 处理滚动事件，实现全屏滚动效果
  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;
      const sections = document.querySelectorAll('section');
      const newSection = Math.max(0, Math.min(sections.length - 1, currentSection + direction));
      setCurrentSection(newSection);
      
      sections[newSection].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    };
    
    window.addEventListener('wheel', handleScroll, { passive: false });
    return () => window.removeEventListener('wheel', handleScroll);
  }, [currentSection]);
  
  return (
    <div className="min-h-screen relative">
      {/* 背景图片 - 动态根据页面切换 */}
      <div className="absolute inset-0 z-0">
        {/* 第一页背景图 */}
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${currentSection === 0 ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            backgroundImage: 'url(/主页背景图.png)',
            backgroundPosition: 'center 30%'
          }}
        ></div>
        {/* 第二页背景图 */}
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${currentSection === 1 ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            backgroundImage: 'url(/主页背景图2.png)',
            backgroundPosition: 'center 30%'
          }}
        ></div>
        {/* 第三页背景图 */}
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${currentSection === 2 ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            backgroundImage: 'url(/主页背景图3.png)',
            backgroundPosition: 'center 30%'
          }}
        ></div>
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black"></div>
      </div>
      
      {/* 导航栏 - 修改了按钮，只保留首页和申请白名单 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="text-xl font-bold text-blue-400">CT Cloud tops</div>
              <div className="text-xl font-bold text-white">云顶之境</div>
            </div>
            <div className="flex items-center space-x-6">
              <span 
                onClick={() => {
                  setCurrentSection(0);
                  document.querySelector('section:nth-child(1)')?.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="text-gray-300 hover:text-white cursor-pointer transition-colors duration-300"
              >
                首页
              </span>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition duration-300 cursor-default"
              >
                申请白名单
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 h-screen overflow-y-auto scroll-snap-type y mandatory">
        {/* 第一部分：首页 */}
        <section className="min-h-screen flex items-center justify-center px-6 py-24 scroll-snap-start">
          <div className="container mx-auto text-center">
            {/* 主标题 */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-blue-400">Cloud tops</span> 云顶之境
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-white">Minecraft 原版生存服务器</h2>
            
            {/* 描述文字 */}
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              一个由玩家共建的纯原版 Minecraft 生存社区。服务器为公益性质，不向玩家收取任何费用，旨在打造一个纯净、友好、充满创造乐趣的游戏环境。
            </p>
            
            {/* 服务器状态 */}
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
            
            {/* 服务器核心特色 - 使用4列布局 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              <FeatureCard 
                icon="grass" 
                title="原版生存" 
                description="基于最新版本 Minecraft 的纯原版生存体验，不添加任何影响平衡的插件。"
              />
              <FeatureCard 
                icon="redstone" 
                title="生电技术友好" 
                description="鼓励红石机械、自动化农场、大型工程，一起探索Minecraft的无限可能。"
              />
              <FeatureCard 
                icon="bed" 
                title="永久公益" 
                description="服务器永远免费，由服主自愿维护，打造真正的玩家社区，无任何付费特权。"
              />
              <FeatureCard 
                icon="poppy" 
                title="友好社区" 
                description="白名单审核确保每位玩家都遵守社区规范，共同维护友好的游戏环境。"
              />
            </div>
          </div>
        </section>

        {/* 第二部分：服务器介绍 */}
        <section className="min-h-screen flex items-center justify-center px-6 py-24 scroll-snap-start">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-white">服务器介绍</h2>
            
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-lg md:text-xl text-gray-300 text-center mb-12 leading-relaxed">
                Cloud tops 云顶之境是一个专注于原版生存的Minecraft服务器，我们致力于为玩家提供一个纯净、稳定、友好的游戏环境。服务器采用白名单审核制度，确保每一位玩家都能在一个安全、和谐的环境中享受游戏。
              </p>
              
              {/* 左右两栏布局 */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* 左侧：服务器特色 */}
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
                
                {/* 右侧：技术规格 */}
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
          </div>
        </section>

        {/* 第三部分：服务器风采 */}
        <section className="min-h-screen flex items-center justify-center px-6 py-24 scroll-snap-start">
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold text-center mb-12 text-white">服务器风采</h2>
            
            {/* 左右平分布局 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mx-auto">
              
              {/* 左侧：宣传视频 - 根据图片描述进行调整 */}
              <div className="bg-gray-900/70 p-8 rounded-xl border border-gray-700 h-full">
                <h3 className="text-3xl font-bold mb-8 text-center text-white">宣传视频</h3>
                <div className="rounded-lg overflow-hidden shadow-2xl mb-4">
                  <div className="aspect-video w-full bg-gray-900/50">
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
                <div className="mt-4 text-gray-300">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xl font-semibold text-white">Cloud tops云顶之境服务器1.21周目50天纪念</h4>
                    <div className="text-sm text-gray-400">4:51 / 3:25</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">腕</div>
                      <span>腕豆射手01 已关注</span>
                    </div>
                    <span className="text-blue-400">进入哔哩哔哩，观看更高清</span>
                  </div>
                </div>
              </div>
              
              {/* 右侧：简化的图片轮播 - 根据图片描述进行调整 */}
              <SimpleImageCarousel />
            </div>
          </div>
        </section>

        {/* 第四部分：白名单申请 */}
        <section className="min-h-screen flex items-center justify-center px-6 py-24 scroll-snap-start">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-12 text-white">加入我们的社区</h2>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-900/70 p-8 rounded-xl border border-gray-700 mb-12">
                <h3 className="text-2xl font-bold mb-6 text-white">申请白名单</h3>
                <p className="text-lg text-gray-300 mb-8">
                  为了维护纯净的游戏环境，我们采用白名单制度。申请通过后即可加入服务器，与数百位玩家一起创造属于你们的 Minecraft 世界。
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-300">
                  开始申请
                </button>
              </div>
              
              <div className="bg-gray-900/70 p-8 rounded-xl border border-gray-700">
                <h3 className="text-2xl font-bold mb-6 text-white">社区规则</h3>
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
        <footer className="min-h-80 bg-black/90 border-t border-gray-800 flex items-center scroll-snap-start">
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
                      onClick={() => {
                        setCurrentSection(0);
                        document.querySelector('section:nth-child(1)')?.scrollIntoView({ behavior: 'smooth' });
                      }} 
                      className="hover:text-blue-400 cursor-pointer transition-colors duration-300"
                    >
                      首页
                    </span>
                  </li>
                  <li>
                    <span 
                      onClick={() => {
                        setCurrentSection(1);
                        document.querySelector('section:nth-child(2)')?.scrollIntoView({ behavior: 'smooth' });
                      }} 
                      className="hover:text-blue-400 cursor-pointer transition-colors duration-300"
                    >
                      服务器介绍
                    </span>
                  </li>
                  <li>
                    <span 
                      onClick={() => {
                        setCurrentSection(2);
                        document.querySelector('section:nth-child(3)')?.scrollIntoView({ behavior: 'smooth' });
                      }} 
                      className="hover:text-blue-400 cursor-pointer transition-colors duration-300"
                    >
                      服务器风采
                    </span>
                  </li>
                  <li>
                    <span 
                      onClick={() => {
                        setCurrentSection(3);
                        document.querySelector('section:nth-child(4)')?.scrollIntoView({ behavior: 'smooth' });
                      }} 
                      className="hover:text-blue-400 cursor-pointer transition-colors duration-300"
                    >
                      申请白名单
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-4">常见问题</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><span className="hover:text-blue-400 cursor-pointer transition-colors duration-300">如何申请白名单？</span></li>
                  <li><span className="hover:text-blue-400 cursor-pointer transition-colors duration-300">服务器有哪些规则？</span></li>
                  <li><span className="hover:text-blue-400 cursor-pointer transition-colors duration-300">如何加入QQ群？</span></li>
                  <li><span className="hover:text-blue-400 cursor-pointer transition-colors duration-300">服务器IP地址是什么？</span></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-4">法律声明</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><span className="hover:text-blue-400 cursor-pointer transition-colors duration-300">服务条款</span></li>
                  <li><span className="hover:text-blue-400 cursor-pointer transition-colors duration-300">隐私政策</span></li>
                  <li><span className="hover:text-blue-400 cursor-pointer transition-colors duration-300">版权声明</span></li>
                  <li><span className="hover:text-blue-400 cursor-pointer transition-colors duration-300">免责声明</span></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
              <p>本服务器为玩家社群自发组建与维护，与 Mojang AB 无任何关联。</p>
              <p className="mt-2">遇到问题？请联系管理员 QQ: 123456789 或发送邮件至 admin@cloudtops.com</p>
            </div>
          </div>
        </footer>
      </main>

      {/* 右下角固定按钮 - 带文字 */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
        {/* 资源赞助按钮 */}
        <div className="relative"
          onMouseEnter={() => setIsSponsorHovered(true)}
          onMouseLeave={() => setIsSponsorHovered(false)}
        >
          <button 
            onClick={() => setShowSponsorModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg shadow-lg transition duration-300 flex items-center justify-center space-x-2 min-w-[140px]"
            title="自愿赞助"
          >
            <img src="/钻石.png" alt="钻石" className="w-5 h-5" />
            <span>自愿赞助</span>
          </button>
          
          {/* 悬停时显示的简单提示 */}
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
        <button 
          onClick={() => setShowComplaintModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg shadow-lg transition duration-300 flex items-center justify-center space-x-2 min-w-[140px]"
          title="投诉举报"
        >
          <span className="text-lg">🚫</span>
          <span>投诉举报</span>
        </button>
      </div>

      {/* 赞助二维码弹窗 */}
      <SponsorModal isOpen={showSponsorModal} onClose={() => setShowSponsorModal(false)} />

      {/* 联系管理弹窗 */}
      <ContactAdminModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />

      {/* 投诉举报弹窗 */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]" onClick={() => setShowComplaintModal(false)}>
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6 text-center text-white">投诉举报</h3>
            <p className="text-gray-300 mb-4">如果您在游戏中遇到违规行为或不愉快的体验，请通过以下方式联系我们：</p>
            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-bold text-red-400 mb-2">紧急投诉</h4>
                <p className="text-sm text-gray-300">QQ: 111222333</p>
                <a 
                  href="tencent://AddContact/?fromId=45&fromSubId=1&subcmd=all&uin=111222333&website=www.oicqzone.com" 
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm transition duration-300 inline-block"
                >
                  联系管理员
                </a>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-bold text-red-400 mb-2">违规举报</h4>
                <p className="text-sm text-gray-300 mb-2">请提供以下信息：</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 违规玩家ID</li>
                  <li>• 违规时间</li>
                  <li>• 违规行为描述</li>
                  <li>• 相关证据（截图/视频）</li>
                </ul>
              </div>
            </div>
            <button 
              onClick={() => setShowComplaintModal(false)}
              className="mt-6 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition duration-300"
            >
              关闭
            </button>
          </div>
        </div>
      )}

    </div>
  );
}