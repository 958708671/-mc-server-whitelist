// 模拟neon模块，在构建时使用
const neon = (connectionString, options) => {
  // 返回一个安全的模拟对象
  const mockSql = {
    query: async () => [],
    __esModule: true,
    default: {
      query: async () => []
    },
    // 支持模板字符串语法
    [Symbol.for('neon.query')]: async () => [],
    // 支持直接调用
    async apply(_, args) {
      return [];
    }
  };
  
  // 添加直接调用支持
  return Object.assign(mockSql, {
    async (...args) {
      return [];
    }
  });
};

// 导出模拟的neon函数
module.exports = neon;
module.exports.default = neon;