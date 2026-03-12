const fs = require('fs');
const path = require('path');

// 读取questions.ts文件
const questionsTsPath = path.join(__dirname, 'data', 'questions.ts');
const questionsTsContent = fs.readFileSync(questionsTsPath, 'utf8');

// 解析TypeScript内容，提取questionCategories和serverRuleQuestions
function parseQuestions(content) {
  // 提取questionCategories数组
  const categoriesMatch = content.match(/export const questionCategories: QuestionCategory\[\] = \[(.*?)\];/s);
  const serverRulesMatch = content.match(/export const serverRuleQuestions: Question\[\] = \[(.*?)\];/s);
  
  if (!categoriesMatch || !serverRulesMatch) {
    throw new Error('无法解析questions.ts文件');
  }
  
  // 构建完整的JavaScript对象
  const categoriesCode = `[${categoriesMatch[1]}]`;
  const serverRulesCode = `[${serverRulesMatch[1]}]`;
  
  // 使用eval解析（在安全环境中）
  const categories = eval(categoriesCode);
  const serverRules = eval(serverRulesCode);
  
  return { categories, serverRules };
}

// 导出分类到文件
function exportCategories(categories, serverRules, outputDir) {
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 导出每个分类
  categories.forEach(category => {
    const outputPath = path.join(outputDir, `${category.name}.js`);
    const content = {
      name: category.name,
      description: category.description,
      icon: category.icon,
      questions: category.questions
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), 'utf8');
    console.log(`导出分类: ${category.name} 到 ${outputPath}`);
  });
  
  // 导出服务器规则
  const serverRulesPath = path.join(outputDir, '服务器规则.js');
  const serverRulesContent = {
    name: '服务器规则',
    description: '服务器规则相关问题',
    icon: '📜',
    questions: serverRules
  };
  
  fs.writeFileSync(serverRulesPath, JSON.stringify(serverRulesContent, null, 2), 'utf8');
  console.log(`导出服务器规则到 ${serverRulesPath}`);
}

// 主函数
function main() {
  try {
    const { categories, serverRules } = parseQuestions(questionsTsContent);
    const outputDir = path.join('e:\\程序', '服务器1', '零食');
    
    console.log(`开始导出 ${categories.length} 个分类和服务器规则`);
    exportCategories(categories, serverRules, outputDir);
    console.log('导出完成！');
  } catch (error) {
    console.error('导出失败:', error.message);
  }
}

// 执行主函数
main();
