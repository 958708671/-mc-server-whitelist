// 测试时间显示逻辑

// 模拟formatViolationTime函数（修复版本）
function formatViolationTime(timeStr) {
  if (!timeStr || timeStr === '未填写') return '未填写';
  
  if (timeStr.includes('T')) {
    // 直接解析ISO格式的时间字符串并加上8小时
    const [datePart, timePart] = timeStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    let [hour, minute] = timePart.split(':').map(Number);
    
    // 加上8小时
    hour += 8;
    if (hour >= 24) {
      hour -= 24;
    }
    
    return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }
  
  const chineseMatch = timeStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/);
  if (chineseMatch) {
    const [, year, month, day, hour, minute] = chineseMatch;
    let h = parseInt(hour);
    // 加上8小时
    h += 8;
    if (h >= 24) {
      h -= 24;
    }
    return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')} ${String(h).padStart(2, '0')}:${minute}`;
  }
  
  const slashMatch = timeStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})\s*(\d{1,2}):(\d{2})/);
  if (slashMatch) {
    const [, year, month, day, hour, minute] = slashMatch;
    let h = parseInt(hour);
    // 加上8小时
    h += 8;
    if (h >= 24) {
      h -= 24;
    }
    return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')} ${String(h).padStart(2, '0')}:${minute}`;
  }
  
  const dashMatch = timeStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})\s*(\d{1,2}):(\d{2})/);
  if (dashMatch) {
    const [, year, month, day, hour, minute] = dashMatch;
    let h = parseInt(hour);
    // 加上8小时
    h += 8;
    if (h >= 24) {
      h -= 24;
    }
    return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')} ${String(h).padStart(2, '0')}:${minute}`;
  }
  
  return timeStr;
}

// 测试用例
console.log('测试时间显示逻辑:');
console.log('=====================================');

// 测试ISO格式时间（UTC时间）
const isoTime = '2026-03-08T12:57:00';
console.log(`ISO时间: ${isoTime}`);
console.log(`显示时间: ${formatViolationTime(isoTime)}`);
console.log('期望时间: 2026/03/08 20:57');
console.log('-------------------------------------');

// 测试中文格式时间
const chineseTime = '2026年03月08日 12:57';
console.log(`中文时间: ${chineseTime}`);
console.log(`显示时间: ${formatViolationTime(chineseTime)}`);
console.log('期望时间: 2026/03/08 20:57');
console.log('-------------------------------------');

// 测试斜杠格式时间
const slashTime = '2026/03/08 12:57';
console.log(`斜杠时间: ${slashTime}`);
console.log(`显示时间: ${formatViolationTime(slashTime)}`);
console.log('期望时间: 2026/03/08 20:57');
console.log('-------------------------------------');

// 测试破折号格式时间
const dashTime = '2026-03-08 12:57';
console.log(`破折号时间: ${dashTime}`);
console.log(`显示时间: ${formatViolationTime(dashTime)}`);
console.log('期望时间: 2026/03/08 20:57');
console.log('=====================================');

console.log('测试完成！');

