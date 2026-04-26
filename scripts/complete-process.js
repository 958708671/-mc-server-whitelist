const fs = require('fs');
let content = fs.readFileSync('e:/程序/-mc-server-whitelist/data/questions.ts', 'utf8');

function getCategoryBlock(id) {
  const regex = new RegExp(`\\{\\r?\\n    id: '${id}',[\\s\\S]*?\\r?\\n  \\},`);
  const match = content.match(regex);
  return match ? match[0] : null;
}

function getQuestions(block) {
  if (!block) return '';
  const match = block.match(/questions: \[([\s\S]*?)\r?\n    \]/);
  return match ? match[1] : '';
}

const farmingBlock = getCategoryBlock('farming');
const miningBlock = getCategoryBlock('mining');
const survivalBlock = getCategoryBlock('survival');
const brewingBlock = getCategoryBlock('brewing');
const enchantingBlock = getCategoryBlock('enchanting');

if (farmingBlock && miningBlock && survivalBlock) {
  const survivalQuestions = getQuestions(survivalBlock);
  const farmingQuestions = getQuestions(farmingBlock);
  const miningQuestions = getQuestions(miningBlock);
  const newSurvivalQuestions = survivalQuestions + ',\n      ' + farmingQuestions + ',\n      ' + miningQuestions;

  const survivalQuestionsRegex = /questions: \[[\s\S]*?\r?\n    \]/;
  content = content.replace(survivalQuestionsRegex, 'questions: [' + newSurvivalQuestions + '\n    ]');
  console.log('Merged farming and mining into survival');
}

if (brewingBlock && enchantingBlock) {
  const enchantingQuestions = getQuestions(enchantingBlock);
  const brewingQuestions = getQuestions(brewingBlock);
  const newEnchantingQuestions = enchantingQuestions + ',\n      ' + brewingQuestions;

  const enchantingQuestionsRegex = /questions: \[[\s\S]*?\r?\n    \]/;
  content = content.replace(enchantingQuestionsRegex, 'questions: [' + newEnchantingQuestions + '\n    ]');
  console.log('Merged brewing into enchanting');
}

content = content.replace(/name: '附魔';/g, "name: '附魔与酿造';");
console.log('Renamed enchanting to 附魔与酿造');

content = content.replace(/,\s*note: '[^']*'/g, '');
content = content.replace(/,\s*note: \[[^\]]*\]/g, '');
console.log('Removed all note fields');

content = content.replace(/description: '[^']*',/g, "description: '',");
console.log('Cleared all description fields');

const categoriesToDelete = ['elderly', 'pvp', 'adventure', 'nether', 'end', 'fishing', 'trading', 'farming', 'mining', 'brewing'];
categoriesToDelete.forEach(id => {
  const regex = new RegExp(`\\{\\r?\\n    id: '${id}',[\\s\\S]*?\\r?\\n  \\},`, 'g');
  const newContent = content.replace(regex, '');
  if (newContent !== content) {
    console.log(`Deleted category: ${id}`);
    content = newContent;
  }
});

fs.writeFileSync('e:/程序/-mc-server-whitelist/data/questions.ts', content, 'utf8');
console.log('All done!');