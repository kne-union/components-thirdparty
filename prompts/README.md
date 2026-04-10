# Prompts 文档索引

本目录汇集了前端组件库开发相关的 AI 提示词文档，用于指导生成代码模块、文档、示例及完成国际化改造。

**已安装集合**: `@kne/prompts-remote-components@1.0.2`

---

## 文档集合列表

### 1. prompts-remote-components

**功能**: 远程组件库开发全流程提示词集合，覆盖业务模块生成、表单构建、远程加载、国际化、文档生成和示例编写

**适用场景**:
- 生成包含完整 CRUD 功能的前端业务模块
- 构建复杂表单页面（验证、动态字段、弹窗/抽屉）
- 构建微前端架构，运行时动态加载远程模块
- 为组件添加多语言支持
- 为组件自动生成项目概述和 API 文档
- 编写规范的组件示例代码和配置

**核心内容**:
- BizUnit 架构模式业务模块生成
- FormInfo 企业级表单组件使用
- RemoteLoader 远程模块加载
- 组件国际化改造
- 项目文档自动生成
- 组件示例编写规范

**详细索引**: [prompts-remote-components/README.md](./prompts-remote-components/README.md)

---

### 2. 组件示例编写提示词（根目录）

**功能**: 指导编写规范的组件示例代码和配置

**适用场景**:
- 为组件编写可运行的示例代码
- 配置 example.json 示例配置文件
- 编写覆盖 API 的完整示例

**核心内容**:
- 文件结构规范（doc/ 目录、子组件示例规则）
- example.json 配置结构
- 示例代码规范（scope 依赖声明、导入方式）
- 示例内容设计原则（API 覆盖率、真实业务场景、数据真实性）
- FormInfo 组件示例特殊规则
- 示例完整性检查清单

**详细文档**: [组件示例编写提示词.md](./组件示例编写提示词.md)

---

### 3. 生成README索引

**功能**: 指导从包含多个子目录的文档目录生成结构清晰、便于查阅的索引文档

**适用场景**:
- 需要为文档目录自动生成索引
- 多个子目录各有独立文档，需要汇总导航

**核心内容**:
- 扫描源目录识别 README.md
- 分析子目录结构提取核心用途
- 统一模板组织索引信息
- 导航辅助和决策表格设计

**详细文档**: [生成README索引.md](./生成README索引.md)

---

## 快速选择指南

| 需求 | 推荐文档 | 所属集合 |
|------|----------|----------|
| 生成完整的业务模块（列表+表单+详情） | [BizUnit使用指南](./prompts-remote-components/BizUnit使用指南.md) | prompts-remote-components |
| 构建表单页面（验证、动态字段、弹窗） | [FormInfo使用指南](./prompts-remote-components/FormInfo使用指南.md) | prompts-remote-components |
| 加载远程组件/微前端 | [RemoteLoader使用指南](./prompts-remote-components/RemoteLoader用指南.md) | prompts-remote-components |
| 为组件添加多语言支持 | [国际化](./prompts-remote-components/国际化.md) | prompts-remote-components |
| 为组件生成项目概述和 API 文档 | [生成文档](./prompts-remote-components/生成文档.md) | prompts-remote-components |
| 编写组件示例代码和配置 | [组件示例编写提示词](./prompts-remote-components/组件示例编写提示词.md) | prompts-remote-components |
| 为文档目录生成索引导航 | [生成README索引](./生成README索引.md) | 根目录 |
