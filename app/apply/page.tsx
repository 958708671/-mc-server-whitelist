'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questionCategories, serverRuleQuestions } from '@/data/questions';
import type { Question, QuestionCategory } from '@/data/questions';

interface QuizQuestion extends Question {
  categoryId: string;
  categoryName: string;
}

export default function ApplyPage() {
  const router = useRouter();
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newBannedServer, setNewBannedServer] = useState('');
  
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

  const totalQuestions = 30;
  const singleChoiceCount = 15;
  const multipleChoiceCount = 10;
  const judgmentChoiceCount = 5;
  const ruleQuestionCount = 5;

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

  const generateQuiz = () => {
    const categoryIds = Object.keys(selectedCategories);
    if (categoryIds.length === 0) return;
    if (categoryIds.length > 5) {
      alert('最多只能选择5个分类');
      return;
    }

    const selectedQuestions: QuizQuestion[] = [];

    const totalServerRuleQuestions = ruleQuestionCount;
    const totalCategorySingleQuestions = singleChoiceCount - totalServerRuleQuestions;
    const totalCategoryMultipleQuestions = multipleChoiceCount;
    const totalCategoryJudgmentQuestions = judgmentChoiceCount;

    const ruleSingleQuestions = serverRuleQuestions.filter(q => q.type === 'single');
    const ruleMultipleQuestions = serverRuleQuestions.filter(q => q.type === 'multiple');
    const ruleJudgmentQuestions = serverRuleQuestions.filter(q => q.type === 'judgment');
    
    const ruleRequiredSingle = ruleSingleQuestions.filter(q => q.required);
    if (ruleRequiredSingle.length > 0) {
      const randomRuleSingle = ruleRequiredSingle[Math.floor(Math.random() * ruleRequiredSingle.length)];
      selectedQuestions.push({
        ...randomRuleSingle,
        categoryId: 'rules',
        categoryName: '服务器规则'
      });
    }
    
    const ruleRequiredMultiple = ruleMultipleQuestions.filter(q => q.required);
    if (ruleRequiredMultiple.length > 0) {
      const randomRuleMultiple = ruleRequiredMultiple[Math.floor(Math.random() * ruleRequiredMultiple.length)];
      selectedQuestions.push({
        ...randomRuleMultiple,
        categoryId: 'rules',
        categoryName: '服务器规则'
      });
    }
    
    const ruleRequiredJudgment = ruleJudgmentQuestions.filter(q => q.required);
    if (ruleRequiredJudgment.length > 0) {
      const randomRuleJudgment = ruleRequiredJudgment[Math.floor(Math.random() * ruleRequiredJudgment.length)];
      selectedQuestions.push({
        ...randomRuleJudgment,
        categoryId: 'rules',
        categoryName: '服务器规则'
      });
    }
    
    const ruleNormalQuestions = serverRuleQuestions.filter(q => !q.required);
    const shuffledRuleNormal = [...ruleNormalQuestions].sort(() => Math.random() - 0.5);
    const pickedRuleNormal = shuffledRuleNormal.slice(0, totalServerRuleQuestions - 3);
    
    pickedRuleNormal.forEach(q => {
      selectedQuestions.push({
        ...q,
        categoryId: 'rules',
        categoryName: '服务器规则'
      });
    });

    const totalWeight = Object.values(selectedCategories).reduce((a, b) => a + b, 0);
    const questionsPerCategory: Record<string, { single: number, multiple: number, judgment: number }> = {};
    
    categoryIds.forEach(id => {
      const weight = selectedCategories[id];
      const singleCount = Math.round((weight / totalWeight) * totalCategorySingleQuestions);
      const multipleCount = Math.round((weight / totalWeight) * totalCategoryMultipleQuestions);
      const judgmentCount = Math.round((weight / totalWeight) * totalCategoryJudgmentQuestions);
      questionsPerCategory[id] = { single: singleCount, multiple: multipleCount, judgment: judgmentCount };
    });

    let totalSingleAssigned = Object.values(questionsPerCategory).reduce((a, b) => a + b.single, 0);
    let totalMultipleAssigned = Object.values(questionsPerCategory).reduce((a, b) => a + b.multiple, 0);
    let totalJudgmentAssigned = Object.values(questionsPerCategory).reduce((a, b) => a + b.judgment, 0);
    
    const singleDiff = totalCategorySingleQuestions - totalSingleAssigned;
    const multipleDiff = totalCategoryMultipleQuestions - totalMultipleAssigned;
    const judgmentDiff = totalCategoryJudgmentQuestions - totalJudgmentAssigned;
    
    if (singleDiff !== 0 && categoryIds.length > 0) {
      const firstId = categoryIds[0];
      questionsPerCategory[firstId].single = (questionsPerCategory[firstId].single || 0) + singleDiff;
    }
    
    if (multipleDiff !== 0 && categoryIds.length > 0) {
      const firstId = categoryIds[0];
      questionsPerCategory[firstId].multiple = (questionsPerCategory[firstId].multiple || 0) + multipleDiff;
    }
    
    if (judgmentDiff !== 0 && categoryIds.length > 0) {
      const firstId = categoryIds[0];
      questionsPerCategory[firstId].judgment = (questionsPerCategory[firstId].judgment || 0) + judgmentDiff;
    }

    categoryIds.forEach(categoryId => {
      const category = questionCategories.find(c => c.id === categoryId);
      if (!category) return;

      const categoryRequiredSingle = category.questions.filter(q => q.type === 'single' && q.required);
      if (categoryRequiredSingle.length > 0) {
        const randomRequiredSingle = categoryRequiredSingle[Math.floor(Math.random() * categoryRequiredSingle.length)];
        selectedQuestions.push({
          ...randomRequiredSingle,
          categoryId: category.id,
          categoryName: category.name
        });
      }

      const categoryRequiredMultiple = category.questions.filter(q => q.type === 'multiple' && q.required);
      if (categoryRequiredMultiple.length > 0) {
        const randomRequiredMultiple = categoryRequiredMultiple[Math.floor(Math.random() * categoryRequiredMultiple.length)];
        selectedQuestions.push({
          ...randomRequiredMultiple,
          categoryId: category.id,
          categoryName: category.name
        });
      }

      const categoryRequiredJudgment = category.questions.filter(q => q.type === 'judgment' && q.required);
      if (categoryRequiredJudgment.length > 0) {
        const randomRequiredJudgment = categoryRequiredJudgment[Math.floor(Math.random() * categoryRequiredJudgment.length)];
        selectedQuestions.push({
          ...randomRequiredJudgment,
          categoryId: category.id,
          categoryName: category.name
        });
      }
    });

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

    categoryIds.forEach(categoryId => {
      const category = questionCategories.find(c => c.id === categoryId);
      if (!category) return;

      const count = questionsPerCategory[categoryId].judgment;
      const categoryNormalJudgment = category.questions.filter(q => q.type === 'judgment' && !q.required);
      const shuffledJudgment = [...categoryNormalJudgment].sort(() => Math.random() - 0.5);
      const pickedJudgment = shuffledJudgment.slice(0, count);
      
      pickedJudgment.forEach(q => {
        selectedQuestions.push({
          ...q,
          categoryId: category.id,
          categoryName: category.name
        });
      });
    });

    while (selectedQuestions.length > totalQuestions) {
      const randomIndex = Math.floor(Math.random() * selectedQuestions.length);
      if (!selectedQuestions[randomIndex].required) {
        selectedQuestions.splice(randomIndex, 1);
      }
    }

    while (selectedQuestions.length < totalQuestions) {
      const allNormalQuestions: QuizQuestion[] = [];
      
      categoryIds.forEach(categoryId => {
        const category = questionCategories.find(c => c.id === categoryId);
        if (!category) return;
        
        const normalQuestions = category.questions.filter(q => !q.required);
        normalQuestions.forEach(q => {
          if (!selectedQuestions.some(sq => sq.id === q.id && sq.categoryId === categoryId)) {
            allNormalQuestions.push({
              ...q,
              categoryId: category.id,
              categoryName: category.name
            });
          }
        });
      });
      
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
      
      if (allNormalQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * allNormalQuestions.length);
        selectedQuestions.push(allNormalQuestions[randomIndex]);
      } else {
        break;
      }
    }

    const singleChoiceQuestions = selectedQuestions.filter(q => q.type === 'single');
    const multipleChoiceQuestions = selectedQuestions.filter(q => q.type === 'multiple');
    const judgmentChoiceQuestions = selectedQuestions.filter(q => q.type === 'judgment');

    const singleRequiredCount = Math.floor(Math.random() * 2) + 1;
    const shuffledSingleReq = [...singleChoiceQuestions].sort(() => Math.random() - 0.5);
    const singleRequiredQuestions = shuffledSingleReq.slice(0, singleRequiredCount);

    const multipleRequiredCount = Math.floor(Math.random() * 2) + 1;
    const shuffledMultipleReq = [...multipleChoiceQuestions].sort(() => Math.random() - 0.5);
    const multipleRequiredQuestions = shuffledMultipleReq.slice(0, multipleRequiredCount);

    const judgmentRequiredCount = Math.floor(Math.random() * 2) + 1;
    const shuffledJudgmentReq = [...judgmentChoiceQuestions].sort(() => Math.random() - 0.5);
    const judgmentRequiredQuestions = shuffledJudgmentReq.slice(0, judgmentRequiredCount);

    selectedQuestions.forEach(q => {
      const isSingleRequired = singleRequiredQuestions.some(sq => sq.id === q.id && sq.categoryId === q.categoryId);
      const isMultipleRequired = multipleRequiredQuestions.some(mq => mq.id === q.id && mq.categoryId === q.categoryId);
      const isJudgmentRequired = judgmentRequiredQuestions.some(jq => jq.id === q.id && jq.categoryId === q.categoryId);
      
      if (isSingleRequired || isMultipleRequired || isJudgmentRequired) {
        q.required = true;
      }
    });

    const singleQuestions = selectedQuestions.filter(q => q.type === 'single');
    const multipleQuestions = selectedQuestions.filter(q => q.type === 'multiple');
    const judgmentQuestions = selectedQuestions.filter(q => q.type === 'judgment');
    
    const finalShuffledSingle = singleQuestions.sort(() => Math.random() - 0.5);
    const finalShuffledMultiple = multipleQuestions.sort(() => Math.random() - 0.5);
    const finalShuffledJudgment = judgmentQuestions.sort(() => Math.random() - 0.5);
    
    const finalQuestions = [
      ...finalShuffledSingle.slice(0, 15),
      ...finalShuffledMultiple.slice(0, 10),
      ...finalShuffledJudgment.slice(0, 5)
    ];
    
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
                          value={selectedCategories[category.id]}
                          onChange={(e) => handleWeightChange(category.id, parseInt(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full mt-1"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>入门</span>
                          <span>精通</span>
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
                {currentQuestionIndex === quizQuestions.length - 1 ? '提交' : '下一题'}
              </button>
            </div>
          </div>
        )}

        {showResult && (
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 text-center">
            {failedRequired ? (
              <>
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-red-400 mb-4">必答题答错</h2>
                <p className="text-gray-400 mb-6">您没有答对必答题，试卷已作废，请重新答题。</p>
                <button
                  onClick={resetQuiz}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                >
                  重新答题
                </button>
              </>
            ) : (
              <>
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
              </>
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
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="学生/工作等"
                  />
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
