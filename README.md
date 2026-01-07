2026/01/07 问题反馈

1. 商户预付列表 接口 api/merchant/advances 返回数据中跟金额有关的只有一个 amount，没有变更前或者变更后的值，截图中是有 变更前预付、变更金额、变更后预付三个字段
2. 代付商户的 api/merchant/balance_add 调整余额接口无效，提示成功，但是值不会变
3. 商户通道绑定操作 api/merchant/channel_operation 不会返回
4. 商户产品绑定保存 api/merchant/product_save 这个接口修改提交提示成功，再重新拉取数据没变还是旧的
5. 管理员登陆（已接入）api/user/adminlogin 需去掉新增的IP字段
6. 商户产品绑定保存 id改成product_id api/merchant/product_save 保存提示成功后重新拉取还是旧数据
7. 商户通道绑定保存 接口 api/merchant/channel_save 提交数据提示成功，重新拉取数据后还是跟旧的一样没有变化
8. 商户通道绑定配置（已接入）api/merchant/product 商户ID非1的拉下来的数据都是空的，测试ID:12
9. 商户通道绑定配置（已接入）api/merchant/channel 拉取的数据缺少产品编码（code）字段，比如 黄金100 的条目，id为1，code值是null

缺失示意图汇总：

1. 代付产品截图
2. 新增产品截图
3. 新增通道截图
4. 代理功能的所有截图

缺失接口汇总：

商户：

1. 新增商户组
2. 删除商户组
3. 编辑商户组
4. 商户测试
5. 商户详情
6. 剩余预付明细
7. 剩余预付结算
8. 登录商户
9. 批量更新产品配置（后期）
10. 批量限额（后期）
11. 批量设置产品状态
12. 批量结算（后期）
13. 对接信息（后期）
