/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // 环境变量配置
  },
  // 配置加载local文件夹中的.env文件
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
