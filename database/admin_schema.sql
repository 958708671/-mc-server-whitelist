-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  qq VARCHAR(20),
  display_name VARCHAR(100),
  is_owner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 管理员操作日志表
CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admins(id),
  action VARCHAR(50) NOT NULL,
  details TEXT,
  complaint_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 清空现有管理员数据
DELETE FROM admins;

-- 插入服主账号（QQ: 958708671）
INSERT INTO admins (username, password, qq, display_name, is_owner) 
VALUES ('958708671', '95870867120260308', '958708671', '服主', TRUE);

-- 插入管理员账号
INSERT INTO admins (username, password, qq, display_name, is_owner) 
VALUES ('2801699303', '280169930320260308', '2801699303', 'fly_yu', FALSE);

INSERT INTO admins (username, password, qq, display_name, is_owner) 
VALUES ('345258083', '34525808320260308', '345258083', 'fuyou', FALSE);

INSERT INTO admins (username, password, qq, display_name, is_owner) 
VALUES ('939588079', '93958807920260308', '939588079', '豌豆', FALSE);
