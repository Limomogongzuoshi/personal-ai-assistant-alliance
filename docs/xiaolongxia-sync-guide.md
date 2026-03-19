# 小龙虾双向同步功能使用指南

## 功能简介

小龙虾双向同步功能可以帮助您将本地数据与小龙虾系统进行同步，确保两端数据保持一致。

---

## 快速开始

### 第一步：准备工作

在开始同步之前，请确保：

- ✅ 系统已启动运行
- ✅ 已生成子助手（会同时初始化知识库数据）
- ✅ 网络连接正常

### 第二步：生成子助手

访问页面 `http://localhost:3001/sub-assistant`，点击「一键生成全部」按钮。

或者使用命令：

```
POST /api/sub-assistant
Body: {"action":"generate_all"}
```

### 第三步：执行同步

根据您的需求，选择以下同步方式之一：

---

## 同步操作指南

### 方式一：同步全部领域（推荐新手）

**操作命令：**

```
POST /api/sync/xiaolongxia
Body: {"action":"sync_all"}
```

**适用场景：**
- 首次同步
- 需要同步所有领域数据
- 不确定具体要同步哪个领域

**预期结果：**
```json
{
  "success": true,
  "results": [
    {"domainId": "space", "domainName": "太空探索", ...},
    {"domainId": "longevity", "domainName": "长寿科技", ...},
    {"domainId": "ai-safety", "domainName": "AI安全", ...},
    {"domainId": "growth", "domainName": "个人提升", ...}
  ]
}
```

---

### 方式二：指定领域同步

如果您只需要同步特定领域的数据，可以使用以下命令：

**同步太空探索领域：**
```
POST /api/sync/xiaolongxia
Body: {"action":"sync_bidirectional", "domainId": "space"}
```

**同步长寿科技领域：**
```
POST /api/sync/xiaolongxia
Body: {"action":"sync_bidirectional", "domainId": "longevity"}
```

**同步AI安全领域：**
```
POST /api/sync/xiaolongxia
Body: {"action":"sync_bidirectional", "domainId": "ai-safety"}
```

**同步个人提升领域：**
```
POST /api/sync/xiaolongxia
Body: {"action":"sync_bidirectional", "domainId": "growth"}
```

---

### 方式三：单向同步

#### 只同步到小龙虾（本地 → 远程）
```
POST /api/sync/xiaolongxia
Body: {"action":"sync_to", "domainId": "space"}
```

#### 只从小龙虾同步（本地 ← 远程）
```
POST /api/sync/xiaolongxia
Body: {"action":"sync_from", "domainId": "space"}
```

---

## 同步方向说明

| 方向 | action 值 | 说明 | 何时使用 |
|------|----------|------|----------|
| 双向同步 | `sync_bidirectional` | 本地与远程互相同步 | ✅ 推荐，日常同步 |
| 单向到远程 | `sync_to` | 只发送本地数据到远程 | 只想更新远程数据 |
| 单向到本地 | `sync_from` | 只从远程获取数据 | 只想更新本地数据 |
| 全部领域 | `sync_all` | 同步所有领域 | 首次同步或全量更新 |

---

## 查看同步状态

### 查看所有领域状态

```
GET /api/sync/xiaolongxia?action=status
```

**返回示例：**
```json
{
  "success": true,
  "status": [
    {
      "domainId": "space",
      "domainName": "太空探索",
      "sourcesCount": 2,
      "knowledgeCount": 2,
      "verifiedCount": 0
    }
  ],
  "syncConfig": {
    "xiaolongxiaEndpoint": "http://localhost:3001",
    "syncInterval": 300000,
    "autoSync": false
  }
}
```

### 状态字段说明

| 字段 | 含义 |
|------|------|
| `knowledgeCount` | 该领域的知识条目数量 |
| `verifiedCount` | 已验证的知识条目数量 |
| `sourcesCount` | 知识来源数量 |

---

## 四大领域说明

| 领域 ID | 名称 | 图标 | 说明 |
|---------|------|------|------|
| `space` | 太空探索 | 🚀 | 航天、宇宙、火星等相关知识 |
| `longevity` | 长寿科技 | 🧬 | 抗衰老、健康、医学等相关知识 |
| `ai-safety` | AI安全 | 🛡️ | 人工智能安全、伦理、治理等相关知识 |
| `growth` | 个人提升 | 📈 | 学习、成长、效率等相关知识 |

---

## 常见问题与解决方案

### 问题1：同步返回 404 错误

**原因：** 远程服务器地址配置不正确

**解决：**
1. 检查 `.env.local` 文件中的 `XIAOLONGXIA_ENDPOINT` 配置
2. 确保远程小龙虾系统正在运行
3. 确认网络可以访问远程服务器

---

### 问题2：同步成功但数据没有变化

**原因：** 知识库中没有数据

**解决：**
1. 先执行「一键生成全部」初始化数据
2. 手动添加知识条目到各领域
3. 使用状态查询确认数据存在

---

### 问题3：同步很慢或超时

**原因：** 数据量较大或网络问题

**解决：**
1. 减少每次同步的数据量（分领域同步）
2. 检查网络连接
3. 重试同步操作

---

### 问题4：数据冲突怎么办？

**说明：** 当前版本采用「合并」策略，新数据会添加到现有数据中，不会删除旧数据。

**建议：**
- 定期进行双向同步确保数据最新
- 重要数据建议手动备份

---

## 注意事项

### ⚠️ 重要提醒

1. **数据存储方式**
   - 当前系统使用内存存储
   - 服务器重启后数据会丢失
   - 生产环境建议配置数据库持久化

2. **同步时机**
   - 建议在网络稳定时进行同步
   - 大量数据同步建议分段进行

3. **认证配置**
   - 开发环境无需认证
   - 生产环境请配置 API Key

4. **自动同步**
   - 默认关闭自动同步
   - 可通过命令开启：`{"action":"start_auto_sync"}`
   - 关闭命令：`{"action":"stop_auto_sync"}`

---

## 配置说明

### 环境变量配置

如果需要修改小龙虾服务器地址，编辑 `.env.local` 文件：

```bash
# 小龙虾同步配置
XIAOLONGXIA_ENDPOINT=http://localhost:3001
```

将 `http://localhost:3001` 替换为实际的远程服务器地址。

---

## 错误代码参考

| 错误信息 | 含义 | 解决方法 |
|----------|------|----------|
| `domainId is required` | 缺少领域ID参数 | 检查请求Body是否包含domainId |
| `Invalid action` | 操作类型错误 | 检查action字段是否正确 |
| `ECONNREFUSED` | 连接被拒绝 | 检查远程服务器是否运行 |
| `Internal server error` | 服务器内部错误 | 查看服务器日志 |

---

## 完整操作示例

### 示例1：完整同步流程

```bash
# 1. 先生成子助手和知识库
curl -X POST http://localhost:3001/api/sub-assistant \
  -H "Content-Type: application/json" \
  -d '{"action":"generate_all"}'

# 2. 查看状态
curl "http://localhost:3001/api/sync/xiaolongxia?action=status"

# 3. 执行双向同步
curl -X POST http://localhost:3001/api/sync/xiaolongxia \
  -H "Content-Type: application/json" \
  -d '{"action":"sync_bidirectional", "domainId": "space"}'

# 4. 再次查看状态确认同步结果
curl "http://localhost:3001/api/sync/xiaolongxia?action=status"
```

### 示例2：同步特定领域

```bash
# 同步AI安全领域
curl -X POST http://localhost:3001/api/sync/xiaolongxia \
  -H "Content-Type: application/json" \
  -d '{"action":"sync_bidirectional", "domainId": "ai-safety"}'
```

---

## 技术支持

如遇到问题，请提供以下信息：

- 同步操作的具体命令
- 返回的错误信息
- 服务器日志（如有）
- 系统版本和环境配置

---

*文档版本：1.0*
*最后更新：2026-03-19*
