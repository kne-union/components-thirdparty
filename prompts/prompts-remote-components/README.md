# Prompts 文档索引

本项目包含多个 AI prompts 文档，用于指导生成前端组件库相关的代码模块、文档和示例。

## 文档列表

### 1. BizUnit使用指南

**功能**: 生成基于 BizUnit 架构模式的完整前端业务模块

**适用场景**:

- 需要生成包含完整 CRUD 功能的前端业务模块
- 需要国际化支持和可复用组件结构
- 生成符合规范的目录结构和文档示例

**核心内容**:

- 模块目录结构规范（List、Detail、FormInner、TabDetail、Actions 等组件）
- 核心组件实现规范（根组件、列表页、表单组件、详情页、Tab 详情页）
- 国际化文件规范（中英文语言包）
- API 集成规范
- 文档示例规范

**使用方式**: 阅读 [BizUnit使用指南](./prompts/BizUnit使用指南.md) 了解完整的模块生成规范

---

### 2. RemoteLoader使用指南

**功能**: 远程模块加载库的使用指南，基于 Webpack 5 Module Federation

**适用场景**:

- 构建微前端架构
- 需要在运行时动态加载远程模块
- 多团队独立开发部署模块的场景

**核心内容**:

- 四种使用方式：RemoteLoader 组件、withRemoteLoader HOC、useLoader Hook、createWithRemoteLoader
- 模块标记格式详解
- API 参考（preset、loadModule、safeLoadModule、parseToken 等）
- 缓存机制
- 错误处理和调试
- 性能优化

**使用方式**: 阅读 [RemoteLoader使用指南](./prompts/RemoteLoader用指南.md) 了解完整的使用方法

---

### 3. FormInfo使用指南

**功能**: 基于 React 和 Ant Design 的企业级表单组件库

**适用场景**:

- 构建复杂的表单页面
- 需要表单验证、动态字段、弹窗/抽屉表单
- 分步表单向导

**核心内容**:

- 核心组件：Form、FormInfo、SubmitButton、CancelButton
- 字段类型：Input、TextArea、Select、DatePicker、Upload 等
- 校验规则配置
- 列表组件：List（卡片式）、TableList（表格）
- 弹窗与抽屉：FormModal、FormDrawer
- 分步表单：FormSteps、FormStepModal
- 表单 Hook：useFormModal、useFormDrawer、useFormStepModal
- 国际化支持

**使用方式**: 阅读 [FormInfo使用指南](./prompts/FormInfo使用指南.md) 了解完整的使用方法

---

### 4. 国际化

**功能**: 指导组件完成国际化改造

**适用场景**:

- 需要为组件添加多语言支持
- 创建语言包和国际化上下文
- 修改组件以支持国际化

**核心内容**:

- 国际化文件创建（withLocale.js、locale/zh-CN.js、locale/en-US.js）
- 组件修改模式（主组件、FormInner、getColumns、Action）
- useIntl Hook 和 withLocale HOC 使用方式
- createWithRemoteLoader 组件的国际化包裹规范
- 语言包 key 命名规范
- 检查要点清单

**使用方式**: 阅读 [国际化](./prompts/国际化.md) 了解国际化改造规范

---

### 5. 生成文档

**功能**: 根据代码实现自动生成项目文档（summary.md 和 api.md）

**适用场景**:

- 需要为组件生成规范化的项目概述文档
- 需要生成 API 属性表格文档
- 组件开发完成后需要补充文档

**核心内容**:

- 项目概述文档（doc/summary.md）格式规范
- API 文档（doc/api.md）格式规范
- 文档生成流程（分析代码结构、提取 API 信息）
- 格式约束（标题级别、表格格式、无示例代码）

**使用方式**: 阅读 [生成文档](./prompts/生成文档.md) 了解文档生成规范

---

### 6. 组件示例编写提示词

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

**使用方式**: 阅读 [组件示例编写提示词](./prompts/组件示例编写提示词.md) 了解示例编写规范

---

## 如何选择

| 需求                  | 使用文档             |
|---------------------|------------------|
| 生成完整的业务模块（列表+表单+详情） | BizUnit使用指南      |
| 加载远程组件/微前端          | RemoteLoader使用指南 |
| 构建表单页面（验证、动态字段、弹窗）  | FormInfo使用指南     |
| 为组件添加多语言支持          | 国际化              |
| 为组件生成项目概述和 API 文档   | 生成文档             |
| 编写组件示例代码和配置         | 组件示例编写提示词        |
