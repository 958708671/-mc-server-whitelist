'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const QuizCategoryPage = () => {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 题库类型选项
  const quizCategories = [
    { value: 'survival', label: '生存', description: '测试你的生存技能和知识' },
    { value: 'building', label: '建筑', description: '测试你的建筑技巧和创意' },
    { value: 'redstone', label: '红石', description: '测试你的红石电路知识' },
    { value: 'commands', label: '指令', description: '测试你的命令方块和指令知识' },
    { value: 'enchanting', label: '附魔', description: '测试你的附魔和酿造知识' }
  ];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleSubmit = () => {
    if (selectedCategories.length === 0) {
      alert('请至少选择一个题库类型');
      return;
    }

    setIsSubmitting(true);

    // 模拟答题过程，直接设置分数为100分（实际项目中应该跳转到答题页面）
    setTimeout(() => {
      const score = 100;
      const total = 100;
      const categories = selectedCategories.join(',');
      
      // 跳转到申请表单页面，并传递答题分数和选择的题库类型
      router.push(`/apply/form?score=${score}&total=${total}&categories=${categories}&selected=${categories}`);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">选择题库类型</h1>
          <p className="text-gray-400">请选择你要参加的题库类型，然后开始答题</p>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
          <div className="space-y-4">
            {quizCategories.map(category => (
              <div
                key={category.value}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedCategories.includes(category.value)
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 hover:border-blue-700 hover:bg-blue-900/10'
                }`}
                onClick={() => handleCategoryToggle(category.value)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{category.label}</h3>
                    <p className="text-gray-400 text-sm">{category.description}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedCategories.includes(category.value)
                      ? 'border-blue-500 bg-blue-600'
                      : 'border-gray-600'
                  }`}>
                    {selectedCategories.includes(category.value) && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedCategories.length === 0}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '正在准备答题...' : '开始答题'}
            </button>
            <p className="mt-2 text-sm text-gray-400">答题分数达到60分以上才能填写申请表</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCategoryPage;