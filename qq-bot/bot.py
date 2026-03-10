#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import nonebot
from nonebot.adapters.onebot.v11 import Adapter as OneBotV11Adapter

# 初始化NoneBot
nonebot.init()

# 注册适配器
driver = nonebot.get_driver()
driver.register_adapter(OneBotV11Adapter)

# 加载插件
nonebot.load_plugins('plugins')

if __name__ == '__main__':
    nonebot.run()
