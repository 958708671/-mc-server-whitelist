'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FormData {
  minecraftId: string;
  age: string;
  gender: string;
  contact: string;
  howFound: string;
  playTime: string;
  playTimeSlot: string;
  skillType: string[];
  occupation: string;
}

export default function ApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const quizScore = searchParams.get('score') || '0';
  const quizTotal = searchParams.get('total') || '100';
  const quizCategories = searchParams.get('categories') || '';
  const selectedCategories = searchParams.get('selected') || '';

  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    minecraftId: '',
    age: '',
    gender: '',
    contact: '',
    howFound: '',
    playTime: '',
    playTimeSlot: '',
    skillType: [],
    occupation: ''
  });

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [archiveFile, setArchiveFile] = useState<File | null>(null);
  const [archivePreviewUrl, setArchivePreviewUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const isSpecialCategory = selectedCategories.includes('building') || selectedCategories.includes('redstone');

  // 页面加载时检查管理员状态
  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('开始检查管理员状态');
      try {
        // 直接检查localStorage中是否有管理员登录信息
        // 这是一个临时解决方案，确保管理员能够直接通过验证
        const adminInfo = localStorage.getItem('adminInfo');
        console.log('localStorage中的adminInfo:', adminInfo);
        
        if (adminInfo) {
          console.log('管理员身份验证通过（localStorage）');
          // 管理员直接通过验证
          setIsValid(true);
          setFormData(prev => ({
            ...prev,
            skillType: ['建筑', '生存', '指令', '生电', '附魔与酿造']
          }));
          setIsChecking(false);
          return;
        }
        
        // 尝试通过API检查管理员状态
        console.log('尝试通过API检查管理员状态');
        const adminRes = await fetch('/api/admin/check', {
          credentials: 'include'
        });
        console.log('管理员检查API响应状态:', adminRes.status);
        const adminData = await adminRes.json();
        console.log('管理员检查API响应数据:', adminData);
        
        if (adminData.isAdmin) {
          console.log('管理员身份验证通过（API）');
          // 管理员直接通过验证
          setIsValid(true);
          setFormData(prev => ({
            ...prev,
            skillType: ['建筑', '生存', '指令', '生电', '附魔与酿造']
          }));
          setIsChecking(false);
          return;
        }
        
        console.log('非管理员，检查答题分数:', quizScore);
        // 非管理员需要检查答题分数
        const score = parseInt(quizScore);
        if (score >= 60) {
          console.log('答题分数通过:', score);
          setIsValid(true);

          const categories = selectedCategories.split(',');
          const skillTypes = categories.map(category => {
            switch (category) {
              case 'survival': return '生存';
              case 'building': return '建筑';
              case 'redstone': return '红石';
              case 'commands': return '指令';
              case 'enchanting': return '附魔';
              default: return category;
            }
          });

          setFormData(prev => ({
            ...prev,
            skillType: skillTypes
          }));
        } else {
          console.log('答题分数未通过:', score);
          setIsValid(false);
        }
      } catch (error) {
        console.error('检查管理员状态失败:', error);
        // 出错时默认检查答题分数
        const score = parseInt(quizScore);
        console.log('出错时检查答题分数:', score);
        setIsValid(score >= 60);
      } finally {
        console.log('检查完成，设置isChecking为false');
        setIsChecking(false);
      }
    };

    checkAdminStatus();
  }, []); // 空依赖数组，只在页面加载时执行一次

  // 答题分数变化时检查
  useEffect(() => {
    // 只有非管理员才需要检查答题分数
    const checkQuizScore = async () => {
      try {
        // 直接检查localStorage中是否有管理员登录信息
        const adminInfo = localStorage.getItem('adminInfo');
        
        if (!adminInfo) {
          // 非管理员需要检查答题分数
          console.log('非管理员，检查答题分数:', quizScore);
          const score = parseInt(quizScore);
          if (score >= 60) {
            console.log('答题分数通过:', score);
            setIsValid(true);

            const categories = selectedCategories.split(',');
            const skillTypes = categories.map(category => {
              switch (category) {
                case 'survival': return '生存';
                case 'building': return '建筑';
                case 'redstone': return '红石';
                case 'commands': return '指令';
                case 'enchanting': return '附魔';
                default: return category;
              }
            });

            setFormData(prev => ({
              ...prev,
              skillType: skillTypes
            }));
          } else {
            console.log('答题分数未通过:', score);
            setIsValid(false);
          }
        }
      } catch (error) {
        console.error('检查答题分数失败:', error);
        const score = parseInt(quizScore);
        setIsValid(score >= 60);
      }
    };

    checkQuizScore();
  }, [quizScore, selectedCategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as any;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...photoFiles, ...files].slice(0, 10);
    setPhotoFiles(newFiles);

    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setPhotoPreviewUrls(newPreviewUrls);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleArchiveUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchiveFile(file);
      setArchivePreviewUrl(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('开始提交表单');
    setIsSubmitting(true);
    setSubmitMessage('');

    const qqRegex = /^[1-9]\d{4,10}$/;
    if (!qqRegex.test(formData.contact)) {
      setSubmitMessage('请输入有效的QQ号（5-11位数字）');
      setIsSubmitting(false);
      return;
    }

    if (isSpecialCategory) {
      const hasPhotos = photoFiles.length >= 3;
      const hasVideo = videoFile !== null;
      const hasArchive = archiveFile !== null;

      if (!hasArchive) {
        setSubmitMessage('请上传存档文件');
        setIsSubmitting(false);
        return;
      }

      if (!hasPhotos && !hasVideo) {
        setSubmitMessage('照片至少3张或视频至少1个');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const allFiles: File[] = [];

      photoFiles.forEach(file => allFiles.push(file));
      if (videoFile) allFiles.push(videoFile);
      if (archiveFile) allFiles.push(archiveFile);

      let uploadedUrls: string[] = [];

      if (allFiles.length > 0) {
        console.log('开始上传作品文件');
        const uploadFormData = new FormData();
        allFiles.forEach(file => {
          uploadFormData.append('files', file);
        });
        uploadFormData.append('uploaderName', formData.minecraftId || '未知用户');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadData.success) {
          throw new Error(uploadData.message || '文件上传失败');
        }

        uploadedUrls = uploadData.urls;
        console.log('文件上传成功:', uploadedUrls);
      }

      console.log('开始提交申请');

      const photoUrls = uploadedUrls.slice(0, photoFiles.length);
      const videoUrl = videoFile ? uploadedUrls[photoFiles.length] : null;
      const archiveUrl = archiveFile ? uploadedUrls[photoFiles.length + (videoFile ? 1 : 0)] : null;

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minecraft_id: formData.minecraftId,
          contact: formData.contact,
          age: parseInt(formData.age),
          gender: formData.gender,
          how_found: formData.howFound,
          play_time: formData.playTime,
          play_style: formData.skillType.join(', '),
          griefing_history: '无',
          quiz_score: parseInt(quizScore),
          quiz_total: parseInt(quizTotal),
          quiz_category: quizCategories,
          reason: '',
          favorite_mode: formData.playTimeSlot,
          server_experience: '',
          country: '',
          discord_id: '',
          additional_info: '',
          work_files: {
            photos: photoUrls,
            video: videoUrl,
            archive: archiveUrl
          },
          scenario_answers: {}
        }),
      });

      console.log('请求完成，状态码:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('响应数据:', data);

      if (data.success) {
        setSubmitMessage('申请提交成功！请等待管理员审核。');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setSubmitMessage(data.message || '提交失败，请重试。');
      }
    } catch (error) {
      console.error('提交出错:', error);
      setSubmitMessage(error instanceof Error ? error.message : '网络错误，请检查连接后重试。');
    } finally {
      console.log('执行finally，设置isSubmitting为false');
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 flex items-center justify-center">
        <div className="text-white text-xl">正在验证答题信息...</div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 flex items-center justify-center">
        <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">验证失败</h2>
          <p className="text-gray-400 mb-6">您的答题分数未达到60分，无法填写申请表。</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">填写申请表</h1>
          <p className="text-gray-400">请完整填写以下信息，提交后等待管理员审核</p>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">Minecraft ID <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="minecraftId"
                    value={formData.minecraftId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="请输入你的Minecraft游戏ID"
                  />
                  <p className="mt-1 text-xs text-gray-500">请确保ID准确无误，这将是你在服务器中的名字</p>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">年龄 <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="10"
                    max="80"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="请输入你的年龄"
                  />
                  <p className="mt-1 text-xs text-gray-500">服务器要求年龄10岁以上</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">性别 <span className="text-red-500">*</span></label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">请选择</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">用于服务器人口统计分析</p>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">QQ号 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="请输入你的QQ号"
                  />
                  <p className="mt-1 text-xs text-gray-500">管理员会通过QQ联系你</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">身份/职业 <span className="text-red-500">*</span></label>
                  <select
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">请选择</option>
                    <option value="小学">小学</option>
                    <option value="初中">初中</option>
                    <option value="高中">高中</option>
                    <option value="中专">中专</option>
                    <option value="大专">大专</option>
                    <option value="大学">大学</option>
                    <option value="硕士">硕士</option>
                    <option value="博士">博士</option>
                    <option value="工作">工作</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">了解玩家的学习或工作背景</p>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">如何了解到本服务器 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="howFound"
                    value={formData.howFound}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="朋友推荐/论坛/视频等"
                  />
                  <p className="mt-1 text-xs text-gray-500">帮助我们了解服务器的宣传效果</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">游戏时长 <span className="text-red-500">*</span></label>
                  <select
                    name="playTime"
                    value={formData.playTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">请选择</option>
                    <option value="新手（1年以内）">新手（1年以内）</option>
                    <option value="熟练（1-3年）">熟练（1-3年）</option>
                    <option value="老手（3-5年）">老手（3-5年）</option>
                    <option value="专家（5年以上）">专家（5年以上）</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">了解玩家的游戏经验水平</p>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">游戏时段 <span className="text-red-500">*</span></label>
                  <select
                    name="playTimeSlot"
                    value={formData.playTimeSlot}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">请选择</option>
                    <option value="早上（6:00-12:00）">早上（6:00-12:00）</option>
                    <option value="下午（12:00-18:00）">下午（12:00-18:00）</option>
                    <option value="晚上（18:00-24:00）">晚上（18:00-24:00）</option>
                    <option value="凌晨（0:00-6:00）">凌晨（0:00-6:00）</option>
                    <option value="不确定">不确定</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">了解玩家的游戏时间分布</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">擅长领域</label>
              <div className="flex flex-wrap gap-2">
                {formData.skillType.map(skill => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-600/30 border border-blue-500 rounded-full text-blue-300 text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">根据你选择的题库自动生成</p>
            </div>

            {isSpecialCategory && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">作品上传</h3>

                <div>
                  <label className="block text-gray-300 mb-2">存档文件 <span className="text-red-500">* 必填</span></label>
                  <p className="mb-3 text-xs text-gray-500">请上传你的存档文件（ZIP/RAR/7Z格式）</p>
                  <input
                    type="file"
                    name="archive"
                    onChange={handleArchiveUpload}
                    accept=".zip,.rar,.7z"
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 file:cursor-pointer"
                  />
                  {archivePreviewUrl && (
                    <div className="mt-2 text-sm text-green-400">
                      ✅ 已选择文件: {archivePreviewUrl}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">照片 <span className="text-red-500">* 至少3张</span></label>
                  <p className="mb-3 text-xs text-gray-500">请上传你的作品照片（至少3张，PNG/JPG格式）</p>
                  <input
                    type="file"
                    name="photos"
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    multiple
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                  />
                  {photoPreviewUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {photoPreviewUrls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Photo ${index + 1}`}
                          className="rounded-lg object-cover w-full h-24"
                        />
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">已上传 {photoFiles.length}/10 张照片</p>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">视频 <span className="text-gray-500">可选</span></label>
                  <p className="mb-3 text-xs text-gray-500">请上传你的作品视频（至少30秒，MP4格式）</p>
                  <input
                    type="file"
                    name="video"
                    onChange={handleVideoUpload}
                    accept="video/mp4"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                  />
                  {videoPreviewUrl && (
                    <div className="mt-2">
                      <video
                        src={videoPreviewUrl}
                        controls
                        className="max-w-full h-auto rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-center">
              {submitMessage && (
                <div className={`mb-4 p-3 rounded-lg ${submitMessage.includes('成功') ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                  {submitMessage}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '提交中...' : '提交申请'}
              </button>
              <p className="mt-2 text-sm text-gray-400">提交后请等待管理员审核，审核结果会通过QQ通知你</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}