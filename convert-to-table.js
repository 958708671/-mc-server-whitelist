const fs = require('fs');
const path = require('path');

// 输入和输出目录
const inputDir = path.join('e:\\程序', '服务器1', '零食');
const outputDir = path.join('e:\\程序', '服务器1', '零食');

// 读取文件
function readFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// 转换问题为表格行
function convertQuestionToTableRow(question, index) {
  const isMultiple = question.type === 'multiple';
  const isJudgment = question.type === 'judgment';
  
  let options = '';
  question.options.forEach((option, i) => {
    const optionLabel = String.fromCharCode(65 + i); // A, B, C, D...
    options += `${optionLabel}. ${option}<br>`;
  });
  
  let correctAnswer = '';
  if (isMultiple) {
    question.correct.forEach((correctIndex) => {
      correctAnswer += `${String.fromCharCode(65 + correctIndex)}、`;
    });
    correctAnswer = correctAnswer.slice(0, -1); // 移除最后一个顿号
  } else {
    correctAnswer = String.fromCharCode(65 + question.correct);
  }
  
  return `| ${index} | ${question.question} | ${options} | ${correctAnswer} |`;
}

// 转换整个分类为Markdown表格
function convertCategoryToTable(category) {
  let markdown = `# ${category.name}题库（表格形式）\n\n`;
  
  // 分类单选题
  const singleChoiceQuestions = category.questions.filter(q => q.type === 'single');
  if (singleChoiceQuestions.length > 0) {
    markdown += '## 单选题\n\n';
    markdown += '| 序号 | 问题 | 选项 | 正确答案 |\n';
    markdown += '|------|------|------|----------|\n';
    singleChoiceQuestions.forEach((q, i) => {
      markdown += convertQuestionToTableRow(q, q.id) + '\n';
    });
    markdown += '\n';
  }
  
  // 分类多选题
  const multipleChoiceQuestions = category.questions.filter(q => q.type === 'multiple');
  if (multipleChoiceQuestions.length > 0) {
    markdown += '## 多选题\n\n';
    markdown += '| 序号 | 问题 | 选项 | 正确答案 |\n';
    markdown += '|------|------|------|----------|\n';
    multipleChoiceQuestions.forEach((q, i) => {
      markdown += convertQuestionToTableRow(q, q.id) + '\n';
    });
    markdown += '\n';
  }
  
  // 分类判断题
  const judgmentQuestions = category.questions.filter(q => q.type === 'judgment');
  if (judgmentQuestions.length > 0) {
    markdown += '## 判断题\n\n';
    markdown += '| 序号 | 问题 | 选项 | 正确答案 |\n';
    markdown += '|------|------|------|----------|\n';
    judgmentQuestions.forEach((q, i) => {
      markdown += convertQuestionToTableRow(q, q.id) + '\n';
    });
    markdown += '\n';
  }
  
  return markdown;
}

// 处理所有文件
function processAllFiles() {
  const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.js'));
  
  files.forEach(file => {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file.replace('.js', '.md'));
    
    console.log(`处理文件: ${file}`);
    
    try {
      const category = readFile(inputPath);
      const markdown = convertCategoryToTable(category);
      fs.writeFileSync(outputPath, markdown, 'utf8');
      console.log(`生成表格文件: ${outputPath}`);
    } catch (error) {
      console.error(`处理文件 ${file} 时出错:`, error.message);
    }
  });
  
  console.log('所有文件处理完成！');
}

// 执行
processAllFiles();
