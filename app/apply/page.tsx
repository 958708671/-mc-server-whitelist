'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { questionCategories, serverRuleQuestions } from '@/data/questions';
import type { Question, QuestionCategory } from '@/data/questions';

interface QuizQuestion extends Question {
  categoryId: string;
  categoryName: string;
}

export default function ApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const skipQuiz = searchParams.get('skipQuiz') === 'true';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<Record<string, number>>({});
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
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
  
  const [formData, setFormData] = useState({
    minecraftId: '',
    contact: '',
    age: '',
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
      // 自动填写擅长类型为所有选项
      setFormData(prev => ({
        ...prev,
        skillType: ['建筑', '生存', '养老', '红石', '指令', 'PVP战斗', '探险', '下界', '末地', '酿造', '附魔', '钓鱼', '交易', '农业与养殖', '矿物与挖矿']
      }));
    }
  }, [skipQuiz]);

  // 固定题目数量
  const TOTAL_QUESTIONS = 30;
  const SINGLE_CHOICE_COUNT = 15;
  const MULTIPLE_CHOICE_COUNT = 10;
  const JUDGMENT_COUNT = 5;
  const REQUIRED_QUESTIONS_COUNT = 5;

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

  const generateQuiz = () => {
    const categoryIds = Object.keys(selectedCategories);
    if (categoryIds.length === 0) return;
    if (categoryIds.length > 5) {
      alert('最多只能选择5个分类');
      return;
    }

    // 收集所有可用题目
    const allSingleQuestions: QuizQuestion[] = [];
    const allMultipleQuestions: QuizQuestion[] = [];
    const allJudgmentQuestions: QuizQuestion[] = [];

    // 从服务器规则中添加题目
    serverRuleQuestions.forEach(q => {
      const quizQ: QuizQuestion = {
        ...q,
        categoryId: 'rules',
        categoryName: '服务器规则'
      };
      if (q.type === 'single') allSingleQuestions.push(quizQ);
      else if (q.type === 'multiple') allMultipleQuestions.push(quizQ);
      else if (q.type === 'judgment') allJudgmentQuestions.push(quizQ);
    });

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
      });
    });

    // 随机选择必选题（每类1-2道，共5道）
    const selectedQuestions: QuizQuestion[] = [];
    const requiredQuestionIds: Set<string> = new Set();

    // 单选必选题：1-2道
    const singleRequiredCount = Math.floor(Math.random() * 2) + 1;
    const shuffledSingle = [...allSingleQuestions].sort(() => Math.random() - 0.5);
    for (let i = 0; i < singleRequiredCount && i < shuffledSingle.length; i++) {
      const q = { ...shuffledSingle[i], required: true };
      selectedQuestions.push(q);
      requiredQuestionIds.add(`${q.categoryId}-${q.id}`);
    }

    // 多选必选题：1-2道
    const multipleRequiredCount = Math.floor(Math.random() * 2) + 1;
    const shuffledMultiple = [...allMultipleQuestions].sort(() => Math.random() - 0.5);
    let multipleRequiredAdded = 0;
    for (const q of shuffledMultiple) {
      if (multipleRequiredAdded >= multipleRequiredCount) break;
      const key = `${q.categoryId}-${q.id}`;
      if (!requiredQuestionIds.has(key)) {
        selectedQuestions.push({ ...q, required: true });
        requiredQuestionIds.add(key);
        multipleRequiredAdded++;
      }
    }

    // 判断必选题：1-2道（确保总共5道）
    const judgmentRequiredCount = REQUIRED_QUESTIONS_COUNT - singleRequiredCount - multipleRequiredCount;
    const shuffledJudgment = [...allJudgmentQuestions].sort(() => Math.random() - 0.5);
    let judgmentRequiredAdded = 0;
    for (const q of shuffledJudgment) {
      if (judgmentRequiredAdded >= judgmentRequiredCount) break;
      const key = `${q.categoryId}-${q.id}`;
      if (!requiredQuestionIds.has(key)) {
        selectedQuestions.push({ ...q, required: true });
        requiredQuestionIds.add(key);
        judgmentRequiredAdded++;
      }
    }

    // 补充普通题目到指定数量
    const remainingSingle = SINGLE_CHOICE_COUNT - singleRequiredCount;
    const remainingMultiple = MULTIPLE_CHOICE_COUNT - multipleRequiredCount;
    const remainingJudgment = JUDGMENT_COUNT - judgmentRequiredCount;

    // 添加单选题
    const normalSingle = shuffledSingle.filter(q => !requiredQuestionIds.has(`${q.categoryId}-${q.id}`));
    for (let i = 0; i < remainingSingle && i < normalSingle.length; i++) {
      selectedQuestions.push({ ...normalSingle[i], required: false });
    }

    // 添加多选题
    const normalMultiple = shuffledMultiple.filter(q => !requiredQuestionIds.has(`${q.categoryId}-${q.id}`));
    for (let i = 0; i < remainingMultiple && i < normalMultiple.length; i++) {
      selectedQuestions.push({ ...normalMultiple[i], required: false });
    }

    // 添加判断题
    const normalJudgment = shuffledJudgment.filter(q => !requiredQuestionIds.has(`${q.categoryId}-${q.id}`));
    for (let i = 0; i < remainingJudgment && i < normalJudgment.length; i++) {
      selectedQuestions.push({ ...normalJudgment[i], required: false });
    }

    // 按题型分类并打乱顺序
    const singleQuestions = selectedQuestions.filter(q => q.type === 'single').sort(() => Math.random() - 0.5);
    const multipleQuestions = selectedQuestions.filter(q => q.type === 'multiple').sort(() => Math.random() - 0.5);
    const judgmentQuestions = selectedQuestions.filter(q => q.type === 'judgment').sort(() => Math.random() - 0.5);

    // 最终题目顺序：单选 -> 多选 -> 判断
    const finalQuestions = [
      ...singleQuestions.slice(0, SINGLE_CHOICE_COUNT),
      ...multipleQuestions.slice(0, MULTIPLE_CHOICE_COUNT),
      ...judgmentQuestions.slice(0, JUDGMENT_COUNT)
    ];

    setQuizQuestions(finalQuestions);
    setCurrentStep(1);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResult(false);
    setShowQuestionNav(false);
    setFailedRequired(false);
    setShowAnswers(false);
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
    if (currentAnswers.length === 0) return;

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // 所有题目答完，显示结果
      checkAllAnswers();
    }
  };

  const checkAllAnswers = () => {
    let wrongRequiredCount = 0;
    let correctCount = 0;

    quizQuestions.forEach((question, index) => {
      const userAnswer = userAnswers[index] || [];
      const correctAnswer = Array.isArray(question.correct) ? question.correct : [question.correct];
      const isCorrect = userAnswer.length === correctAnswer.length && 
                        userAnswer.every(a => correctAnswer.includes(a));
      
      if (isCorrect) {
        correctCount++;
      } else if (question.required) {
        wrongRequiredCount++;
      }
    });

    // 必选题答错则考试不通过
    if (wrongRequiredCount > 0) {
      setFailedRequired(true);
    }

    setShowResult(true);
    setShowAnswers(true);
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach((question, index) => {
      const userAnswer = userAnswers[index] || [];
      const correctAnswer = Array.isArray(question.correct) ? question.correct : [question.correct];
      
      if (userAnswer.length === correctAnswer.length && 
          userAnswer.every(a => correctAnswer.includes(a))) {
        correct++;
      }
    });
    return correct;
  };

  const handleQuizComplete = () => {
    const score = calculateScore();
    const total = quizQuestions.length;
    const passRate = score / total;
    
    if (passRate >= 0.85 && !failedRequired) {
      const selectedCategoryIds = Object.keys(selectedCategories);
      const uniqueSkillTypes = generateSkillTypes(selectedCategoryIds);
      
      setFormData(prev => ({
        ...prev,
        skillType: uniqueSkillTypes
      }));
      
      setQuizPassed(true);
      setCurrentStep(2);
    } else {
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
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/whitelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minecraft_id: formData.minecraftId,
          contact: formData.contact,
          age: parseInt(formData.age),
          occupation: formData.occupation,
          play_time: parseInt(formData.playTime),
          play_time_slot: formData.playTimeSlot,
          how_found: formData.howFound,
          skill_types: formData.skillType,
          banned_servers: formData.bannedServers,
          quiz_score: calculateScore(),
          quiz_total: quizQuestions.length
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage('申请提交成功！请等待管理员审核。');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setSubmitMessage(data.message || '提交失败，请重试。');
      }
    } catch (error) {
      setSubmitMessage('网络错误，请检查连接后重试。');
    } finally {
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

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = quizQuestions.length > 0 ? ((currentQuestionIndex + 1) / quizQuestions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">白名单申请</h1>
          <p className="text-gray-400">完成答题测试，申请加入服务器</p>
        </div>

        {currentStep === 0 && (
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">选择题库类型</h2>
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
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h3 className="font-semibold text-white">{category.name}</h3>
                        <p className="text-sm text-gray-400">{category.description}</p>
                      </div>
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
              <span className="text-gray-400">
                已选择 {Object.keys(selectedCategories).length}/5 个分类
              </span>
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
                        : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {currentQuestion.type === 'single' 
                      ? '单选题' 
                      : currentQuestion.type === 'multiple'
                        ? '多选题'
                        : '判断题'}
                  </span>
                  {currentQuestion.required && (
                    <span className="px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-400">
                      必答题
                    </span>
                  )}
                  <span className="text-gray-500 text-sm">{currentQuestion.categoryName}</span>
                </div>

                <h3 className="text-xl text-white mb-6">{currentQuestion.question}</h3>

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
              </div>
            )}

            <div className="flex justify-between">
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
                disabled={!userAnswers[currentQuestionIndex]?.length}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  !userAnswers[currentQuestionIndex]?.length
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {currentQuestionIndex === quizQuestions.length - 1 ? '提交试卷' : '下一题'}
              </button>
            </div>
          </div>
        )}

        {showResult && (
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            {failedRequired ? (
              <div className="text-center">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-red-400 mb-4">必答题答错</h2>
                <p className="text-gray-400 mb-6">您没有答对必答题，考试不通过，请重新答题。</p>
                <div className="text-left mb-6 bg-gray-900/50 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-3">错题回顾：</h3>
                  {quizQuestions.map((question, index) => {
                    const userAnswer = userAnswers[index] || [];
                    const correctAnswer = Array.isArray(question.correct) ? question.correct : [question.correct];
                    const isCorrect = userAnswer.length === correctAnswer.length && 
                                      userAnswer.every(a => correctAnswer.includes(a));
                    
                    if (question.required && !isCorrect) {
                      return (
                        <div key={index} className="mb-4 p-3 bg-red-500/10 rounded border border-red-500/30">
                          <p className="text-red-400 font-semibold mb-2">必答题 {index + 1} (答错)</p>
                          <p className="text-white mb-2">{question.question}</p>
                          <p className="text-gray-400 text-sm">
                            正确答案: {correctAnswer.map(i => `${String.fromCharCode(65 + i)}.${question.options[i]}`).join(', ')}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={resetQuiz}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                >
                  重新答题
                </button>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">
                    {calculateScore() / quizQuestions.length >= 0.85 ? '✅' : '❌'}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {calculateScore() / quizQuestions.length >= 0.85 ? '测试通过！' : '测试未通过'}
                  </h2>
                  <p className="text-3xl font-bold text-blue-400 mb-2">
                    {calculateScore()} / {quizQuestions.length}
                  </p>
                  <p className="text-gray-400 mb-6">
                    正确率: {((calculateScore() / quizQuestions.length) * 100).toFixed(1)}%
                    {calculateScore() / quizQuestions.length >= 0.85 
                      ? ' (≥85% 通过)' 
                      : ' (需要 ≥85% 才能通过)'}
                  </p>
                </div>

                {/* 显示所有题目和答案 */}
                <div className="text-left mb-6 bg-gray-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <h3 className="text-white font-semibold mb-3">答题详情：</h3>
                  {quizQuestions.map((question, index) => {
                    const userAnswer = userAnswers[index] || [];
                    const correctAnswer = Array.isArray(question.correct) ? question.correct : [question.correct];
                    const isCorrect = userAnswer.length === correctAnswer.length && 
                                      userAnswer.every(a => correctAnswer.includes(a));
                    
                    return (
                      <div key={index} className={`mb-4 p-3 rounded border ${
                        isCorrect 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? '✓' : '✗'} 第{index + 1}题
                          </span>
                          {question.required && (
                            <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">
                              必答
                            </span>
                          )}
                          <span className="text-gray-500 text-xs">{question.categoryName}</span>
                        </div>
                        <p className="text-white mb-2">{question.question}</p>
                        <p className="text-gray-400 text-sm">
                          您的答案: {userAnswer.length > 0 
                            ? userAnswer.map(i => `${String.fromCharCode(65 + i)}.${question.options[i]}`).join(', ')
                            : '未作答'}
                        </p>
                        <p className="text-green-400 text-sm">
                          正确答案: {correctAnswer.map(i => `${String.fromCharCode(65 + i)}.${question.options[i]}`).join(', ')}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center">
                  {calculateScore() / quizQuestions.length >= 0.85 ? (
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
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">填写申请表</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">Minecraft ID *</label>
                  <input
                    type="text"
                    name="minecraftId"
                    value={formData.minecraftId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="您的游戏ID"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">QQ号 *</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="用于联系"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">年龄 *</label>
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
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">身份/职业 *</label>
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
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">游戏时长(月) *</label>
                  <input
                    type="number"
                    name="playTime"
                    value={formData.playTime}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">游玩时段 *</label>
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
                </div>
              </div>

              <div>
                  <label className="block text-gray-300 mb-2">如何知道我们的 *</label>
                  <input
                    type="text"
                    name="howFound"
                    value={formData.howFound}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="朋友推荐/论坛/视频等"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">擅长类型</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['建筑', '生存', '养老', '红石', '指令', 'PVP战斗', '探险', '下界', '末地', '酿造', '附魔', '钓鱼', '交易', '农业与养殖', '矿物与挖矿'].map((skill) => {
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

              <div>
                <label className="block text-gray-300 mb-2">是否被其他服务器ban过 *</label>
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
                  onClick={() => setCurrentStep(1)}
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