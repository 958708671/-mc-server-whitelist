-- 修复管理员表结构
-- 检查并添加缺失的列

-- 添加 permissions 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'admins' AND column_name = 'permissions') THEN
        ALTER TABLE admins ADD COLUMN permissions JSONB DEFAULT '{
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
    END IF;
END $$;

-- 添加 show_in_contact 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'admins' AND column_name = 'show_in_contact') THEN
        ALTER TABLE admins ADD COLUMN show_in_contact BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 添加 show_in_logs 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'admins' AND column_name = 'show_in_logs') THEN
        ALTER TABLE admins ADD COLUMN show_in_logs BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 添加 display_name 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'admins' AND column_name = 'display_name') THEN
        ALTER TABLE admins ADD COLUMN display_name VARCHAR(100);
    END IF;
END $$;

-- 添加 qq 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'admins' AND column_name = 'qq') THEN
        ALTER TABLE admins ADD COLUMN qq VARCHAR(20);
    END IF;
END $$;

-- 添加 is_owner 列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'admins' AND column_name = 'is_owner') THEN
        ALTER TABLE admins ADD COLUMN is_owner BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 更新现有数据，设置默认值
UPDATE admins SET permissions = '{
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
}'::jsonb WHERE permissions IS NULL;

UPDATE admins SET show_in_contact = TRUE WHERE show_in_contact IS NULL;
UPDATE admins SET show_in_logs = TRUE WHERE show_in_logs IS NULL;
UPDATE admins SET is_owner = FALSE WHERE is_owner IS NULL;
UPDATE admins SET display_name = username WHERE display_name IS NULL OR display_name = '';
UPDATE admins SET qq = username WHERE qq IS NULL OR qq = '';

-- 检查表结构
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admins' 
ORDER BY ordinal_position;
