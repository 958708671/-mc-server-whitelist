-- 修复黑名单表缺少 is_active 列的问题
DO $$ 
BEGIN
  -- 检查并添加 is_active 列到 blacklist 表
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'blacklist' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE blacklist ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    CREATE INDEX IF NOT EXISTS idx_blacklist_is_active ON blacklist(is_active);
    RAISE NOTICE '已添加 is_active 列到 blacklist 表';
  ELSE
    RAISE NOTICE 'is_active 列已存在';
  END IF;

  -- 检查并添加 is_active 列到 ip_bans 表
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'ip_bans' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE ip_bans ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    CREATE INDEX IF NOT EXISTS idx_ip_bans_active ON ip_bans(is_active);
    RAISE NOTICE '已添加 is_active 列到 ip_bans 表';
  ELSE
    RAISE NOTICE 'is_active 列已存在';
  END IF;
END $$;

-- 更新现有数据，将 NULL 值设置为 TRUE
UPDATE blacklist SET is_active = TRUE WHERE is_active IS NULL;
UPDATE ip_bans SET is_active = TRUE WHERE is_active IS NULL;
