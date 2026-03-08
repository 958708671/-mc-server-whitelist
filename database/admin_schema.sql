-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  qq VARCHAR(20),
  display_name VARCHAR(100),
  is_owner BOOLEAN DEFAULT FALSE,
  -- 权限字段 (JSON格式存储)
  permissions JSONB DEFAULT '{
    "whitelist_review": true,
    "complaint_handle": true,
    "blacklist_manage": true,
    "announcement_manage": true,
    "event_manage": true,
    "statistics_view": true,
    "settings_view": false,
    "website_edit": false,
    "admin_manage": false,
    "logs_view": false,
    "monitor_view": false
  }'::jsonb,
  -- 展示设置
  show_in_contact BOOLEAN DEFAULT TRUE,
  show_in_logs BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 管理员操作日志表
CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admins(id),
  action VARCHAR(50) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50),
  complaint_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 添加ip_address列（如果表已存在）
ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50);

-- 添加权限字段（如果表已存在）
ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{
  "whitelist_review": true,
  "complaint_handle": true,
  "blacklist_manage": true,
  "announcement_manage": true,
  "event_manage": true,
  "statistics_view": true,
  "settings_view": false,
  "website_edit": false,
  "admin_manage": false,
  "logs_view": false,
  "monitor_view": false
}'::jsonb;

-- 添加展示设置字段（如果表已存在）
ALTER TABLE admins ADD COLUMN IF NOT EXISTS show_in_contact BOOLEAN DEFAULT TRUE;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS show_in_logs BOOLEAN DEFAULT TRUE;

-- 官网配置表
CREATE TABLE IF NOT EXISTS website_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  server_name VARCHAR(200),
  server_description TEXT,
  server_version VARCHAR(50),
  welcome_message VARCHAR(500),
  contact_qq VARCHAR(50),
  contact_qqid VARCHAR(100),
  announcement TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入服主账号（QQ: 958708671）- 仅在不存在时插入
INSERT INTO admins (username, password, qq, display_name, is_owner, permissions, show_in_contact, show_in_logs) 
VALUES ('958708671', '95870867120260308', '958708671', '服主', TRUE, '{
  "whitelist_review": true,
  "complaint_handle": true,
  "blacklist_manage": true,
  "announcement_manage": true,
  "event_manage": true,
  "statistics_view": true,
  "settings_view": true,
  "website_edit": true,
  "admin_manage": true,
  "logs_view": true,
  "monitor_view": true
}'::jsonb, TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;

-- 插入管理员账号 - 仅在不存在时插入
INSERT INTO admins (username, password, qq, display_name, is_owner, permissions, show_in_contact, show_in_logs) 
VALUES ('2801699303', '280169930320260308', '2801699303', 'fly_yu', FALSE, '{
  "whitelist_review": true,
  "complaint_handle": true,
  "blacklist_manage": true,
  "announcement_manage": true,
  "event_manage": true,
  "statistics_view": true,
  "settings_view": false,
  "website_edit": false,
  "admin_manage": false,
  "logs_view": false,
  "monitor_view": false
}'::jsonb, TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;

INSERT INTO admins (username, password, qq, display_name, is_owner, permissions, show_in_contact, show_in_logs) 
VALUES ('345258083', '34525808320260308', '345258083', 'fuyou', FALSE, '{
  "whitelist_review": true,
  "complaint_handle": true,
  "blacklist_manage": true,
  "announcement_manage": true,
  "event_manage": true,
  "statistics_view": true,
  "settings_view": false,
  "website_edit": false,
  "admin_manage": false,
  "logs_view": false,
  "monitor_view": false
}'::jsonb, TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;

INSERT INTO admins (username, password, qq, display_name, is_owner, permissions, show_in_contact, show_in_logs) 
VALUES ('939588079', '93958807920260308', '939588079', '豌豆', FALSE, '{
  "whitelist_review": true,
  "complaint_handle": true,
  "blacklist_manage": true,
  "announcement_manage": true,
  "event_manage": true,
  "statistics_view": true,
  "settings_view": false,
  "website_edit": false,
  "admin_manage": false,
  "logs_view": false,
  "monitor_view": false
}'::jsonb, TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;
