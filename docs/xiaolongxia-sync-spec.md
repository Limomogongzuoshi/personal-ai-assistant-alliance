# 小龙虾（Crayfish）数据双向同步技术规范

## 目录

1. [概述](#概述)
2. [技术架构](#技术架构)
3. [数据流图](#数据流图)
4. [API 端点](#api-端点)
5. [认证要求](#认证要求)
6. [数据模型](#数据模型)
7. [同步协议](#同步协议)
8. [错误处理机制](#错误处理机制)
9. [实施步骤](#实施步骤)
10. [配置参考](#配置参考)

---

## 概述

### 项目背景

小龙虾同步系统是个人 AI 助手联盟的核心组件，负责实现与外部小龙虾（xiaolongxia）系统的数据双向同步。通过该同步机制，确保多端数据一致性，保障知识库、助手指等信息的实时更新。

### 核心功能

- **双向数据同步**：支持本地与远程系统之间的双向数据同步
- **知识库同步**：将本地知识库内容同步到远程系统
- **助手指同步**：同步子助手配置信息
- **实时状态监控**：提供同步状态查询接口
- **自动/手动同步**：支持定时自动同步和手动触发同步

---

## 技术架构

### 系统组件

```
┌─────────────────────────────────────────────────────────────┐
│                    个人 AI 助手联盟系统                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  子助手管理   │  │  知识库管理   │  │  RAG 服务   │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                │                │               │
│         └────────────────┼────────────────┘               │
│                          │                                │
│                   ┌──────▼──────┐                        │
│                   │ Xiaolongxia │                        │
│                   │   Sync      │                        │
│                   │   Manager   │                        │
│                   └──────┬──────┘                        │
│                          │                                │
└──────────────────────────┼────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  小龙虾系统   │
                    │  (远程)      │
                    └─────────────┘
```

### 技术栈

| 组件 | 技术方案 |
|------|----------|
| 运行时 | Node.js 18+ |
| 框架 | Next.js 15 API Routes |
| 数据存储 | 内存存储 (生产环境需替换为数据库) |
| HTTP 客户端 | Fetch API |
| 配置管理 | 环境变量 (.env.local) |

---

## 数据流图

### 同步流程

```
┌─────────────────────────────────────────────────────────────────────┐
│                        同步流程图                                     │
└─────────────────────────────────────────────────────────────────────┘

[本地系统]                    [Sync Manager]                  [远程系统]
    │                             │                               │
    │  1. 触发同步                 │                               │
    │────────────────────────────►│                               │
    │                             │                               │
    │                             │  2. 获取本地知识库               │
    │                             │◄──────────────────────────────│
    │                             │                               │
    │                             │  3. 同步到远程                  │
    │                             │──────────────────────────────►│
    │                             │                               │
    │                             │  4. 获取远程更新                 │
    │                             │◄──────────────────────────────│
    │                             │                               │
    │  5. 返回同步结果              │                               │
    │◄─────────────────────────────│                               │
    │                             │                               │
```

### 同步方向说明

| 方向 | 操作 | 说明 |
|------|------|------|
| `sync_to` | 单向同步到远程 | 本地 → 远程 |
| `sync_from` | 单向同步到本地 | 本地 ← 远程 |
| `sync_bidirectional` | 双向同步 | 本地 ⇄ 远程 |

---

## API 端点

### 基础信息

- **Base URL**: `http://localhost:3001` (开发环境)
- **协议**: HTTP REST API
- **内容类型**: `application/json`

### 端点列表

#### 1. 获取同步状态

```
GET /api/sync/xiaolongxia?action=status
```

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 固定值: `status` |

**响应示例**:

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
    },
    {
      "domainId": "longevity",
      "domainName": "长寿科技",
      "sourcesCount": 0,
      "knowledgeCount": 2,
      "verifiedCount": 0
    }
  ],
  "syncConfig": {
    "xiaolongxiaEndpoint": "http://localhost:3001",
    "syncInterval": 300000,
    "autoSync": false,
    "bidirectional": true
  }
}
```

#### 2. 同步到小龙虾系统

```
POST /api/sync/xiaolongxia
```

**请求体**:

```json
{
  "action": "sync_to",
  "domainId": "space"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 固定值: `sync_to` |
| domainId | string | 是 | 领域 ID |

**响应示例**:

```json
{
  "success": true,
  "itemsSynced": 2
}
```

#### 3. 从小龙虾系统同步

```
POST /api/sync/xiaolongxia
```

**请求体**:

```json
{
  "action": "sync_from",
  "domainId": "space"
}
```

**响应示例**:

```json
{
  "success": true,
  "itemsReceived": 5
}
```

#### 4. 双向同步

```
POST /api/sync/xiaolongxia
```

**请求体**:

```json
{
  "action": "sync_bidirectional",
  "domainId": "space"
}
```

**响应示例**:

```json
{
  "success": true,
  "toXiaolongxia": {
    "success": true,
    "itemsSynced": 2
  },
  "fromXiaolongxia": {
    "success": true,
    "itemsReceived": 3
  }
}
```

#### 5. 同步全部领域

```
POST /api/sync/xiaolongxia
```

**请求体**:

```json
{
  "action": "sync_all"
}
```

**响应示例**:

```json
{
  "success": true,
  "results": [
    {
      "domainId": "space",
      "domainName": "太空探索",
      "toXiaolongxia": { "success": true, "itemsSynced": 2 },
      "fromXiaolongxia": { "success": true, "itemsReceived": 0 }
    }
  ]
}
```

#### 6. 配置同步参数

```
POST /api/sync/xiaolongxia
```

**请求体**:

```json
{
  "action": "configure",
  "config": {
    "xiaolongxiaEndpoint": "http://remote-server:3001",
    "syncInterval": 600000,
    "autoSync": true,
    "bidirectional": true
  }
}
```

#### 7. 启动自动同步

```
POST /api/sync/xiaolongxia
```

**请求体**:

```json
{
  "action": "start_auto_sync"
}
```

#### 8. 停止自动同步

```
POST /api/sync/xiaolongxia
```

**请求体**:

```json
{
  "action": "stop_auto_sync"
}
```

---

## 认证要求

### 当前实现

当前版本的同步系统**未实现完整认证机制**，仅通过配置端点进行连接。

### 推荐认证方案

生产环境中建议实现以下认证机制：

#### 方案一：API Key 认证

```typescript
// 请求头中添加 API Key
headers: {
  'X-API-Key': 'your-api-key-here',
  'Content-Type': 'application/json'
}
```

#### 方案二：OAuth 2.0

```typescript
// 获取访问令牌
const token = await getOAuthToken()
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

#### 方案三：HMAC 签名

```typescript
const signature = hmacSha256(requestBody, secretKey)
headers: {
  'X-Signature': signature,
  'X-Timestamp': Date.now()
}
```

### 环境变量配置

```bash
# 认证配置
XIAOLONGXIA_API_KEY=your-api-key
XIAOLONGXIA_SECRET=your-secret
XIAOLONGXIA_ENDPOINT=http://remote-server:3001
```

---

## 数据模型

### 知识条目 (KnowledgeItem)

```typescript
interface KnowledgeItem {
  id: string                    // 唯一标识符
  domainId: string              // 领域 ID
  title: string                // 标题
  content: string              // 内容
  source: string               // 来源
  timestamp: number            // 时间戳
  verified: boolean            // 是否已验证
  tags: string[]               // 标签
  type: 'article' | 'research' | 'news' | 'tool' | 'case'
}
```

### 知识来源 (KnowledgeSource)

```typescript
interface KnowledgeSource {
  id: string
  domainId: string
  type: 'url' | 'file' | 'api' | 'manual'
  url?: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  lastSync: number
  itemCount: number
}
```

### 子助手 (SubAssistant)

```typescript
interface SubAssistant {
  id: string
  domainId: string
  name: string
  role: string
  systemPrompt: string
  tools: string[]
  knowledgeBaseIds: string[]
  capabilities: string[]
  status: 'active' | 'inactive' | 'training'
  createdAt: number
}
```

### 同步配置 (SyncConfig)

```typescript
interface SyncConfig {
  xiaolongxiaEndpoint: string   // 远程端点 URL
  syncInterval: number          // 同步间隔（毫秒）
  autoSync: boolean            // 是否自动同步
  bidirectional: boolean      // 是否双向同步
}
```

---

## 同步协议

### 同步流程

#### 1. 同步到远程 (`sync_to`)

```typescript
async function syncToXiaolongxia(domainId: string): Promise<SyncResult> {
  // 1. 获取配置
  const config = knowledgeBaseManager.getSyncConfig()

  // 2. 获取本地知识库
  const items = await knowledgeBaseManager.getKnowledgeItems(domainId, {
    verified: true
  })

  // 3. 发送到远程
  const response = await fetch(`${config.xiaolongxiaEndpoint}/api/sync/knowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domainId, items })
  })

  // 4. 处理响应
  if (!response.ok) {
    return { success: false, itemsSynced: 0 }
  }

  return { success: true, itemsSynced: items.length }
}
```

#### 2. 从远程同步 (`sync_from`)

```typescript
async function syncFromXiaolongxia(domainId: string): Promise<SyncResult> {
  // 1. 获取配置
  const config = knowledgeBaseManager.getSyncConfig()

  // 2. 从远程获取数据
  const response = await fetch(
    `${config.xiaolongxiaEndpoint}/api/knowledge?domain=${domainId}`
  )

  // 3. 处理响应
  if (!response.ok) {
    return { success: false, itemsReceived: 0 }
  }

  const data = await response.json()
  const items = data.items || []

  // 4. 添加到本地知识库
  for (const item of items) {
    await knowledgeBaseManager.addKnowledgeItem(domainId, {
      title: item.title,
      content: item.content,
      source: item.source || 'xiaolongxia',
      tags: item.tags || [],
      type: item.type || 'article'
    })
  }

  return { success: true, itemsReceived: items.length }
}
```

#### 3. 双向同步 (`bidirectional`)

```typescript
async function bidirectionalSync(domainId: string): Promise<BiSyncResult> {
  const toResult = await syncToXiaolongxia(domainId)
  const fromResult = await syncFromXiaolongxia(domainId)

  return {
    toXiaolongxia: toResult,
    fromXiaolongxia: fromResult
  }
}
```

### 自动同步机制

```typescript
class XiaolongxiaSync {
  private syncInterval?: NodeJS.Timeout

  startAutoSync(interval?: number) {
    const config = this.manager.getSyncConfig()
    const intervalMs = interval || config.syncInterval

    this.syncInterval = setInterval(async () => {
      for (const domain of DOMAINS) {
        await this.bidirectionalSync(domain.id)
      }
    }, intervalMs)
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = undefined
    }
  }
}
```

---

## 错误处理机制

### 错误类型

| 错误类型 | 错误码 | 说明 | 处理方式 |
|----------|--------|------|----------|
| 网络错误 | 1001 | 无法连接到远程服务器 | 重试 + 记录日志 |
| 认证失败 | 1002 | API Key 或 Token 无效 | 检查配置 |
| 同步超时 | 1003 | 同步操作超时 | 重试 |
| 数据格式错误 | 1004 | 返回数据格式不正确 | 记录日志 + 跳过 |
| 远程服务错误 | 1005 | 远程服务器返回错误 | 检查远程服务 |

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": 1001,
    "message": "无法连接到远程服务器",
    "details": "ECONNREFUSED"
  }
}
```

### 重试策略

```typescript
async function syncWithRetry(
  operation: () => Promise<SyncResult>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<SyncResult> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await sleep(retryDelay * Math.pow(2, i)) // 指数退避
      }
    }
  }

  return {
    success: false,
    error: lastError.message
  }
}
```

### 日志记录

```typescript
// 同步操作日志
console.log(`[Sync] Starting sync for domain: ${domainId}`)
console.log(`[Sync] Items to sync: ${items.length}`)
console.log(`[Sync] Sync result:`, result)
console.error(`[Sync] Error:`, error)
```

---

## 实施步骤

### 步骤 1：配置环境变量

在 `.env.local` 文件中添加：

```bash
# 小龙虾同步配置
XIAOLONGXIA_ENDPOINT=http://localhost:3001
```

### 步骤 2：确保知识库有数据

```bash
# 通过 API 生成子助手（会同时初始化知识库）
curl -X POST http://localhost:3001/api/sub-assistant \
  -H "Content-Type: application/json" \
  -d '{"action":"generate_all"}'
```

### 步骤 3：执行同步

#### 单向同步到远程

```bash
curl -X POST http://localhost:3001/api/sync/xiaolongxia \
  -H "Content-Type: application/json" \
  -d '{"action":"sync_to","domainId":"space"}'
```

#### 单向同步到本地

```bash
curl -X POST http://localhost:3001/api/sync/xiaolongxia \
  -H "Content-Type: application/json" \
  -d '{"action":"sync_from","domainId":"space"}'
```

#### 双向同步

```bash
curl -X POST http://localhost:3001/api/sync/xiaolongxia \
  -H "Content-Type: application/json" \
  -d '{"action":"sync_bidirectional","domainId":"space"}'
```

#### 同步全部领域

```bash
curl -X POST http://localhost:3001/api/sync/xiaolongxia \
  -H "Content-Type: application/json" \
  -d '{"action":"sync_all"}'
```

### 步骤 4：启动自动同步（可选）

```bash
curl -X POST http://localhost:3001/api/sync/xiaolongxia \
  -H "Content-Type: application/json" \
  -d '{"action":"start_auto_sync"}'
```

### 步骤 5：验证同步状态

```bash
curl "http://localhost:3001/api/sync/xiaolongxia?action=status"
```

---

## 配置参考

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `XIAOLONGXIA_ENDPOINT` | `http://localhost:3001` | 远程小龙虾系统地址 |
| `XIAOLONGXIA_API_KEY` | - | API 密钥（生产环境） |
| `XIAOLONGXIA_SECRET` | - | 签名密钥（生产环境） |

### 领域配置

系统支持四大领域同步：

| 领域 ID | 领域名称 | 图标 |
|---------|----------|------|
| `space` | 太空探索 | 🚀 |
| `longevity` | 长寿科技 | 🧬 |
| `ai-safety` | AI安全 | 🛡️ |
| `growth` | 个人提升 | 📈 |

### 默认同步配置

```typescript
const DEFAULT_SYNC_CONFIG: SyncConfig = {
  xiaolongxiaEndpoint: process.env.XIAOLONGXIA_ENDPOINT || 'http://localhost:3001',
  syncInterval: 300000,        // 5 分钟
  autoSync: false,            // 默认关闭
  bidirectional: true        // 双向同步
}
```

---

## 附录

### A. 完整 API 响应代码参考

| HTTP 状态码 | 说明 |
|-------------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 认证失败 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### B. 同步状态值

| 状态值 | 说明 |
|--------|------|
| `pending` | 等待同步 |
| `processing` | 同步中 |
| `completed` | 同步完成 |
| `failed` | 同步失败 |

### C. 相关文件

| 文件路径 | 说明 |
|----------|------|
| `src/app/api/sync/xiaolongxia/route.ts` | 同步 API 路由 |
| `src/lib/knowledge-base.ts` | 知识库管理器（含同步逻辑） |
| `.env.local` | 环境变量配置 |

---

*文档版本: 1.0.0*
*最后更新: 2026-03-19*
