const fs = require('fs');

const content = fs.readFileSync('e:/程序/-mc-server-whitelist/data/questions.ts', 'utf8');

const getBlock = (regex) => {
  const match = regex.exec(content);
  return match ? match[0] : null;
};

const getQuestions = (block) => {
  if (!block) return '';
  const match = /questions: \[([\s\S]*?)\n    \]/.exec(block);
  return match ? match[1] : '';
};

const survivalBlock = getBlock(/\{[\s\S]*?id: 'survival'[\s\S]*?\n  \},/);
const farmingBlock = getBlock(/\{[\s\S]*?id: 'farming'[\s\S]*?\n  \},/);
const miningBlock = getBlock(/\{[\s\S]*?id: 'mining'[\s\S]*?\n  \},/);
const enchantingBlock = getBlock(/\{[\s\S]*?id: 'enchanting'[\s\S]*?\n  \},/);
const brewingBlock = getBlock(/\{[\s\S]*?id: 'brewing'[\s\S]*?\n  \},/);

let result = content;

const survivalQuestions = getQuestions(survivalBlock);
const farmingQuestions = getQuestions(farmingBlock);
const miningQuestions = getQuestions(miningBlock);
const enchantingQuestions = getQuestions(enchantingBlock);
const brewingQuestions = getQuestions(brewingBlock);

const newSurvivalQuestions = survivalQuestions + ',\n      ' + farmingQuestions + ',\n      ' + miningQuestions;
const newEnchantingQuestions = enchantingQuestions + ',\n      ' + brewingQuestions;

const survivalQuestionsRegex = /questions: \[[\s\S]*?\n    \]/;
result = result.replace(survivalQuestionsRegex, 'questions: [' + newSurvivalQuestions + '\n    ]');

const enchantingQuestionsRegex = /questions: \[[\s\S]*?\n    \]/;
result = result.replace(enchantingQuestionsRegex, 'questions: [' + newEnchantingQuestions + '\n    ]');

const categoriesToRemove = ['elderly', 'pvp', 'adventure', 'nether', 'end', 'fishing', 'trading', 'farming', 'mining', 'brewing'];
categoriesToRemove.forEach(id => {
  const regex = new RegExp(`\\{[\\s\\S]*?id: '${id}'[\\s\\S]*?\\n  \\},`, 'g');
  result = result.replace(regex, '');
});

result = result.replace(/name: '附魔'/g, "name: '附魔与酿造'");

result = result.replace(/,\s*note: '[^']*'/g, '');
result = result.replace(/,\s*note: \[[^\]]*\]/g, '');

result = result.replace(/description: '[^']*',\n/g, "description: '',\n");

fs.writeFileSync('e:/程序/-mc-server-whitelist/data/questions_processed.ts', result, 'utf8');
console.log('Done!');