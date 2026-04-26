const fs = require('fs');
let content = fs.readFileSync('e:/程序/-mc-server-whitelist/data/questions.ts', 'utf8');

const categoriesToDelete = ['elderly', 'pvp', 'adventure', 'nether', 'end', 'fishing', 'trading', 'farming', 'mining', 'brewing'];

categoriesToDelete.forEach(id => {
  const regex = new RegExp(`\\{\\r?\\n    id: '${id}',[\\s\\S]*?\\r?\\n  \\},`, 'g');
  const newContent = content.replace(regex, '');
  if (newContent !== content) {
    console.log(`Deleted category: ${id}`);
    content = newContent;
  } else {
    console.log(`Category not found: ${id}`);
  }
});

fs.writeFileSync('e:/程序/-mc-server-whitelist/data/questions.ts', content, 'utf8');
console.log('Done');