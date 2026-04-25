-- ============================================
-- 简化版数据库迁移脚本
-- 直接复制粘贴到查询工具中执行
-- ============================================

-- ============================================
-- 修复 blacklist 表
-- ============================================

-- 添加 ip_address 列
ALTER TABLE blacklist ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50);

-- 添加 banned_by_id 列
ALTER TABLE blacklist ADD COLUMN IF NOT EXISTS banned_by_id INTEGER;

-- 添加 is_permanent 列
ALTER TABLE blacklist ADD COLUMN IF NOT EXISTS is_permanent BOOLEAN DEFAULT FALSE;

-- 添加 duration_minutes 列
ALTER TABLE blacklist ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

-- 添加 expires_at 列
ALTER TABLE blacklist ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- 添加 is_active 列
ALTER TABLE blacklist ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 添加 updated_at 列
ALTER TABLE blacklist ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- 修复 events 表
-- ============================================

-- 添加 location 列
ALTER TABLE events ADD COLUMN IF NOT EXISTS location VARCHAR(200);

-- 添加 max_participants 列
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_participants INTEGER;

-- 添加 organizer 列
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer VARCHAR(100);

-- 添加 updated_at 列
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- 修复 ip_bans 表
-- ============================================

-- 添加 minecraft_id 列
ALTER TABLE ip_bans ADD COLUMN IF NOT EXISTS minecraft_id VARCHAR(100);

-- 添加 banned_by_id 列
ALTER TABLE ip_bans ADD COLUMN IF NOT EXISTS banned_by_id INTEGER;

-- 添加 is_active 列
ALTER TABLE ip_bans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 添加 unbanned_at 列
ALTER TABLE ip_bans ADD COLUMN IF NOT EXISTS unbanned_at TIMESTAMP;

-- 添加 unbanned_by 列
ALTER TABLE ip_bans ADD COLUMN IF NOT EXISTS unbanned_by VARCHAR(100);

-- ============================================
-- 创建索引
-- ============================================

-- blacklist 表索引
CREATE INDEX IF NOT EXISTS idx_blacklist_minecraft_id ON blacklist(minecraft_id);
CREATE INDEX IF NOT EXISTS idx_blacklist_ip ON blacklist(ip_address);
CREATE INDEX IF NOT EXISTS idx_blacklist_is_active ON blacklist(is_active);
CREATE INDEX IF NOT EXISTS idx_blacklist_expires_at ON blacklist(expires_at);

-- events 表索引
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- ip_bans 表索引
CREATE INDEX IF NOT EXISTS idx_ip_bans_ip ON ip_bans(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_bans_minecraft_id ON ip_bans(minecraft_id);
CREATE INDEX IF NOT EXISTS idx_ip_bans_active ON ip_bans(is_active);

-- ============================================
-- 更新现有数据
-- ============================================

-- 将 NULL 值设置为默认值
UPDATE blacklist SET is_active = TRUE WHERE is_active IS NULL;
UPDATE blacklist SET is_permanent = FALSE WHERE is_permanent IS NULL;
UPDATE ip_bans SET is_active = TRUE WHERE is_active IS NULL;

-- 完成！
SELECT '数据库迁移完成！' AS message;
