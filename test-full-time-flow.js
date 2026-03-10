// 完整时间处理流程测试
// 模拟从用户选择时间到前端显示的整个过程

console.log('=== 完整时间处理流程测试 ===');
console.log('=====================================');

// 1. 用户在表单中选择时间（晚上8点）
console.log('1. 用户选择时间: 晚上8点');
const userSelectedTime = '20:00';
const currentDate = new Date();
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const day = String(currentDate.getDate()).padStart(2, '0');
const datePart = `${year}-${month}-${day}`;

// 2. 前端将时间转换为ISO格式
console.log('2. 前端转换为ISO格式:');
const isoTime = `${datePart}T${userSelectedTime}`;
console.log(`   ISO时间: ${isoTime}`);

// 3. 前端提交到后端API
console.log('3. 前端提交到后端API:');
console.log(`   提交时间: ${isoTime}`);

// 4. 后端API处理时间（模拟）
console.log('4. 后端API处理时间:');
let violationTime = '未填写';
if (isoTime) {
  if (isoTime.includes('T')) {
    // 如果是 ISO 格式，直接解析时间部分，避免时区问题
    const [datePart, timePart] = isoTime.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    
    console.log('   后端解析ISO时间:', { year, month, day, hour, minute });
    
    // 直接使用解析出的时间，不通过Date对象转换，避免时区问题
    const formattedYear = year;
    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const formattedHour = String(hour).padStart(2, '0');
    const formattedMinute = String(minute).padStart(2, '0');
    violationTime = `${formattedYear}年${formattedMonth}月${formattedDay}日 ${formattedHour}:${formattedMinute}`;
    console.log('   格式化后的时间:', violationTime);
  }
}
console.log('   最终保存的时间:', violationTime);

// 5. 数据库存储（模拟）
console.log('5. 数据库存储:');
console.log('   存储时间: 2026年03月08日 20:00');
console.log('   存储格式: 字符串');

// 6. 前端从数据库读取时间
console.log('6. 前端从数据库读取时间:');
const storedTimeFromDB = '2026年03月08日 20:00';
console.log(`   从数据库读取: ${storedTimeFromDB}`);

// 7. 前端显示时间（使用修复后的函数）
console.log('7. 前端显示时间:');

// 模拟修复后的formatStoredTimeForDisplay函数
function formatStoredTimeForDisplay(utcTimeString) {
  // 1. 正确解析：将数据库中的字符串转换为 Date 对象
  const utcDate = new Date(utcTimeString);
  
  // 2. 转换为本地时间：这一步会让 JavaScript 自动根据您电脑的时区（UTC+8）进行转换
  const localDate = new Date(utcDate.getTime());
  
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

// 测试不同格式的时间显示
const testTimes = [
  '2026-03-08T12:57:00',  // ISO格式（UTC时间）
  '2026年03月08日 12:57', // 中文格式
  '2026/03/08 12:57',     // 斜杠格式
  '2026-03-08 12:57'      // 破折号格式
];

let allTestsPassed = true;

testTimes.forEach((time, index) => {
  console.log(`   测试${index + 1} - 输入时间: ${time}`);
  const displayTime = formatViolationTime(time);
  console.log(`   显示时间: ${displayTime}`);
  console.log(`   预期时间: 2026/03/08 20:57`);
  const testPassed = displayTime === '2026/03/08 20:57';
  console.log(`   结果: ${testPassed ? '✓ 正确' : '✗ 错误'}`);
  if (!testPassed) allTestsPassed = false;
  console.log('   -------------------------------------');
});

// 8. 测试结果
console.log('8. 测试结果:');
if (allTestsPassed) {
  console.log('   ✓ 所有测试通过！');
  console.log('   时间显示逻辑已正确修复，能够处理所有时间格式。');
  console.log('   当系统存储的时间是12:57时，会显示为20:57（晚上8点57分）。');
  console.log('   时间显示格式保持24小时制，符合用户需求。');
} else {
  console.log('   ✗ 部分测试失败，需要进一步修复。');
}

// 9. 系统时间信息
console.log('9. 系统时间信息:');
const systemTime = new Date();
console.log(`   当前系统时间: ${systemTime.toString()}`);
console.log(`   当前系统时间(ISO): ${systemTime.toISOString()}`);
console.log(`   时区偏移(分钟): ${systemTime.getTimezoneOffset()}`);
console.log(`   北京时间: ${systemTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);

console.log('=====================================');
console.log('测试完成！');
