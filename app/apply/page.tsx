'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { questionCategories } from '@/data/questions';
import type { Question, QuestionCategory } from '@/data/questions';

interface QuizQuestion extends Question {
  categoryId: string;
  categoryName: string;
}

function ApplyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const skipQuiz = searchParams.get('skipQuiz') === 'true';
  const processedResultIndexRef = useRef<Record<number, number>>({});
  const currentQuestionIndexRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<Record<string, number>>({});
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAttemptsRemaining, setQuizAttemptsRemaining] = useState<number>(3);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isLimited, setIsLimited] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number[]>>({});
  const [showResult, setShowResult] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  const [failedRequired, setFailedRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [newBannedServer, setNewBannedServer] = useState('');
  const [showAnswers, setShowAnswers] = useState(false);
  const [hasBeenBanned, setHasBeenBanned] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [scenarioTextAnswers, setScenarioTextAnswers] = useState<Record<number, string>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [archiveFile, setArchiveFile] = useState<File | null>(null);
  const [archivePreviewUrl, setArchivePreviewUrl] = useState<string>('');
  
  const [formData, setFormData] = useState({
    minecraftId: '',
    contact: '',
    age: '',
    gender: '',
    occupation: '',
    playTime: '',
    playTimeSlot: '',
    howFound: '',
    skillType: [] as string[],
    bannedServers: [] as string[]
  });

  useEffect(() => {
    if (skipQuiz) {
      setQuizPassed(true);
      setCurrentStep(2);
      setFormData(prev => ({
        ...prev,
        skillType: ['建筑', '生存', '指令', '生电', '附魔与酿造']
      }));
    }
  }, [skipQuiz]);

  // 检查答题次数和管理员状态
  useEffect(() => {
    async function checkQuizAttempts() {
      try {
        // 检查是否是管理员
        const adminRes = await fetch('/api/admin/status');
        const adminData = await adminRes.json();
        setIsAdminUser(adminData.isAdmin);

        // 如果是管理员，不限制答题次数
        if (adminData.isAdmin) {
          setIsLimited(false);
          setQuizAttemptsRemaining(-1); // 无限次
          return;
        }

        // 检查答题次数
        const attemptsRes = await fetch('/api/quiz-attempts');
        const attemptsData = await attemptsRes.json();

        if (attemptsData.success) {
          setQuizAttemptsRemaining(attemptsData.remaining);
          setIsLimited(attemptsData.remaining <= 0);
        }
      } catch (error) {
        console.error('检查答题次数失败:', error);
      }
    }

    checkQuizAttempts();
  }, []);

  // 当返回选择题库时，重新检查答题次数
  useEffect(() => {
    if (currentStep === 0 && !skipQuiz) {
      // 返回选择题库时，重新获取最新的答题次数
      async function refreshAttempts() {
        try {
          if (isAdminUser) return;

          const attemptsRes = await fetch('/api/quiz-attempts');
          const attemptsData = await attemptsRes.json();
          if (attemptsData.success) {
            setQuizAttemptsRemaining(attemptsData.remaining);
            setIsLimited(attemptsData.remaining <= 0);
          }
        } catch (error) {
          console.error('刷新答题次数失败:', error);
        }
      }

      refreshAttempts();
    }
  }, [currentStep, skipQuiz, isAdminUser]);

  // 根据是否选择建筑或生电决定题目数量
  const isSpecialCategory = Object.keys(selectedCategories).some(id => 
    id === 'building' || id === 'redstone'
  );
  const QUESTION_COUNT = isSpecialCategory ? 15 : 30;
  
  // 15道题：单选8×5=40，多选4×10=40，判断2×5=10，实景1×0=0，共100分
  // 30道题：单选18×3=54，多选6×5=30，判断4×3=12，实景2×0=0，共100分
  const SINGLE_CHOICE_COUNT = isSpecialCategory ? 8 : 18;
  const MULTIPLE_CHOICE_COUNT = isSpecialCategory ? 4 : 6;
  const JUDGMENT_COUNT = isSpecialCategory ? 2 : 4;
  const SCENARIO_COUNT = isSpecialCategory ? 1 : 2;

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newSelected = { ...prev };
      if (newSelected[categoryId]) {
        delete newSelected[categoryId];
      } else {
        newSelected[categoryId] = 1;
      }
      
      const uniqueSkillTypes = generateSkillTypes(Object.keys(newSelected));
      setFormData(prev => ({
        ...prev,
        skillType: uniqueSkillTypes
      }));
      
      return newSelected;
    });
  };

  const handleWeightChange = (categoryId: string, weight: number) => {
    setSelectedCategories(prev => {
      const newSelected = {
        ...prev,
        [categoryId]: weight
      };
      
      const uniqueSkillTypes = generateSkillTypes(Object.keys(newSelected));
      setFormData(prev => ({
        ...prev,
        skillType: uniqueSkillTypes
      }));
      
      return newSelected;
    });
  };

  const generateSkillTypes = (categoryIds: string[]) => {
    const skillTypes: string[] = [];
    
    categoryIds.forEach(categoryId => {
      const category = questionCategories.find(c => c.id === categoryId);
      if (category) {
        skillTypes.push(category.name);
      }
    });
    
    return [...new Set(skillTypes)];
  };

  // 获取了解程度文字
  const getProficiencyLabel = (value: number): string => {
    const labels: Record<number, string> = {
      1: '入门',
      2: '了解',
      3: '熟悉',
      4: '熟练',
      5: '精通'
    };
    return labels[value] || '入门';
  };

  const startQuiz = () => {
    const categoryIds = Object.keys(selectedCategories);
    if (categoryIds.length === 0) return;
    if (categoryIds.length > 5) {
      alert('最多只能选择5个分类');
      return;
    }

    const allSingleQuestions: QuizQuestion[] = [];
    const allMultipleQuestions: QuizQuestion[] = [];
    const allJudgmentQuestions: QuizQuestion[] = [];
    const allScenarioQuestions: QuizQuestion[] = [];

    // 从选择的分类中添加题目
    categoryIds.forEach(categoryId => {
      const category = questionCategories.find(c => c.id === categoryId);
      if (!category) return;

      category.questions.forEach(q => {
        const quizQ: QuizQuestion = {
          ...q,
          categoryId: category.id,
          categoryName: category.name
        };
        if (q.type === 'single') allSingleQuestions.push(quizQ);
        else if (q.type === 'multiple') allMultipleQuestions.push(quizQ);
        else if (q.type === 'judgment') allJudgmentQuestions.push(quizQ);
        else if (q.type === 'scenario') allScenarioQuestions.push(quizQ);
      });
    });

    // 打乱题库
    const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
    
    // 抽取题目
    const selectedSingle = shuffle(allSingleQuestions).slice(0, SINGLE_CHOICE_COUNT);
    const selectedMultiple = shuffle(allMultipleQuestions).slice(0, MULTIPLE_CHOICE_COUNT);
    const selectedJudgment = shuffle(allJudgmentQuestions).slice(0, JUDGMENT_COUNT);
    const selectedScenario = shuffle(allScenarioQuestions).slice(0, SCENARIO_COUNT);

    // 最终题目顺序：单选 -> 多选 -> 判断 -> 实景
    const finalQuestions = [
      ...selectedSingle,
      ...selectedMultiple,
      ...selectedJudgment,
      ...selectedScenario
    ];

    setQuizQuestions(finalQuestions);
    setCurrentStep(1);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setScenarioTextAnswers({});
    setShowResult(false);
    setShowQuestionNav(false);
    setShowAnswers(false);
    setShowStartModal(false);
  };

  const generateQuiz = () => {
    const categoryIds = Object.keys(selectedCategories);
    if (categoryIds.length === 0) return;
    if (categoryIds.length > 5) {
      alert('最多只能选择5个分类');
      return;
    }

    // 检查答题次数限制（非管理员）
    if (isLimited && !isAdminUser) {
      alert(`您今天的答题次数已用完（3/3）。\n请明天再试或联系管理员解除限制。`);
      return;
    }

    setShowStartModal(true);
  };

  const handleOptionToggle = (optionIndex: number) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isMultiple = currentQuestion.type === 'multiple';
    
    setUserAnswers(prev => {
      const currentAnswers = prev[currentQuestionIndex] || [];
      let newAnswers: number[];
      
      if (isMultiple) {
        if (currentAnswers.includes(optionIndex)) {
          newAnswers = currentAnswers.filter(a => a !== optionIndex);
        } else {
          newAnswers = [...currentAnswers, optionIndex].sort();
        }
      } else {
        newAnswers = [optionIndex];
      }
      
      return {
        ...prev,
        [currentQuestionIndex]: newAnswers
      };
    });
  };

  const handleNextQuestion = () => {
    const currentAnswers = userAnswers[currentQuestionIndex] || [];
    const currentQuestion = quizQuestions[currentQuestionIndex];
    
    // 主观题检查 scenarioTextAnswers
    if (currentQuestion?.type === 'scenario') {
      const textAnswer = scenarioTextAnswers[currentQuestionIndex];
      if (!textAnswer || textAnswer.trim() === '') return;
    } else if (currentAnswers.length === 0) {
      // 选择题检查 userAnswers
      return;
    }

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // 所有题目答完，显示结果
      checkAllAnswers();
    }
  };

  const checkAllAnswers = async () => {
    setShowResult(true);
    setShowAnswers(true);
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let earnedScore = 0;
    
    quizQuestions.forEach((question, index) => {
      if (question.type === 'scenario') return;
      
      totalScore += question.score;
      const userAnswer = userAnswers[index] || [];
      const correctAnswer = Array.isArray(question.correct) ? question.correct : [question.correct];
      
      if (userAnswer.length === correctAnswer.length && 
          userAnswer.every(a => correctAnswer.includes(a))) {
        earnedScore += question.score;
      }
    });
    
    return { earnedScore, totalScore, percentage: totalScore > 0 ? (earnedScore / totalScore) * 100 : 0 };
  };

  const handleQuizComplete = async () => {
    const { earnedScore, totalScore } = calculateScore();

    if (earnedScore >= 60) {
      const selectedCategoryIds = Object.keys(selectedCategories);
      const uniqueSkillTypes = generateSkillTypes(selectedCategoryIds);

      setFormData(prev => ({
        ...prev,
        skillType: uniqueSkillTypes
      }));

      setQuizPassed(true);
      setCurrentStep(2);
    } else {
      // 答题没通过，记录一次（非管理员）
      if (!isAdminUser) {
        try {
          await fetch('/api/quiz-attempts', { method: 'POST' });

          // 增加后重新获取最新的答题次数
          const attemptsRes = await fetch('/api/quiz-attempts');
          const attemptsData = await attemptsRes.json();
          if (attemptsData.success) {
            setQuizAttemptsRemaining(attemptsData.remaining);
            setIsLimited(attemptsData.remaining <= 0);
          }
        } catch (error) {
          console.error('增加答题次数失败:', error);
        }
      }

      setShowResult(false);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setShowAnswers(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    
    if (name === 'skillType' && type === 'checkbox') {
      setFormData(prev => {
        const currentSkills = prev.skillType as string[];
        if (checked) {
          return { ...prev, skillType: [...currentSkills, value] };
        } else {
          return { ...prev, skillType: currentSkills.filter(skill => skill !== value) };
        }
      });
    } else {
      setFormData(prev => ({
        ...prev, 
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('开始提交表单');
    setIsSubmitting(true);
    setSubmitMessage('');

    // 验证QQ号
    const qqRegex = /^[1-9]\d{4,10}$/;
    if (!qqRegex.test(formData.contact)) {
      setSubmitMessage('请输入有效的QQ号（5-11位数字）');
      setIsSubmitting(false);
      return;
    }

    // 如果选择了建筑或生电，校验是否上传了作品
    if (isSpecialCategory) {
      const hasPhotos = photoFiles.length >= 3;
      const hasVideo = videoFile !== null;
      const hasArchive = archiveFile !== null;
      
      // 至少要有存档
      if (!hasArchive) {
        setSubmitMessage('请上传存档文件');
        setIsSubmitting(false);
        return;
      }
      
      // 照片至少3张或视频至少1个
      if (!hasPhotos && !hasVideo) {
        setSubmitMessage('照片至少3张或视频至少1个');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const allFiles: File[] = [];
      
      // 收集所有文件
      photoFiles.forEach(file => allFiles.push(file));
      if (videoFile) allFiles.push(videoFile);
      if (archiveFile) allFiles.push(archiveFile);
      
      let uploadedUrls: string[] = [];
      
      // 如果有文件，先上传
      if (allFiles.length > 0) {
        console.log('开始上传作品文件');
        const uploadFormData = new FormData();
        allFiles.forEach(file => {
          uploadFormData.append('files', file);
        });
        
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
      const { earnedScore, totalScore } = calculateScore();
      
      // 分离照片、视频、存档的URL
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
          griefing_history: formData.bannedServers.length > 0 ? formData.bannedServers.join(', ') : '无',
          quiz_score: earnedScore,
          quiz_total: totalScore,
          quiz_category: Object.keys(selectedCategories).join(', '),
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
          scenario_answers: scenarioTextAnswers
        }),
      });

      console.log('请求完成，状态码:', response.status);
      
      // 检查响应状态
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
      // 确保isSubmitting状态被重置
      setIsSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setSelectedCategories({});
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResult(false);
    setQuizPassed(false);
    setShowQuestionNav(false);
    setFailedRequired(false);
    setShowAnswers(false);
    setIsRecording(false);
    setFormData(prev => ({
      ...prev,
      skillType: []
    }));
  };

  const addBannedServer = () => {
    if (newBannedServer.trim()) {
      setFormData(prev => ({
        ...prev,
        bannedServers: [...prev.bannedServers, newBannedServer.trim()]
      }));
      setNewBannedServer('');
    }
  };

  const removeBannedServer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bannedServers: prev.bannedServers.filter((_, i) => i !== index)
    }));
  };

  const handleScenarioTextChange = (index: number, text: string) => {
    setScenarioTextAnswers(prev => ({
      ...prev,
      [index]: text
    }));
  };

  const handleVoiceInput = (index: number) => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      // 如果正在录音，则停止
      if (isRecording) {
        (window as any).speechRecognitionInstance?.stop();
        setIsRecording(false);
        return;
      }
      
      // 开始新的录音
      const recognition = new SpeechRecognition();
      (window as any).speechRecognitionInstance = recognition;
      recognitionRef.current = recognition;
      currentQuestionIndexRef.current = index;
      
      recognition.lang = 'zh-CN';
      recognition.continuous = true;
      recognition.interimResults = true;

      setIsRecording(true);
      
      // 保存当前的文本作为基础
      const baseText = scenarioTextAnswers[index] || '';
      
      recognition.onresult = (event: any) => {
        // 最终文本累积
        let finalText = baseText;
        // 临时文本（实时显示）
        let interimText = '';
        
        // 遍历所有结果
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            // 最终结果：检查是否已包含这段文本
            if (!finalText.includes(transcript)) {
              finalText += transcript;
            }
          } else {
            // 临时结果：直接显示
            interimText += transcript;
          }
        }
        
        // 显示：基础文本 + 临时文本
        handleScenarioTextChange(index, finalText + interimText);
      };

      recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error);
        setIsRecording(false);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          alert('语音识别出错，请使用键盘输入');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } else {
      alert('您的浏览器不支持语音识别，请使用键盘输入');
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...photoFiles, ...files].slice(0, 10);
    setPhotoFiles(newFiles);

    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setPhotoPreviewUrls(newPreviewUrls);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleArchiveFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (archivePreviewUrl) {
        URL.revokeObjectURL(archivePreviewUrl);
      }
      setArchiveFile(file);
      setArchivePreviewUrl(file.name);
    }
  };

  const removePhotoFile = (index: number) => {
    const newFiles = photoFiles.filter((_, i) => i !== index);
    setPhotoFiles(newFiles);

    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setPhotoPreviewUrls(newPreviewUrls);
  };

  const removeVideoFile = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoFile(null);
    setVideoPreviewUrl('');
  };

  const removeArchiveFile = () => {
    if (archivePreviewUrl) {
      URL.revokeObjectURL(archivePreviewUrl);
    }
    setArchiveFile(null);
    setArchivePreviewUrl('');
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = quizQuestions.length > 0 ? ((currentQuestionIndex + 1) / quizQuestions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
      {/* 开始答题前的提示弹窗 */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-2xl border border-gray-700">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-4">重要提示</h2>
            </div>
            
            <div className="text-gray-300 space-y-4 mb-8">
              <p>
                {isSpecialCategory ? (
                  <>
                    您选择了<span className="text-yellow-400 font-bold">建筑</span>或<span className="text-yellow-400 font-bold">生电</span>领域，
                    答题后需要<span className="text-green-400 font-bold">上传您的作品</span>供管理员审核。
                  </>
                ) : (
                  <>
                    请准备好您的答题内容。
                  </>
                )}
              </p>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">答题说明：</h3>
                <ul className="text-gray-400 space-y-1 text-sm">
                  <li>• 总分100分，60分及以上为通过</li>
                  <li>• 单选题、多选题、判断题计入总分</li>
                  <li>• 主观题不计入总分，由管理员审核</li>
                  {isSpecialCategory && (
                    <li className="text-yellow-400">• 答题通过后需要上传作品（详见下方要求）</li>
                  )}
                  {isAdminUser ? (
                    <li className="text-green-400">• 管理员模式：无限答题次数</li>
                  ) : (
                    <li className="text-orange-400">• 每人每天最多答题 <span className="font-bold">3 次</span></li>
                  )}
                </ul>
              </div>
              {isSpecialCategory && (
                <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-600/50">
                  <h3 className="text-yellow-400 font-semibold mb-2">作品要求：</h3>
                  <ul className="text-yellow-300/80 space-y-1 text-sm">
                    <li>• 存档：必选</li>
                    <li>• 照片：至少3张</li>
                    <li>• 视频：至少30秒</li>
                  </ul>
                  <p className="text-yellow-300/60 text-xs mt-2">
                    照片和视频二选一，但存档必须上传
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowStartModal(false)}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition-all"
              >
                返回
              </button>
              <button
                onClick={startQuiz}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
              >
                我已了解，开始答题
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 返回重新选择确认弹窗 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-2xl border border-gray-700">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-4">确认返回</h2>
            </div>
            
            <div className="text-gray-300 mb-8 text-center">
              <p>确定要返回重新选择题库吗？</p>
              <p className="text-gray-500 mt-2">已答的题目将被清空！</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition-all"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  resetQuiz();
                }}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
              >
                确认返回
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">白名单申请</h1>
          <p className="text-gray-400">完成答题测试，申请加入服务器</p>
        </div>

        {currentStep === 0 && (
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">选择题库类型</h2>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                返回主页
              </button>
            </div>
            <p className="text-gray-400 mb-6">请选择您擅长的领域（最多5个）</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {questionCategories.map(category => {
                const isSelected = selectedCategories[category.id] !== undefined;
                const proficiency = selectedCategories[category.id] || 1;
                return (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {category.id === 'building' ? (
                        <Image src="/images/建筑.png" alt="建筑" width={48} height={48} />
                      ) : (
                        <span className="text-4xl">{category.icon}</span>
                      )}
                      <h3 className="text-xl font-bold text-white">{category.name}</h3>
                    </div>
                    
                    {isSelected && (
                      <div className="mt-3">
                        <label className="text-sm text-gray-400">了解程度</label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={proficiency}
                          onChange={(e) => handleWeightChange(category.id, parseInt(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full mt-1"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span className={proficiency === 1 ? 'text-green-400 font-bold' : ''}>入门</span>
                          <span className={proficiency === 2 ? 'text-green-400 font-bold' : ''}>了解</span>
                          <span className={proficiency === 3 ? 'text-green-400 font-bold' : ''}>熟悉</span>
                          <span className={proficiency === 4 ? 'text-green-400 font-bold' : ''}>熟练</span>
                          <span className={proficiency === 5 ? 'text-green-400 font-bold' : ''}>精通</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <span className="text-gray-400">
                  已选择 {Object.keys(selectedCategories).length}/5 个分类
                </span>
                {!isAdminUser && quizAttemptsRemaining >= 0 && (
                  <span className={`font-semibold ${
                    isLimited
                      ? 'text-red-400 bg-red-900/30 px-3 py-1 rounded-full'
                      : quizAttemptsRemaining === 0
                      ? 'text-green-400'
                      : quizAttemptsRemaining === 1
                      ? 'text-yellow-400'
                      : 'text-orange-400'
                  }`}>
                    {3 - quizAttemptsRemaining}/3 答题
                    {isLimited && ' ⚠️ 次数已用完'}
                  </span>
                )}
                {!isAdminUser && quizAttemptsRemaining < 0 && (
                  <span className="text-green-400 font-semibold">
                    管理员模式（无限次）
                  </span>
                )}
              </div>
              <button
                onClick={generateQuiz}
                disabled={Object.keys(selectedCategories).length === 0}
                className={`px-8 py-3 rounded-lg font-bold transition-all ${
                  Object.keys(selectedCategories).length === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                开始答题
              </button>
            </div>
          </div>
        )}

        {currentStep === 1 && !showResult && (
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">答题测试</h2>
              <div className="flex items-center gap-4">
                <span className="text-gray-400">
                  {currentQuestionIndex + 1} / {quizQuestions.length}
                </span>
                <button
                  onClick={() => setShowQuestionNav(!showQuestionNav)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {showQuestionNav ? '隐藏' : '显示'}导航
                </button>
              </div>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {showQuestionNav && (
              <div className="grid grid-cols-10 gap-2 mb-6">
                {quizQuestions.map((q, idx) => {
                  const hasAnswer = userAnswers[idx]?.length > 0;
                  const isCurrent = idx === currentQuestionIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`p-2 rounded text-sm ${
                        isCurrent 
                          ? 'bg-blue-500 text-white' 
                          : hasAnswer 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    currentQuestion.type === 'single' 
                      ? 'bg-blue-500/20 text-blue-400'
                      : currentQuestion.type === 'multiple'
                        ? 'bg-purple-500/20 text-purple-400'
                        : currentQuestion.type === 'judgment'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {currentQuestion.type === 'single' 
                      ? '单选题' 
                      : currentQuestion.type === 'multiple'
                        ? '多选题'
                        : currentQuestion.type === 'judgment'
                          ? '判断题'
                          : '主观题'}
                  </span>
                  {currentQuestion.type !== 'scenario' && (
                    <span className="text-gray-500 text-xs">{currentQuestion.score}分</span>
                  )}
                  {currentQuestion.type === 'scenario' && (
                    <span className="text-gray-500 text-xs">不计分</span>
                  )}
                  <span className="text-gray-500 text-sm">{currentQuestion.categoryName}</span>
                </div>

                <h3 className="text-xl text-white mb-6">{currentQuestion.question}</h3>

                {currentQuestion.type === 'scenario' ? (
                  <div className="space-y-3">
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => handleVoiceInput(currentQuestionIndex)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                          isRecording 
                            ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        🎤 {isRecording ? '录音中...' : '语音输入'}
                      </button>
                      <span className="text-gray-400 text-sm self-center">
                        {isRecording ? '再次点击停止录音' : '或直接输入文字'}
                      </span>
                    </div>
                    <textarea
                      value={scenarioTextAnswers[currentQuestionIndex] || ''}
                      onChange={(e) => handleScenarioTextChange(currentQuestionIndex, e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none min-h-[200px]"
                      placeholder={isRecording ? '说话中...' : '请详细描述您的回答...'}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = userAnswers[currentQuestionIndex]?.includes(idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleOptionToggle(idx)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? 'border-green-500 bg-green-500/10 text-white'
                              : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <span className="font-semibold mr-3">{String.fromCharCode(65 + idx)}.</span>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-6 py-3 rounded-lg font-semibold transition-all bg-red-600 hover:bg-red-700 text-white"
              >
                返回重新选择
              </button>
              
              <div className="flex gap-4">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-600 hover:bg-gray-500 text-white'
                  }`}
                >
                  上一题
                </button>

                <button
                  onClick={handleNextQuestion}
                  disabled={(() => {
                    const currentQ = quizQuestions[currentQuestionIndex];
                    if (currentQ?.type === 'scenario') {
                      // 主观题检查文字输入
                      const textAnswer = scenarioTextAnswers[currentQuestionIndex];
                      return !textAnswer || textAnswer.trim() === '';
                    } else {
                      // 选择题检查选项
                      return !userAnswers[currentQuestionIndex]?.length;
                    }
                  })()}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    (() => {
                      const currentQ = quizQuestions[currentQuestionIndex];
                      if (currentQ?.type === 'scenario') {
                        const textAnswer = scenarioTextAnswers[currentQuestionIndex];
                        return !textAnswer || textAnswer.trim() === '';
                      } else {
                        return !userAnswers[currentQuestionIndex]?.length;
                      }
                    })()
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {currentQuestionIndex === quizQuestions.length - 1 ? '提交试卷' : '下一题'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showResult && (
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <div>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">
                  {(() => {
                    const { earnedScore, totalScore } = calculateScore();
                    return earnedScore >= 60 ? '✅' : '❌';
                  })()}
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  {(() => {
                    const { earnedScore } = calculateScore();
                    return earnedScore >= 60 ? '测试通过！' : '测试未通过';
                  })()}
                </h2>
                <p className="text-3xl font-bold text-blue-400 mb-2">
                  {(() => {
                    const { earnedScore, totalScore } = calculateScore();
                    return `${earnedScore} / ${totalScore}`;
                  })()} 分
                </p>
                <p className="text-gray-400 mb-6">
                  {(() => {
                    const { earnedScore, totalScore, percentage } = calculateScore();
                    return `正确率: ${percentage.toFixed(1)}%`;
                  })()}
                  {(() => {
                    const { earnedScore } = calculateScore();
                    return earnedScore >= 60 
                      ? ' (≥60分 通过)' 
                      : ' (需要 ≥60分 才能通过)';
                  })()}
                </p>
              </div>

              {/* 显示所有题目和答案 */}
              <div className="text-left mb-6 bg-gray-900/50 p-4 rounded-lg max-h-[400px] overflow-y-auto">
                <h3 className="text-white font-semibold mb-3">答题详情：</h3>
                {quizQuestions.map((question, index) => {
                  const userAnswer = userAnswers[index] || [];
                  const correctAnswer = Array.isArray(question.correct) ? question.correct : [question.correct];
                  const isCorrect = question.type === 'scenario' ? true : 
                    (userAnswer.length === correctAnswer.length && userAnswer.every(a => correctAnswer.includes(a)));
                  
                  return (
                    <div key={index} className={`mb-4 p-3 rounded border ${
                      question.type === 'scenario' 
                        ? 'bg-cyan-500/10 border-cyan-500/30' 
                        : isCorrect 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm ${
                          question.type === 'scenario' ? 'text-cyan-400' : isCorrect ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {question.type === 'scenario' ? '📝' : isCorrect ? '✓' : '✗'} 第{index + 1}题
                        </span>
                        {question.type === 'scenario' && (
                          <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">
                            主观题(不记分)
                          </span>
                        )}
                        {question.type !== 'scenario' && (
                          <span className="text-gray-500 text-xs">{question.score}分</span>
                        )}
                        <span className="text-gray-500 text-xs">{question.categoryName}</span>
                      </div>
                      <p className="text-white mb-2">{question.question}</p>
                      {question.type === 'scenario' ? (
                        <p className="text-gray-400 text-sm">
                          您的回答: {scenarioTextAnswers[index] || '未作答'}
                        </p>
                      ) : (
                        <>
                          <p className="text-gray-400 text-sm">
                            您的答案: {userAnswer.length > 0 
                              ? userAnswer.map(i => `${String.fromCharCode(65 + i)}.${question.options[i]}`).join(', ')
                              : '未作答'}
                          </p>
                          <p className="text-green-400 text-sm">
                            正确答案: {correctAnswer.map(i => `${String.fromCharCode(65 + i)}.${question.options[i]}`).join(', ')}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-center">
                {(() => {
                  const { earnedScore } = calculateScore();
                  return earnedScore >= 60 ? (
                    <button
                      onClick={handleQuizComplete}
                      className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
                    >
                      填写申请表
                    </button>
                  ) : (
                    <button
                      onClick={resetQuiz}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                    >
                      重新答题
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">填写申请表</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Minecraft ID - 用于服务器白名单识别 */}
                <div>
                  <label className="block text-gray-300 mb-2">Minecraft ID <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="minecraftId"
                    value={formData.minecraftId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="您的游戏ID"
                  />
                  <p className="mt-1 text-xs text-gray-500">您的游戏ID，加入服务器白名单时使用</p>
                </div>

                {/* QQ号 - 用于绑定游戏ID，一人一号不可重复 */}
                <div>
                  <label className="block text-gray-300 mb-2">QQ号 <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                    min="10000"
                    max="99999999999"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="请输入QQ号"
                  />
                  <p className="mt-1 text-xs text-gray-500">绑定游戏账号，每位玩家仅限一个QQ号</p>
                </div>

                {/* 年龄 - 了解玩家年龄段 */}
                <div>
                  <label className="block text-gray-300 mb-2">年龄 <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="12"
                    max="80"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">帮助我们了解玩家群体年龄分布</p>
                </div>

                {/* 身份/职业 - 了解玩家背景 */}
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

                {/* 性别 - 服务器人口统计 */}
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

                {/* 游戏时长 - 了解玩家经验水平 */}
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
                    <option value="不到一年">不到一年</option>
                    <option value="1-3年">1-3年</option>
                    <option value="3-5年">3-5年</option>
                    <option value="5年以上">5年以上</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">您玩Minecraft的总时长</p>
                </div>

                {/* 游玩时段 - 了解玩家活跃时间 */}
                <div>
                  <label className="block text-gray-300 mb-2">游玩时段 <span className="text-red-500">*</span></label>
                  <select
                    name="playTimeSlot"
                    value={formData.playTimeSlot}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">请选择</option>
                    <option value="上午">上午</option>
                    <option value="下午">下午</option>
                    <option value="晚上">晚上</option>
                    <option value="凌晨">凌晨</option>
                    <option value="不固定">不固定</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">您通常的游戏时间段</p>
                </div>
              </div>

              {/* 如何知道我们 - 了解推广渠道 */}
              <div>
                <label className="block text-gray-300 mb-2">如何知道我们的 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="howFound"
                  value={formData.howFound}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="朋友推荐/论坛/视频等"
                />
                <p className="mt-1 text-xs text-gray-500">帮助我们了解服务器的推广效果</p>
              </div>

              {/* 擅长类型 - 根据选择题库自动生成 */}
              <div>
                <label className="block text-gray-300 mb-2">擅长类型</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['建筑', '生存', '指令', '生电', '附魔与酿造'].map((skill) => {
                    const isSelected = formData.skillType.includes(skill);
                    return (
                      <label key={skill} className="flex items-center space-x-2 p-3 bg-gray-900 border border-gray-700 rounded-lg">
                        <input
                          type="checkbox"
                          name="skillType"
                          value={skill}
                          checked={isSelected}
                          disabled
                          className="w-4 h-4 text-green-500 bg-gray-800 border-gray-600 rounded"
                        />
                        <span className={`text-sm ${isSelected ? 'text-green-400' : 'text-gray-400'}`}>{skill}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-1 text-sm text-gray-500">根据您选择的题库自动生成，无需手动选择。</p>
              </div>

              {/* 作品上传 - 如果选择了建筑或生电 */}
              {isSpecialCategory && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">存档文件 <span className="text-red-500">* 必填</span></label>
                    <p className="mb-3 text-xs text-gray-500">请上传您的存档文件</p>
                    <input
                      type="file"
                      accept=".zip,.rar,.7z,.world"
                      onChange={handleArchiveFileChange}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 file:cursor-pointer"
                    />
                    {archivePreviewUrl && (
                      <div className="mt-2 flex items-center gap-2 text-green-400">
                        <span>✓</span>
                        <span className="text-sm">{archivePreviewUrl}</span>
                        <button
                          type="button"
                          onClick={removeArchiveFile}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                        >
                          删除
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">照片 <span className="text-yellow-500">* 至少3张</span></label>
                    <p className="mb-3 text-xs text-gray-500">请上传您的建筑作品截图（至少3张）</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoFileChange}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                    />
                    {photoPreviewUrls.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {photoPreviewUrls.map((url, idx) => (
                          <div key={idx} className="relative bg-gray-900 rounded-lg border border-gray-700 p-2">
                            <img
                              src={url}
                              alt={`照片 ${idx + 1}`}
                              className="w-full h-32 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removePhotoFile(idx)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-gray-500">已上传 {photoFiles.length}/10 张照片</p>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">视频 <span className="text-gray-500">可选</span></label>
                    <p className="mb-3 text-xs text-gray-500">请上传您的作品视频（至少30秒）</p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                    />
                    {videoPreviewUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <video
                          src={videoPreviewUrl}
                          controls
                          className="w-full max-h-48 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeVideoFile}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                        >
                          删除
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 是否被ban - 了解玩家历史记录 */}
              <div>
                <label className="block text-gray-300 mb-2">是否被其他服务器ban过 <span className="text-red-500">*</span></label>
                <p className="mb-2 text-xs text-gray-500">请如实填写，不会影响审核结果</p>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="hasBeenBanned"
                      value="true"
                      checked={hasBeenBanned === true}
                      onChange={() => setHasBeenBanned(true)}
                      required
                      className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-300">是</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="hasBeenBanned"
                      value="false"
                      checked={hasBeenBanned === false}
                      onChange={() => setHasBeenBanned(false)}
                      required
                      className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-300">否</span>
                  </label>
                </div>
              </div>

              {hasBeenBanned && (
                <div>
                  <label className="block text-gray-300 mb-2">被ban过的服务器</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newBannedServer}
                      onChange={(e) => setNewBannedServer(e.target.value)}
                      className="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="输入服务器名称"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBannedServer())}
                    />
                    <button
                      type="button"
                      onClick={addBannedServer}
                      className="px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-all"
                    >
                      添加
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.bannedServers.map((server, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm flex items-center gap-2">
                        {server}
                        <button
                          type="button"
                          onClick={() => removeBannedServer(idx)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {submitMessage && (
                <div className={`p-4 rounded-lg ${
                  submitMessage.includes('成功') 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {submitMessage}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition-all"
                >
                  返回
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? '提交中...' : '提交申请'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    }>
      <ApplyPageContent />
    </Suspense>
  );
}