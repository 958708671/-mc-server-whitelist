// 文件位置： app/page.tsx
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <nav className="container mx-auto px-6 py-4 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-green-400">⚔️ 星光之境 Minecraft 服务器</div>
          <div className="space-x-6">
            <a href="/" className="hover:text-green-400">首页</a>
            <a href="/apply" className="hover:text-green-400">申请白名单</a>
            <a href="/rules" className="hover:text-green-400">服务器规则</a>
            <a href="/about" className="hover:text-green-400">关于我们</a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-16">
        <section className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            欢迎来到 <span className="text-green-400">星光之境</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            一个由社区共同维护的纯净生存服务器。我们注重友好氛围、探索乐趣与建筑创造。服务器由玩家自愿捐助运行，服主“甩手”管理，一切事务由核心玩家共同决策。
          </p>
          <div className="space-x-4">
            <a
              href="/apply"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
            >
              🎮 立即申请白名单
            </a>
            <a
              href="#info"
              className="inline-block border border-gray-600 hover:border-green-400 text-gray-300 hover:text-green-400 font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
            >
              ℹ️ 了解更多
            </a>
          </div>
        </section>

        <section id="info" className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold mb-4">纯净生存</h3>
            <p className="text-gray-400">无付费特权，无破坏平衡的插件。只有原版生存的纯粹乐趣，辅以少量优化体验的数据包。</p>
          </div>
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
            <div className="text-4xl mb-4">❤️</div>
            <h3 className="text-2xl font-bold mb-4">社区共建</h3>
            <p className="text-gray-400">服务器由大家自愿捐助维持。重大更新与规则调整均由玩家社群讨论决定，真正“我们的服务器”。</p>
          </div>
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-2xl font-bold mb-4">白名单制</h3>
            <p className="text-gray-400">为确保环境友好，我们采用审核制。填写简单的申请表，让我们彼此了解，共同维护这片乐园。</p>
          </div>
        </section>

        <section className="text-center bg-gray-800/50 p-12 rounded-2xl border border-gray-700">
          <h2 className="text-4xl font-bold mb-6">准备好加入我们了吗？</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            点击下方按钮填写申请表。管理员会尽快审核（通常在24小时内）。通过后，您将收到邮件通知并获取服务器地址。
          </p>
          <a
            href="/apply"
            className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-12 rounded-lg text-xl transition duration-300 shadow-lg"
          >
            ✨ 前往白名单申请页面
          </a>
          <p className="mt-6 text-gray-500 text-sm">注：申请提交后不可自行修改，如需更改信息请联系管理员。</p>
        </section>
      </main>

      <footer className="container mx-auto px-6 py-8 border-t border-gray-800 text-center text-gray-500">
        <p>© 2026 星光之境 Minecraft 服务器。 本服务器为玩家社群自发组建与维护。</p>
        <p className="mt-2 text-sm">遇到问题？请联系管理员 QQ: [请在此处填写] 或发送邮件至 admin@yourdomain.com</p>
      </footer>
    </div>
  );
}