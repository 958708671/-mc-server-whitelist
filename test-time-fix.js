// 测试修复后的时间显示逻辑

// 模拟修复后的formatStoredTimeForDisplay函数
function formatStoredTimeForDisplay(utcTimeString) {
  // 1. 正确解析：将数据库中的字符串转换为 Date 对象
  //    数据库里的 "2026-03-08T13:05:01.315Z" 会被理解为 UTC 时间 13:05
  const utcDate = new Date(utcTimeString);
  
  // 2. 转换为本地时间：这一步会让 JavaScript 自动根据您电脑的时区（UTC+8）进行转换
  const localDate = new Date(utcDate.getTime()); // 或者直接使用 utcDate 也可以
  
  // 3. 格式化为可读的北京时间字符串
  return localDate.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai', // 显式指定时区更可靠
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // 使用24小时制
  }).replace(/\//g, '/');
  // 返回结果示例："2026/03/08 21:05:01"
}

// 模拟formatViolationTime函数
function formatViolationTime(timeStr) {
  if (!timeStr || timeStr === '未填写') return '未填写';
  
  if (timeStr.includes('T')) {
    // 确保ISO格式时间被解析为UTC时间
    if (!timeStr.endsWith('Z')) {
      // 如果没有Z后缀，手动构建UTC时间
      const [datePart, timePart] = timeStr.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute, second] = timePart.split(':').map(Number);
      const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second || 0));
      return formatStoredTimeForDisplay(utcDate.toISOString());
    }
    // 使用标准的时区转换函数
    return formatStoredTimeForDisplay(timeStr);
  }
  
  const chineseMatch = timeStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/);
  if (chineseMatch) {
    const [, year, month, day, hour, minute] = chineseMatch;
    // 构建UTC日期对象并使用时区转换
    const utcDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)));
    return formatStoredTimeForDisplay(utcDate.toISOString());
  }
  
  const slashMatch = timeStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})\s*(\d{1,2}):(\d{2})/);
  if (slashMatch) {
    const [, year, month, day, hour, minute] = slashMatch;
    // 构建UTC日期对象并使用时区转换
    const utcDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)));
    return formatStoredTimeForDisplay(utcDate.toISOString());
  }
  
  const dashMatch = timeStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})\s*(\d{1,2}):(\d{2})/);
  if (dashMatch) {
    const [, year, month, day, hour, minute] = dashMatch;
    // 构建UTC日期对象并使用时区转换
    const utcDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)));
    return formatStoredTimeForDisplay(utcDate.toISOString());
  }
  
  return timeStr;
}

// 测试用例
console.log('测试修复后的时间显示逻辑:');
console.log('=====================================');

// 测试ISO格式时间（UTC时间）
const isoTime = '2026-03-08T13:05:01.315Z';
console.log(`ISO时间: ${isoTime}`);
console.log(`显示时间: ${formatViolationTime(isoTime)}`);
console.log('期望时间: 2026/03/08 21:05:01');
console.log('-------------------------------------');

// 测试ISO格式时间（不含毫秒）
const isoTimeNoMs = '2026-03-08T12:57:00';
console.log(`ISO时间(不含毫秒): ${isoTimeNoMs}`);
console.log(`显示时间: ${formatViolationTime(isoTimeNoMs)}`);
console.log('期望时间: 2026/03/08 20:57:00');
console.log('-------------------------------------');

// 测试中文格式时间
const chineseTime = '2026年03月08日 13:05';
console.log(`中文时间: ${chineseTime}`);
console.log(`显示时间: ${formatViolationTime(chineseTime)}`);
console.log('期望时间: 2026/03/08 21:05:00');
console.log('-------------------------------------');

// 测试斜杠格式时间
const slashTime = '2026/03/08 13:05';
console.log(`斜杠时间: ${slashTime}`);
console.log(`显示时间: ${formatViolationTime(slashTime)}`);
console.log('期望时间: 2026/03/08 21:05:00');
console.log('-------------------------------------');

// 测试破折号格式时间
const dashTime = '2026-03-08 13:05';
console.log(`破折号时间: ${dashTime}`);
console.log(`显示时间: ${formatViolationTime(dashTime)}`);
console.log('期望时间: 2026/03/08 21:05:00');
console.log('=====================================');

console.log('测试完成！');
