const fs = require('fs');

const content = fs.readFileSync('e:/程序/-mc-server-whitelist/data/questions.ts', 'utf8');

const buildingMatch = content.match(/\{[\s\S]*?id: 'building'[\s\S]*?\n  \}\]/);
const survivalMatch = content.match(/\{[\s\S]*?id: 'survival'[\s\S]*?\n  \}\]/);
const redstoneMatch = content.match(/\{[\s\S]*?id: 'redstone'[\s\S]*?\n  \}\]/);
const commandsMatch = content.match(/\{[\s\S]*?id: 'commands'[\s\S]*?\n  \}\]/);
const enchantingMatch = content.match(/\{[\s\S]*?id: 'enchanting'[\s\S]*?\n  \}\]/);
const brewingMatch = content.match(/\{[\s\S]*?id: 'brewing'[\s\S]*?\n  \}\]/);
const farmingMatch = content.match(/\{[\s\S]*?id: 'farming'[\s\S]*?\n  \}\]/);
const miningMatch = content.match(/\{[\s\S]*?id: 'mining'[\s\S]*?\n  \}\]/);

let result = content;

if (farmingMatch && survivalMatch) {
  const farmingQuestions = farmingMatch[0].match(/questions: \[[\s\S]*?\n    \]\s*\},/);
  const survivalQuestions = survivalMatch[0].match(/questions: \[([\s\S]*?)\n    \]\s*\},/);

  if (farmingQuestions && survivalQuestions) {
    const farmingQ = farmingQuestions[0].replace(/questions: \[/, '').replace(/\n    \]\s*\},/, '');
    const survivalQ = survivalQuestions[1];

    const newSurvivalQ = survivalQ + ',\n' + farmingQ;

    result = result.replace(survivalQuestions[0], 'questions: [' + newSurvivalQ + '\n    ]\n  },');
    result = result.replace(farmingMatch[0], '');
  }
}

if (brewingMatch && enchantingMatch) {
  const brewingQuestions = brewingMatch[0].match(/questions: \[[\s\S]*?\n    \]\s*\},/);
  const enchantingQuestions = enchantingMatch[0].match(/questions: \[([\s\S]*?)\n    \]\s*\},/);

  if (brewingQuestions && enchantingQuestions) {
    const brewingQ = brewingQuestions[0].replace(/questions: \[/, '').replace(/\n    \]\s*\},/, '');
    const enchantingQ = enchantingQuestions[1];

    const newEnchantingQ = enchantingQ + ',\n' + brewingQ;

    result = result.replace(enchantingQuestions[0], 'questions: [' + newEnchantingQ + '\n    ]\n  },');
    result = result.replace(brewingMatch[0], '');
  }
}

result = result.replace(/name: '附魔'/g, "name: '附魔与酿造'");

result = result.replace(/,\s*note: '[^']*'/g, '');
result = result.replace(/,\s*note: \[[^\]]*\]/g, '');

result = result.replace(/description: '[^']*',\n/g, 'description: \'\',\n');
result = result.replace(/description: '[^']*',$/gm, "description: '',");

const categoriesToRemove = ['elderly', 'pvp', 'adventure', 'nether', 'end', 'fishing', 'trading'];
categoriesToRemove.forEach(id => {
  const regex = new RegExp(`\\{[\\s\\S]*?id: '${id}'[\\s\\S]*?\\n  \\},`, 'g');
  result = result.replace(regex, '');
});

fs.writeFileSync('e:/程序/-mc-server-whitelist/data/questions_new.ts', result, 'utf8');
console.log('Done! New file saved as questions_new.ts');