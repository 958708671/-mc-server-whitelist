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
  
  const [formData, setFormData] = useState({
    minecraftId: '',
    age: '',
    contact: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isError, setIsError] = useState(false);

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

    const totalWeight = Object.values(selectedCategories).reduce((a, b) => a + b, 0);
    const questionsPerCategory: Record<string, { single: number, multiple: number }> = {};
    
    categoryIds.forEach(id => {
      const weight = selectedCategories[id];
      const singleCount = Math.round((weight / totalWeight) * (singleChoiceCount - ruleQuestionCount));
      const multipleCount = Math.round((weight / totalWeight) * multipleChoiceCount);
      questionsPerCategory[id] = { single: singleCount, multiple: multipleCount };
    });

    let totalSingleAssigned = Object.values(questionsPerCategory).reduce((a, b) => a + b.single, 0);
    let totalMultipleAssigned = Object.values(questionsPerCategory).reduce((a, b) => a + b.multiple, 0);
    
    const singleDiff = (singleChoiceCount - ruleQuestionCount) - totalSingleAssigned;
    const multipleDiff = multipleChoiceCount - totalMultipleAssigned;
    
    if (singleDiff !== 0 && categoryIds.length > 0) {
      const firstId = categoryIds[0];
      questionsPerCategory[firstId].single = (questionsPerCategory[firstId].single || 0) + singleDiff;
    }
    
    if (multipleDiff !== 0 && categoryIds.length > 0) {
      const firstId = categoryIds[0];
      questionsPerCategory[firstId].multiple = (questionsPerCategory[firstId].multiple || 0) + multipleDiff;
    }

    const selectedQuestions: QuizQuestion[] = [];

    // 为每个分类随机选择一道必答题（单选）
    categoryIds.forEach(categoryId => {
      const category = questionCategories.find(c => c.id === categoryId);
      if (!category) return;

      const singleQuestions = category.questions.filter(q => q.type === 'single');
      const requiredSingle = singleQuestions.filter(q => q.required);
      
      if (requiredSingle.length > 0) {
        // 随机选择一道必答题
        const randomRequired = requiredSingle[Math.floor(Math.random() * requiredSingle.length)];
        selectedQuestions.push({
          ...randomRequired,
          categoryId: category.id,
          categoryName: category.name
        });
      }
    });

    // 为每个分类随机选择一道必答题（多选）
    categoryIds.forEach(categoryId => {
      const category = questionCategories.find(c => c.id === categoryId);
      if (!category) return;

      const multipleQuestions = category.questions.filter(q => q.type === 'multiple');
      const requiredMultiple = multipleQuestions.filter(q => q.required);
      
      if (requiredMultiple.length > 0) {
        // 随机选择一道必答题
        const randomRequired = requiredMultiple[Math.floor(Math.random() * requiredMultiple.length)];
        selectedQuestions.push({
          ...randomRequired,
          categoryId: category.id,
          categoryName: category.name
        });
      }
    });

    // 抽取普通单选题
    categoryIds.forEach(categoryId => {
      const category = questionCategories.find(c => c.id === categoryId);
      if (!category) return;

      const count = questionsPerCategory[categoryId].single;
      const singleQuestions = category.questions.filter(q => q.type === 'single' && !q.required);
      const shuffledNormal = [...singleQuestions].sort(() => Math.random() - 0.5);
      const pickedNormal = shuffledNormal.slice(0, count);
      
      pickedNormal.forEach(q => {
        selectedQuestions.push({
          ...q,
          categoryId: category.id,
          categoryName: category.name
        });
      });
    });

    // 抽取普通多选题
    categoryIds.forEach(categoryId => {
      const category = questionCategories.find(c => c.id === categoryId);
      if (!category) return;

      const count = questionsPerCategory[categoryId].multiple;
      const multipleQuestions = category.questions.filter(q => q.type === 'multiple' && !q.required);
      const shuffledNormal = [...multipleQuestions].sort(() => Math.random() - 0.5);
      const pickedNormal = shuffledNormal.slice(0, count);
      
      pickedNormal.forEach(q => {
        selectedQuestions.push({
          ...q,
          categoryId: category.id,
          categoryName: category.name
        });
      });
    });

    // 抽取服务器规则必答题（随机1道单选 + 1道多选）
    const ruleSingleQuestions = serverRuleQuestions.filter(q => q.type === 'single' && q.required);
    const ruleMultipleQuestions = serverRuleQuestions.filter(q => q.type === 'multiple' && q.required);
    
    if (ruleSingleQuestions.length > 0) {
      const randomRuleSingle = ruleSingleQuestions[Math.floor(Math.random() * ruleSingleQuestions.length)];
      selectedQuestions.push({
        ...randomRuleSingle,
        categoryId: 'rules',
        categoryName: '服务器规则'
      });
    }
    
    if (ruleMultipleQuestions.length > 0) {
      const randomRuleMultiple = ruleMultipleQuestions[Math.floor(Math.random() * ruleMultipleQuestions.length)];
      selectedQuestions.push({
        ...randomRuleMultiple,
        categoryId: 'rules',
        categoryName: '服务器规则'
      });
    }
    
    // 抽取普通服务器规则题
    const normalRuleQuestions = serverRuleQuestions.filter(q => !q.required);
    const shuffledNormalRules = [...normalRuleQuestions].sort(() => Math.random() - 0.5);
    const pickedNormalRules = shuffledNormalRules.slice(0, ruleQuestionCount - 2);
    
    pickedNormalRules.forEach(q => {
      selectedQuestions.push({
        ...q,
        categoryId: 'rules',
        categoryName: '服务器规则'
      });
    });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          reason: formData.reason,
          quiz_category: Object.keys(selectedCategories).map(id => {
            const cat = questionCategories.find(c => c.id === id);
            return cat?.name || id;
          }).join(', '),
          quiz_score: calculateScore(),
          quiz_total: quizQuestions.length
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSubmitMessage('申请已成功提交！管理员将在24小时内审核，审核结果将通过邮件通知您。');
        setFormData({ minecraftId: '', age: '', contact: '', reason: '' });
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <a href="/" className="inline-flex items-center text-green-400 hover:text-green-300 mb-8">
          ← 返回首页
        </a>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">白名单申请</h1>
          <p className="text-xl text-gray-300">
            请完成以下步骤申请加入我们的服务器
          </p>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {['选择题库', '答题测试', '填写申请表', '完成申请'].map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= index ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {currentStep > index ? '✓' : index + 1}
                </div>
                <span className={`ml-2 hidden md:block ${currentStep >= index ? 'text-white' : 'text-gray-500'}`}>
                  {step}
                </span>
                {index < 3 && (
                  <div className={`w-8 md:w-16 h-1 mx-2 ${currentStep > index ? 'bg-blue-600' : 'bg-gray-700'}`} />
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
          <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 md:p-12">
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-8">
              <p className="text-green-300">
                恭喜你通过了答题测试！请填写以下申请表完成申请。
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
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
                <p className="mt-2 text-sm text-gray-500">审核结果将通过此方式通知您，请务必填写准确的QQ邮箱。</p>
              </div>

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

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 text-xl font-bold rounded-lg transition duration-300 ${
                    isSubmitting
                      ? 'bg-gray-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 shadow-lg'
                  }`}
                >
                  {isSubmitting ? '提交中...' : '提交白名单申请'}
                </button>

                {submitMessage && (
                  <div className={`mt-6 p-4 rounded-lg ${
                    isError 
                      ? 'bg-red-900/30 border border-red-700' 
                      : 'bg-green-900/30 border border-green-700'
                  }`}>
                    <p className={isError ? 'text-red-300' : 'text-green-300'}>{submitMessage}</p>
                  </div>
                )}

                <p className="mt-6 text-center text-gray-500 text-sm">
                  点击提交即表示您已阅读并同意遵守服务器规则。如有疑问，请通过首页底部的联系方式咨询。
                </p>
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
