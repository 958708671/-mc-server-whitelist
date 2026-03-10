"use client";

import { useState, useEffect } from 'react';
import { questionCategories, serverRuleQuestions, Question, QuestionCategory } from '@/data/questions';

type SelectedCategories = Record<string, number>;

interface QuizQuestion extends Question {
  categoryId: string;
  categoryName: string;
}

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategories>({});
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number[]>>({});
  const [showResult, setShowResult] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  const [failedRequired, setFailedRequired] = useState(false);
  const [skipQuiz, setSkipQuiz] = useState(false);

  // 检查 URL 参数是否需要跳过答题
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const skipParam = urlParams.get('skipQuiz');
    if (skipParam === 'true') {
      setSkipQuiz(true);
      setCurrentStep(2); // 直接跳转到表单提交步骤
    }
  }, []);
  
  const [formData, setFormData] = useState({
    minecraftId: '',
    age: '',
    contact: '',
    gender: '',
    occupation: '',
    playTime: '',
    howFound: '',
    playTimeSlot: '',
    skillType: [] as string[],
    bannedHistory: '',
    bannedServers: [] as string[],
    agreeToRules: false
  });
  const [newBannedServer, setNewBannedServer] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // 验证函数
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'minecraftId':
        if (!value.trim()) return 'Minecraft ID不能为空';
        if (value.length < 3 || value.length > 16) return 'Minecraft ID长度应在3-16个字符之间';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Minecraft ID只能包含字母、数字和下划线';
        return '';
      case 'contact':
        if (!value.trim()) return 'QQ号不能为空';
        if (!/^\d{5,11}$/.test(value)) return '请输入有效的QQ号（5-11位数字）';
        return '';
      case 'age':
        if (!value) return '年龄不能为空';
        const ageNum = parseInt(value);
        if (isNaN(ageNum) || ageNum < 12 || ageNum > 80) return '年龄必须在12-80岁之间';
        return '';
      case 'occupation':
        if (!value.trim()) return '身份/学历不能为空';
        return '';
      case 'playTime':
        if (!value) return '游戏时长不能为空';
        const timeNum = parseInt(value);
        if (isNaN(timeNum) || timeNum < 0 || timeNum > 120) return '游戏时长必须在0-120个月之间';
        return '';
      case 'howFound':
        if (!value.trim()) return '此项不能为空';
        if (value.length < 2 || value.length > 50) return '长度应在2-50个字符之间';
        return '';
      default:
        return '';
    }
  };

  // 验证擅长类型（多选）
  const validateSkillType = (skills: string[]): string => {
    if (!skills || skills.length === 0) return '请至少选择一项擅长类型';
    return '';
  };

  // 实时验证
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // 添加被ban的服务器
  const addBannedServer = () => {
    if (newBannedServer.trim()) {
      setFormData(prev => ({
        ...prev,
        bannedServers: [...prev.bannedServers, newBannedServer.trim()]
      }));
      setNewBannedServer('');
    }
  };

  // 删除被ban的服务器
  const removeBannedServer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bannedServers: prev.bannedServers.filter((_, i) => i !== index)
    }));
  };

  // 处理键盘事件（按Enter添加服务器）
  const handleBannedServerKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBannedServer();
    }
  };

  const totalQuestions = 30;
  const singleChoiceCount = 20;
  const multipleChoiceCount = 10;
  const ruleQuestionCount = 5;

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newSelected = { ...prev };
      if (newSelected[categoryId]) {
        delete newSelected[categoryId];
      } else {
        newSelected[categoryId] = 1;
      }
      return newSelected;
    });
  };

  const handleWeightChange = (categoryId: string, weight: number) => {
    setSelectedCategories(prev => ({
      ...prev,
      [categoryId]: weight
    }));
  };

  const generateQuiz = () => {
    const categoryIds = Object.keys(selectedCategories);
    if (categoryIds.length === 0) return;
    if (categoryIds.length > 5) {
      alert('最多只能选择5个分类');
      return;
    }

    const selectedQuestions: QuizQuestion[] = [];

    // 步骤1: 确定各类型题目的数量
    const totalServerRuleQuestions = ruleQuestionCount; // 服务器规则题总数
    const totalCategorySingleQuestions = singleChoiceCount - totalServerRuleQuestions; // 分类单选题数量
    const totalCategoryMultipleQuestions = multipleChoiceCount; // 分类多选题数量

    // 步骤2: 抽取服务器规则题
    // 1道单选必答题 + 1道多选必答题 + 3道普通题
    const ruleSingleQuestions = serverRuleQuestions.filter(q => q.type === 'single');
    const ruleMultipleQuestions = serverRuleQuestions.filter(q => q.type === 'multiple');
    
    // 服务器规则必答题（单选）
    const ruleRequiredSingle = ruleSingleQuestions.filter(q => q.required);
    if (ruleRequiredSingle.length > 0) {
      const randomRuleSingle = ruleRequiredSingle[Math.floor(Math.random() * ruleRequiredSingle.length)];
      selectedQuestions.push({
        ...randomRuleSingle,
        categoryId: 'rules',
        categoryName: '服务器规则'
      });
    }
    
    // 服务器规则必答题（多选）
    const ruleRequiredMultiple = ruleMultipleQuestions.filter(q => q.required);
    if (ruleRequiredMultiple.length > 0) {
      const randomRuleMultiple = ruleRequiredMultiple[Math.floor(Math.random() * ruleRequiredMultiple.length)];
      selectedQuestions.push({
        ...randomRuleMultiple,
        categoryId: 'rules',
        categoryName: '服务器规则'
      });
    }
    
    // 服务器规则普通题
    const ruleNormalQuestions = serverRuleQuestions.filter(q => !q.required);
    const shuffledRuleNormal = [...ruleNormalQuestions].sort(() => Math.random() - 0.5);
    const pickedRuleNormal = shuffledRuleNormal.slice(0, totalServerRuleQuestions - 2);
    
    pickedRuleNormal.forEach(q => {
      selectedQuestions.push({
        ...q,
        categoryId: 'rules',
        categoryName: '服务器规则'
      });
    });

    // 步骤3: 计算每个分类的题目数量
    const totalWeight = Object.values(selectedCategories).reduce((a, b) => a + b, 0);
    const questionsPerCategory: Record<string, { single: number, multiple: number }> = {};
    
    categoryIds.forEach(id => {
      const weight = selectedCategories[id];
      const singleCount = Math.round((weight / totalWeight) * totalCategorySingleQuestions);
      const multipleCount = Math.round((weight / totalWeight) * totalCategoryMultipleQuestions);
      questionsPerCategory[id] = { single: singleCount, multiple: multipleCount };
    });

    // 调整题目数量，确保总数正确
    let totalSingleAssigned = Object.values(questionsPerCategory).reduce((a, b) => a + b.single, 0);
    let totalMultipleAssigned = Object.values(questionsPerCategory).reduce((a, b) => a + b.multiple, 0);
    
    const singleDiff = totalCategorySingleQuestions - totalSingleAssigned;
    const multipleDiff = totalCategoryMultipleQuestions - totalMultipleAssigned;
    
    if (singleDiff !== 0 && categoryIds.length > 0) {
      const firstId = categoryIds[0];
      questionsPerCategory[firstId].single = (questionsPerCategory[firstId].single || 0) + singleDiff;
    }
    
    if (multipleDiff !== 0 && categoryIds.length > 0) {
      const firstId = categoryIds[0];
      questionsPerCategory[firstId].multiple = (questionsPerCategory[firstId].multiple || 0) + multipleDiff;
    }

    // 步骤4: 抽取分类题目
    // 为每个分类抽取必答题
    categoryIds.forEach(categoryId => {
      const category = questionCategories.find(c => c.id === categoryId);
      if (!category) return;

      // 分类必答题（单选）
      const categoryRequiredSingle = category.questions.filter(q => q.type === 'single' && q.required);
      if (categoryRequiredSingle.length > 0) {
        const randomRequiredSingle = categoryRequiredSingle[Math.floor(Math.random() * categoryRequiredSingle.length)];
        selectedQuestions.push({
          ...randomRequiredSingle,
          categoryId: category.id,
          categoryName: category.name
        });
      }

      // 分类必答题（多选）
      const categoryRequiredMultiple = category.questions.filter(q => q.type === 'multiple' && q.required);
      if (categoryRequiredMultiple.length > 0) {
        const randomRequiredMultiple = categoryRequiredMultiple[Math.floor(Math.random() * categoryRequiredMultiple.length)];
        selectedQuestions.push({
          ...randomRequiredMultiple,
          categoryId: category.id,
          categoryName: category.name
        });
      }
    });

    // 为每个分类抽取普通单选题
    categoryIds.forEach(categoryId => {
      const category = questionCategories.find(c => c.id === categoryId);
      if (!category) return;

      const count = questionsPerCategory[categoryId].single;
      const categoryNormalSingle = category.questions.filter(q => q.type === 'single' && !q.required);
      const shuffledSingle = [...categoryNormalSingle].sort(() => Math.random() - 0.5);
      const pickedSingle = shuffledSingle.slice(0, count);
      
      pickedSingle.forEach(q => {
        selectedQuestions.push({
          ...q,
          categoryId: category.id,
          categoryName: category.name
        });
      });
    });

    // 为每个分类抽取普通多选题
    categoryIds.forEach(categoryId => {
      const category = questionCategories.find(c => c.id === categoryId);
      if (!category) return;

      const count = questionsPerCategory[categoryId].multiple;
      const categoryNormalMultiple = category.questions.filter(q => q.type === 'multiple' && !q.required);
      const shuffledMultiple = [...categoryNormalMultiple].sort(() => Math.random() - 0.5);
      const pickedMultiple = shuffledMultiple.slice(0, count);
      
      pickedMultiple.forEach(q => {
        selectedQuestions.push({
          ...q,
          categoryId: category.id,
          categoryName: category.name
        });
      });
    });

    // 步骤5: 确保题目数量为30道
    // 如果题目数量超过30，随机移除多余的题目
    while (selectedQuestions.length > totalQuestions) {
      const randomIndex = Math.floor(Math.random() * selectedQuestions.length);
      // 不要移除必答题
      if (!selectedQuestions[randomIndex].required) {
        selectedQuestions.splice(randomIndex, 1);
      }
    }

    // 如果题目数量不足30，随机添加普通题
    while (selectedQuestions.length < totalQuestions) {
      // 从所有分类的普通题中随机选择
      const allNormalQuestions: QuizQuestion[] = [];
      
      // 添加分类普通题
      categoryIds.forEach(categoryId => {
        const category = questionCategories.find(c => c.id === categoryId);
        if (!category) return;
        
        const normalQuestions = category.questions.filter(q => !q.required);
        normalQuestions.forEach(q => {
          // 确保不重复添加
          if (!selectedQuestions.some(sq => sq.id === q.id && sq.categoryId === categoryId)) {
            allNormalQuestions.push({
              ...q,
              categoryId: category.id,
              categoryName: category.name
            });
          }
        });
      });
      
      // 添加服务器规则普通题
      const ruleNormalQuestionsRemaining = serverRuleQuestions.filter(q => !q.required);
      ruleNormalQuestionsRemaining.forEach(q => {
        if (!selectedQuestions.some(sq => sq.id === q.id && sq.categoryId === 'rules')) {
          allNormalQuestions.push({
            ...q,
            categoryId: 'rules',
            categoryName: '服务器规则'
          });
        }
      });
      
      // 随机添加一道普通题
      if (allNormalQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * allNormalQuestions.length);
        selectedQuestions.push(allNormalQuestions[randomIndex]);
      } else {
        // 如果没有更多题目，停止循环
        break;
      }
    }

    // 步骤6: 随机排序题目
    const finalQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
    setQuizQuestions(finalQuestions);
    setCurrentStep(1);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResult(false);
    setShowQuestionNav(false);
    setFailedRequired(false);
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

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const correctAnswer = Array.isArray(currentQuestion.correct) ? currentQuestion.correct : [currentQuestion.correct];
    const isCorrect = currentAnswers.length === correctAnswer.length && 
                      currentAnswers.every(a => correctAnswer.includes(a));
    
    if (currentQuestion.required && !isCorrect) {
      setFailedRequired(true);
      setShowResult(true);
      return;
    }

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResult(true);
    }
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
    
    if (passRate >= 0.85) {
      setQuizPassed(true);
      setCurrentStep(2);
    } else {
      setShowResult(false);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    
    // 处理多选复选框（擅长类型）
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
    setIsError(false);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minecraft_id: formData.minecraftId,
          age: formData.age ? parseInt(formData.age) : null,
          contact: formData.contact,
          gender: formData.gender,
          occupation: formData.occupation,
          play_time: formData.playTime ? parseInt(formData.playTime) : 0,
          how_found: formData.howFound,
          play_time_slot: formData.playTimeSlot,
          skill_type: (formData.skillType as string[]).join(', '),
          banned_history: formData.bannedHistory,
          banned_servers: formData.bannedServers.join(', '),
          agree_to_rules: formData.agreeToRules,
          // 答题相关
          quiz_category: skipQuiz ? '管理员直接申请' : Object.keys(selectedCategories).map(id => {
            const cat = questionCategories.find(c => c.id === id);
            return cat?.name || id;
          }).join(', '),
          quiz_score: skipQuiz ? 30 : calculateScore(),
          quiz_total: skipQuiz ? 30 : quizQuestions.length
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSubmitMessage('申请已成功提交！管理员将在24小时内审核，审核结果将通过邮件通知您。');
        setFormData({ 
          minecraftId: '', 
          age: '', 
          contact: '', 
          gender: '',
          occupation: '',
          playTime: '',
          howFound: '',
          playTimeSlot: '',
          skillType: [],
          bannedHistory: '',
          bannedServers: [],
          agreeToRules: false
        });
        setNewBannedServer('');
        setCurrentStep(3);
      } else {
        setIsError(true);
        setSubmitMessage(result.message || '提交失败，请重试');
      }
    } catch (error) {
      setIsError(true);
      setSubmitMessage('提交失败，请检查网络后重试');
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
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const currentAnswers = userAnswers[currentQuestionIndex] || [];
  const answeredCount = Object.keys(userAnswers).filter(k => (userAnswers[parseInt(k)] || []).length > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-6">
      <div className="container mx-auto px-6 max-w-4xl">
        <a href="/" className="absolute top-4 left-6 inline-flex items-center text-green-400 hover:text-green-300 text-sm">
          ← 返回首页
        </a>

        <div className="text-center mb-6 mt-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">白名单申请</h1>
          <p className="text-base text-gray-300">
            请完成以下步骤申请加入我们的服务器
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 text-sm">
            {['选择题库', '答题测试', '填写申请表', '完成申请'].map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep >= index ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {currentStep > index ? '✓' : index + 1}
                </div>
                <span className={`ml-1 hidden md:block text-xs ${currentStep >= index ? 'text-white' : 'text-gray-500'}`}>
                  {step}
                </span>
                {index < 3 && (
                  <div className={`w-4 md:w-8 h-0.5 mx-1 ${currentStep > index ? 'bg-blue-600' : 'bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {currentStep === 0 && (
          <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">选择题库类型</h2>
            <p className="text-gray-400 text-center mb-4">
              请选择您擅长的领域（可多选），系统将按比例随机抽取题目。答题通过率需达到85%以上。
            </p>
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-8">
              <p className="text-red-300 text-sm text-center">
                <strong>⚠️ 重要提示：</strong>每个题库都包含必答题（单选和多选各至少1道），答错任意一道必答题将直接淘汰！
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {questionCategories.map((category) => {
                const isSelected = selectedCategories[category.id] !== undefined;
                return (
                  <div
                    key={category.id}
                    className={`border rounded-xl p-4 transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-900/30 border-blue-500' 
                        : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{category.icon}</span>
                      <div>
                        <h3 className="text-lg font-bold text-white">{category.name}</h3>
                        <p className="text-gray-500 text-xs">{category.questions.length}题</p>
                      </div>
                      <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-600'
                      }`}>
                        {isSelected && <span className="text-white text-sm">✓</span>}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">{category.description}</p>
                    
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <label className="text-gray-400 text-xs block mb-2">掌握程度</label>
                        <div className="flex gap-2">
                          {[
                            { value: 1, label: '了解', color: 'bg-gray-600' },
                            { value: 2, label: '熟练', color: 'bg-blue-600' },
                            { value: 3, label: '精通', color: 'bg-purple-600' }
                          ].map(level => (
                            <button
                              key={level.value}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWeightChange(category.id, level.value);
                              }}
                              className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-all ${
                                selectedCategories[category.id] === level.value
                                  ? `${level.color} text-white`
                                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                              }`}
                            >
                              {level.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-6">
              <p className="text-yellow-400 text-sm">
                <strong>提示：</strong>无论选择哪些题库，最后都会有关于服务器规则的必答题，请认真作答。
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-gray-400">
                已选择 <span className="text-blue-400 font-bold">{Object.keys(selectedCategories).length}</span> 个题库
                {Object.keys(selectedCategories).length > 0 && (
                  <span className="ml-2">
                    共 <span className="text-green-400 font-bold">{totalQuestions}</span> 题
                    <span className="text-gray-500 text-sm ml-1">(20单选+10多选)</span>
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
                开始答题 →
              </button>
            </div>
          </div>
        )}

        {currentStep === 1 && currentQuestion && !showResult && (
          <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {questionCategories.find(c => c.id === currentQuestion.categoryId)?.icon || '📋'}
                </span>
                <h2 className="text-xl font-bold">{currentQuestion.categoryName}</h2>
              </div>
              <div className="text-right">
                <span className="text-gray-400">
                  题目 {currentQuestionIndex + 1} / {quizQuestions.length}
                </span>
                <div className="text-xs text-gray-500">
                  已答 {answeredCount} / {quizQuestions.length}
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
              />
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                {currentQuestion.type === 'multiple' && (
                  <span className="bg-purple-600/30 text-purple-400 px-2 py-1 rounded text-xs">
                    多选题
                  </span>
                )}
                {currentQuestion.required && (
                  <span className="bg-red-600/30 text-red-400 px-2 py-1 rounded text-xs">
                    ⚠️ 必答题
                  </span>
                )}
                {currentQuestion.categoryId === 'rules' && (
                  <span className="bg-orange-600/30 text-orange-400 px-2 py-1 rounded text-xs">
                    服务器规则
                  </span>
                )}
              </div>
              
              <h3 className="text-xl text-white mb-6">
                {currentQuestion.question}
              </h3>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = currentAnswers.includes(index);
                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionToggle(index)}
                      className={`w-full text-left px-6 py-4 rounded-lg transition-all border ${
                        isSelected
                          ? 'bg-blue-900/30 border-blue-500 text-white'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      <span className={`mr-3 ${isSelected ? 'text-blue-400' : 'text-gray-500'}`}>
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span>{option}</span>
                      {isSelected && <span className="float-right text-blue-400">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-2 rounded-lg transition-all ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                ← 上一题
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowQuestionNav(!showQuestionNav)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2"
                >
                  <span>{currentQuestionIndex + 1} / {quizQuestions.length}</span>
                  <span className="text-gray-400">📋</span>
                </button>
                
                {showQuestionNav && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-xl z-10 min-w-[280px]">
                    <div className="text-gray-400 text-xs mb-2 text-center">点击题号跳转</div>
                    <div className="grid grid-cols-5 gap-2">
                      {quizQuestions.map((_, index) => {
                        const hasAnswer = (userAnswers[index] || []).length > 0;
                        const isCurrent = index === currentQuestionIndex;
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              setCurrentQuestionIndex(index);
                              setShowQuestionNav(false);
                            }}
                            className={`w-10 h-10 rounded text-sm font-medium transition-all ${
                              isCurrent
                                ? 'bg-blue-600 text-white'
                                : hasAnswer
                                  ? 'bg-green-600/30 text-green-400 border border-green-600/50'
                                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-700 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-blue-600 rounded"></span>
                        <span className="text-gray-400">当前</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-green-600/30 border border-green-600/50 rounded"></span>
                        <span className="text-gray-400">已答</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-gray-800 rounded"></span>
                        <span className="text-gray-400">未答</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {currentQuestionIndex < quizQuestions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  disabled={currentAnswers.length === 0}
                  className={`px-6 py-2 rounded-lg transition-all ${
                    currentAnswers.length === 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  下一题 →
                </button>
              ) : (
                <button
                  onClick={() => setShowResult(true)}
                  disabled={currentAnswers.length === 0}
                  className={`px-6 py-2 rounded-lg transition-all ${
                    currentAnswers.length === 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  提交答卷
                </button>
              )}
            </div>
          </div>
        )}

        {currentStep === 1 && showResult && (
          <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <div className="text-center py-8">
              {failedRequired ? (
                <>
                  <div className="text-6xl mb-6 text-red-500">❌</div>
                  <h3 className="text-2xl font-bold mb-4 text-red-400">必答题错误！</h3>
                  <p className="text-gray-400 mb-6">
                    你答错了一道必答题，测试未通过。
                  </p>
                  <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                    <p className="text-red-300 text-sm">
                      必答题是测试的核心内容，答错任意一道必答题将直接淘汰。请认真复习后重新尝试。
                    </p>
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        setShowResult(false);
                        setCurrentQuestionIndex(0);
                        setUserAnswers({});
                        setFailedRequired(false);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
                    >
                      重新答题
                    </button>
                    <button
                      onClick={resetQuiz}
                      className="block mx-auto text-gray-400 hover:text-white text-sm mt-4"
                    >
                      重新选择题库
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={`text-6xl mb-6 ${calculateScore() / quizQuestions.length >= 0.85 ? 'text-green-500' : 'text-red-500'}`}>
                    {calculateScore() / quizQuestions.length >= 0.85 ? '🎉' : '😢'}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    {calculateScore() / quizQuestions.length >= 0.85 ? '恭喜通过！' : '未通过测试'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    你答对了 <span className="text-green-400 font-bold">{calculateScore()}</span> / {quizQuestions.length} 道题目
                    （<span className={`font-bold ${calculateScore() / quizQuestions.length >= 0.85 ? 'text-green-400' : 'text-red-400'}`}>
                      {Math.round(calculateScore() / quizQuestions.length * 100)}%
                    </span>）
                  </p>

                  <div className="bg-gray-900/50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                    <h4 className="text-gray-400 text-sm mb-2">答题详情</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.keys(selectedCategories).map(id => {
                        const cat = questionCategories.find(c => c.id === id);
                        if (!cat) return null;
                        const catQuestions = quizQuestions.filter(q => q.categoryId === id);
                        const catCorrect = catQuestions.filter((q, i) => {
                          const globalIndex = quizQuestions.findIndex(qu => qu.id === q.id && qu.categoryId === q.categoryId);
                          const userAnswer = userAnswers[globalIndex] || [];
                          const correctAnswer = Array.isArray(q.correct) ? q.correct : [q.correct];
                          return userAnswer.length === correctAnswer.length && 
                                 userAnswer.every(a => correctAnswer.includes(a));
                        }).length;
                        return (
                          <div key={id} className="flex justify-between">
                            <span className="text-gray-500">{cat.name}:</span>
                            <span className={catCorrect >= catQuestions.length * 0.85 ? 'text-green-400' : 'text-red-400'}>
                              {catCorrect}/{catQuestions.length}
                            </span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between">
                        <span className="text-gray-500">服务器规则:</span>
                        <span className="text-blue-400">
                          {quizQuestions.filter(q => q.categoryId === 'rules').filter((q) => {
                            const idx = quizQuestions.findIndex(qu => qu.id === q.id);
                            const userAnswer = userAnswers[idx] || [];
                            const correctAnswer = Array.isArray(q.correct) ? q.correct : [q.correct];
                            return userAnswer.length === correctAnswer.length && 
                                   userAnswer.every(a => correctAnswer.includes(a));
                          }).length}/{quizQuestions.filter(q => q.categoryId === 'rules').length}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {calculateScore() / quizQuestions.length >= 0.85 ? (
                    <button
                      onClick={handleQuizComplete}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
                    >
                      继续申请
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-500 text-sm">需要答对85%以上才能通过，请重新尝试</p>
                      <button
                        onClick={() => {
                          setShowResult(false);
                          setCurrentQuestionIndex(0);
                          setUserAnswers({});
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
                      >
                        重新答题
                      </button>
                      <button
                        onClick={resetQuiz}
                        className="block mx-auto text-gray-400 hover:text-white text-sm mt-4"
                      >
                        重新选择题库
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 基本信息 */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 rounded-xl p-4 hover:border-green-500/50 transition-all duration-300 shadow-lg shadow-black/20 relative overflow-hidden">
                {/* 装饰角标 */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-500/20 to-transparent"></div>
                <div className="absolute -top-10 -right-10 text-4xl opacity-10 rotate-12">👤</div>
                
                <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-green-500/20 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">基本信息</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label htmlFor="minecraftId" className="block text-base font-medium text-gray-300 flex items-center gap-2">
                      <span className="text-xl">🎮</span>
                      您的 Minecraft 游戏ID (正版ID) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="minecraftId"
                        name="minecraftId"
                        value={formData.minecraftId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        minLength={3}
                        maxLength={16}
                        pattern="^[a-zA-Z0-9_]+$"
                        className={`w-full pl-12 pr-4 py-3 bg-gray-900 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition all duration-300 hover:border-gray-600 ${errors.minecraftId ? 'border-red-500' : 'border-gray-700'}`}
                        placeholder="请输入您的正版游戏ID，例如: Steve_2024"
                      />
                    </div>
                    {errors.minecraftId ? (
                      <p className="mt-1 text-sm text-red-400">{errors.minecraftId}</p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">请确保ID准确无误，这是您加入服务器的唯一身份标识。</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <label htmlFor="contact" className="block text-base font-medium text-gray-300 flex items-center gap-2">
                      <span className="text-xl">💬</span>
                      QQ号 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="contact"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        pattern="^\d{5,11}$"
                        maxLength={11}
                        className={`w-full pl-12 pr-4 py-3 bg-gray-900 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition all duration-300 hover:border-gray-600 ${errors.contact ? 'border-red-500' : 'border-gray-700'}`}
                        placeholder="请输入您的QQ号，例如: 123456789"
                      />
                    </div>
                    {errors.contact ? (
                      <p className="mt-1 text-sm text-red-400">{errors.contact}</p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">审核结果将通过此方式通知您，请务必填写准确的QQ号。</p>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label htmlFor="age" className="block text-base font-medium text-gray-300 flex items-center gap-2">
                        <span className="text-xl">🎂</span>
                        您的年龄 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="number"
                          id="age"
                          name="age"
                          value={formData.age}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                          min="12"
                          max="80"
                          className={`w-full pl-12 pr-4 py-3 bg-gray-900 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition all duration-300 hover:border-gray-600 ${errors.age ? 'border-red-500' : 'border-gray-700'}`}
                          placeholder="请输入您的年龄，例如: 18"
                        />
                      </div>
                      {errors.age ? (
                        <p className="mt-1 text-sm text-red-400">{errors.age}</p>
                      ) : (
                        <p className="mt-1 text-sm text-gray-500">我们建议玩家年龄在16岁以上，以确保良好的交流氛围。</p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <label htmlFor="gender" className="block text-base font-medium text-gray-300 flex items-center gap-2">
                        <span className="text-xl">⚧️</span>
                        性别 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4a4 4 0 100 8 4 4 0 000-8z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7m-3-3h6" />
                          </svg>
                        </div>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-10 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition all duration-300 hover:border-gray-600 appearance-none"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        >
                          <option value="">请选择</option>
                          <option value="男">男 ♂</option>
                          <option value="女">女 ♀</option>
                        </select>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">请填写生理性别，不是心理性别。</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label htmlFor="occupation" className="block text-base font-medium text-gray-300 flex items-center gap-2">
                      <span className="text-xl">🎓</span>
                      身份/学历 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                      </div>
                      <select
                        id="occupation"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        required
                        className={`w-full pl-12 pr-10 py-3 bg-gray-900 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition all duration-300 hover:border-gray-600 appearance-none ${errors.occupation ? 'border-red-500' : 'border-gray-700'}`}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                      >
                      <option value="">请选择</option>
                      <option value="小学">小学</option>
                      <option value="初中">初中</option>
                      <option value="高中">高中</option>
                      <option value="中专/技校">中专/技校</option>
                      <option value="大专">大专</option>
                      <option value="本科">本科</option>
                      <option value="研究生及以上">研究生及以上</option>
                      <option value="已工作">已工作</option>
                      </select>
                    </div>
                    {errors.occupation ? (
                      <p className="mt-1 text-sm text-red-400">{errors.occupation}</p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">帮助我们了解您的背景，更好地组织社区活动。</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <label htmlFor="playTime" className="block text-base font-medium text-gray-300 flex items-center gap-2">
                      <span className="text-xl">⏱️</span>
                      游玩我的世界时长（月） <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        id="playTime"
                        name="playTime"
                        value={formData.playTime}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        min="0"
                        max="120"
                        className={`w-full pl-12 pr-4 py-3 bg-gray-900 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition all duration-300 hover:border-gray-600 ${errors.playTime ? 'border-red-500' : 'border-gray-700'}`}
                        placeholder="例如: 24"
                      />
                    </div>
                    {errors.playTime ? (
                      <p className="mt-1 text-sm text-red-400">{errors.playTime}</p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">帮助我们了解您的游戏经验，更好地匹配游戏伙伴。</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-base font-medium text-gray-300 flex items-center gap-2">
                      <span className="text-xl">🎯</span>
                      擅长类型 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['生存建造', '红石科技', 'PVP战斗', '探索冒险', '创意设计', '其他'].map((skill) => (
                        <label key={skill} className="flex items-center space-x-2 p-3 bg-gray-900 border border-gray-700 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                          <input
                            type="checkbox"
                            name="skillType"
                            value={skill}
                            checked={(formData.skillType as string[]).includes(skill)}
                            onChange={handleChange}
                            className="w-4 h-4 text-green-500 bg-gray-800 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                          />
                          <span className="text-gray-300 text-sm">{skill}</span>
                        </label>
                      ))}
                    </div>
                    {(formData.skillType as string[]).length === 0 && errors.skillType && (
                      <p className="mt-1 text-sm text-red-400">请至少选择一项擅长类型</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">帮助我们了解您的游戏风格，更好地组织团队活动。（可多选）</p>
                  </div>
                  
                  <div className="space-y-3">
                    <label htmlFor="playTimeSlot" className="block text-base font-medium text-gray-300 flex items-center gap-2">
                      <span className="text-xl">🌅</span>
                      一天中游玩时段 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <select
                        id="playTimeSlot"
                        name="playTimeSlot"
                        value={formData.playTimeSlot}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-10 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition all duration-300 hover:border-gray-600 appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                      >
                      <option value="">请选择</option>
                      <option value="上午">上午</option>
                      <option value="下午">下午</option>
                      <option value="晚上">晚上</option>
                      <option value="凌晨">凌晨</option>
                      <option value="不固定">不固定</option>
                      </select>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">帮助我们了解您的活跃时间，更好地安排服务器活动。</p>
                  </div>
                  
                  <div className="space-y-3">
                    <label htmlFor="howFound" className="block text-base font-medium text-gray-300 flex items-center gap-2">
                      <span className="text-xl">🔍</span>
                      从哪里知道我们的 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="howFound"
                        name="howFound"
                        value={formData.howFound}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        minLength={2}
                        maxLength={50}
                        className={`w-full pl-12 pr-4 py-3 bg-gray-900 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition all duration-300 hover:border-gray-600 ${errors.howFound ? 'border-red-500' : 'border-gray-700'}`}
                        placeholder="例如: 朋友推荐、论坛、视频网站等"
                      />
                    </div>
                    {errors.howFound ? (
                      <p className="mt-1 text-sm text-red-400">{errors.howFound}</p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">帮助我们了解推广渠道，更好地优化宣传策略。</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <label htmlFor="bannedHistory" className="block text-base font-medium text-gray-300 flex items-center gap-2">
                      <span className="text-xl">⚠️</span>
                      是否被其他服务器ban过 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <select
                        id="bannedHistory"
                        name="bannedHistory"
                        value={formData.bannedHistory}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-10 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition all duration-300 hover:border-gray-600 appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                      >
                      <option value="">请选择</option>
                      <option value="是">是</option>
                      <option value="否">否</option>
                      </select>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">帮助我们了解您的游戏历史，确保良好的社区环境。</p>
                    
                    {formData.bannedHistory === '是' && (
                      <div className="mt-4 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                        <label className="block text-md font-medium text-gray-300 mb-2">
                          请填写被ban的服务器名称
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newBannedServer}
                            onChange={(e) => setNewBannedServer(e.target.value)}
                            onKeyPress={handleBannedServerKeyPress}
                            placeholder="输入服务器名称"
                            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-white"
                          />
                          <button
                            type="button"
                            onClick={addBannedServer}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            添加
                          </button>
                        </div>
                        
                        {formData.bannedServers.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {formData.bannedServers.map((server, index) => (
                              <div key={index} className="flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-full text-sm">
                                <span className="text-gray-200">{server}</span>
                                <button
                                  type="button"
                                  onClick={() => removeBannedServer(index)}
                                  className="text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="mt-2 text-xs text-gray-500">按Enter或点击添加按钮添加服务器，点击×删除</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="agreeToRules"
                        name="agreeToRules"
                        checked={formData.agreeToRules}
                        onChange={handleChange}
                        required
                        className="mt-1"
                      />
                      <label htmlFor="agreeToRules" className="text-gray-300">
                        我已阅读并同意遵守服务器的所有规则，包括但不限于：不破坏他人建筑、不使用作弊软件、保持文明交流等。如有违反，愿意接受服务器的相应处罚。 <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>









              {/* 提交按钮 */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold py-4 px-6 rounded-lg transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/20 transform hover:-translate-y-1"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      提交中...
                    </>
                  ) : (
                    '提交白名单申请'
                  )}
                </button>
              </div>
              
              {/* 提交消息 */}
              {submitMessage && (
                <div className={`mt-6 p-4 rounded-lg ${isError ? 'bg-red-900/30 border border-red-700 text-red-300' : 'bg-green-900/30 border border-green-700 text-green-300'} shadow-md animate-fadeIn`}>
                  <p>{submitMessage}</p>
                </div>
              )}
              
              {/* 底部说明 */}
              <div className="mt-6 text-center text-gray-500 text-sm">
                <p>点击提交即表示您已阅读并同意遵守服务器规则。如有疑问，请通过首页底部的联系方式咨询。</p>
              </div>
            </form>
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold mb-4">申请已提交！</h2>
            <p className="text-gray-400 mb-8">
              您的白名单申请已成功提交，管理员将在24小时内审核。
              <br />
              审核结果将通过邮件发送到您填写的QQ邮箱。
            </p>
            
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-blue-300 mb-4">接下来会发生什么？</h3>
              <div className="text-left space-y-3 text-gray-300">
                <p>1. 管理员会审核您的申请信息</p>
                <p>2. 如果通过，您将收到一封包含以下内容的邮件：</p>
                <ul className="list-disc list-inside ml-4 text-gray-400">
                  <li>服务器QQ群号</li>
                  <li>客户端整合包下载链接</li>
                  <li>服务器IP地址获取方式</li>
                </ul>
                <p>3. 加入QQ群后即可开始游戏</p>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <a
                href="/"
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
              >
                返回首页
              </a>
              <button
                onClick={resetQuiz}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
              >
                再次申请
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
