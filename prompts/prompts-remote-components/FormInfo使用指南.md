# FormInfo 组件完整使用指南

## 目录

1. [概述](#一概述)
2. [导入方式](#二导入方式)
3. [核心组件](#三核心组件)
4. [字段类型](#四字段类型)
5. [校验规则](#五校验规则)
6. [列表组件](#六列表组件)
7. [弹窗与抽屉](#七弹窗与抽屉)
8. [分步表单](#八分步表单)
9. [表单上下文与API](#九表单上下文与api)
10. [多语言支持](#十多语言支持)
11. [最佳实践](#十一最佳实践)

---

## 一、概述

FormInfo 是一个基于 React 和 Ant Design 的企业级表单组件库，提供了完整的表单状态管理、验证和提交解决方案。

### 核心特性

- **状态管理**: 使用 React 状态管理机制管理表单状态
- **事件系统**: 使用事件发射器模式实现表单内部通信
- **字段管理**: 动态添加、更新和移除表单字段
- **验证系统**: 支持表单和字段级别的验证，内置丰富校验规则
- **拦截器**: 提供表单操作的拦截和修改能力
- **国际化**: 内置中英文语言支持

---

## 二、导入方式

### 1. 使用 createWithRemoteLoader（推荐）

```jsx
import { createWithRemoteLoader } from '@kne/remote-loader';

const FormComponent = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  // 解构需要的组件
  const { Form, SubmitButton, fields } = FormInfo;
  const { Input, TextArea, Select } = fields;

  return (
    <Form onSubmit={(data) => console.log(data)}>
      <FormInfo list={[
        <Input name="name" label="姓名" rule="REQ" />
      ]} />
      <SubmitButton>提交</SubmitButton>
    </Form>
  );
});

export default FormComponent;
```

### 2. 可用的 FormInfo 导出

| 导出 | 说明 |
|-----|-----|
| `FormInfo` | 表单信息组件（布局） |
| `Form` | 表单容器组件 |
| `SubmitButton` | 提交按钮 |
| `CancelButton` | 取消按钮 |
| `fields` | 字段组件集合 |
| `List` | 卡片式列表组件 |
| `TableList` | 表格列表组件 |
| `MultiField` | 多字段组件 |
| `FormModal` | 模态框表单组件 |
| `FormDrawer` | 抽屉表单组件 |
| `FormSteps` | 步骤表单组件 |
| `FormStepModal` | 模态框步骤表单 |
| `useFormModal` | 表单弹窗 Hook |
| `useFormDrawer` | 抽屉表单 Hook |
| `useFormStepModal` | 步骤表单弹窗 Hook |
| `useFormContext` | 表单上下文 Hook |
| `FormApiButton` | 表单 API 操作按钮 |

---

## 三、核心组件

### 1. Form 组件

表单容器组件，负责状态管理和上下文提供。

```jsx
<Form
  data={{}}                    // 初始数据对象
  onSubmit={(data) => {}}       // 提交成功回调
  onError={(errors) => {}}     // 校验失败回调
  onPrevSubmit={(data) => {}}   // 点击提交时触发（可返回 false 阻止）
  rules={{}}                    // 自定义校验规则
  lang={[]}                     // 多语言配置
  size="large"                  // 表单尺寸
  debug                         // 开启调试模式
>
  {/* 表单内容 */}
</Form>
```

**API:**

| 属性 | 说明 | 类型 | 默认值 |
|-----|-----|-----|-----|
| data | 初始数据 | object | {} |
| onSubmit | 提交成功回调 | function(data, form) | - |
| onError | 校验失败回调 | function(errors, form) | - |
| onPrevSubmit | 提交前拦截回调 | function(data) | - |
| rules | 自定义校验规则 | object | {} |
| lang | 多语言配置 | array | - |
| size | 表单尺寸 | string | - |
| debug | 开启调试 | boolean | false |

### 2. FormInfo 组件

表单字段分组和布局组件。

```jsx
<FormInfo
  title="基本信息"          // 分组标题
  subtitle="请填写..."       // 副标题
  column={2}                // 列数
  gap={24}                  // 字段间距
  list={[                   // 字段数组
    <Input name="name" label="姓名" rule="REQ" />
  ]}
  bordered                  // 是否显示边框
  block                     // 占满整行
>
```

**API:**

| 属性 | 说明 | 类型 | 默认值 |
|-----|-----|-----|-----|
| title | 分组标题 | string \| ReactNode | - |
| subtitle | 副标题 | string \| ReactNode | - |
| column | 列数 | number \| object | 2 |
| gap | 字段间距 | number | 24 |
| list | 字段列表 | ReactNode[] | [] |
| bordered | 显示边框 | boolean | false |
| block | 占满整行 | boolean | false |

---

## 四、字段类型

### 1. 基础输入类

```jsx
const { Input, InputNumber, TextArea, Password } = fields;

// 普通输入框
<Input name="username" label="用户名" rule="REQ LEN-4-16" placeholder="请输入用户名" />

// 密码输入框
<Password name="password" label="密码" rule="REQ LEN-8-20" />

// 数字输入框
<InputNumber name="age" label="年龄" min={0} max={120} />

// 文本域
<TextArea name="description" label="描述" rows={4} block />

// 大写输入框
<InputUpperCase name="code" label="编码" rule="REQ" />
```

### 2. 选择器类

```jsx
const { Select, RadioGroup, CheckboxGroup, Switch, Rate, Slider } = fields;

// 下拉选择
<Select
  name="type"
  label="类型"
  rule="REQ"
  options={[
    { label: "选项1", value: "1" },
    { label: "选项2", value: "2" }
  ]}
/>

// 单选组
<RadioGroup
  name="gender"
  label="性别"
  options={[
    { label: "男", value: "male" },
    { label: "女", value: "female" }
  ]}
  defaultValue="male"
/>

// 复选框组
<CheckboxGroup
  name="hobbies"
  label="爱好"
  options={[
    { label: "篮球", value: "basketball" },
    { label: "足球", value: "football" }
  ]}
/>

// 开关
<Switch name="enabled" label="启用" />

// 评分
<Rate name="rating" label="满意度" />

// 滑动条
<Slider name="progress" label="进度" />
```

### 3. 高级选择器

```jsx
const { AdvancedSelect, SuperSelect, SuperSelectTableList, SuperSelectUser, SuperSelectTree } = fields;

// 高级选择器（远程加载）
<AdvancedSelect
  name="user"
  label="选择用户"
  rule="REQ"
  api={{
    loader: () => ({
      pageData: [
        { id: 1, name: "张三" },
        { id: 2, name: "李四" }
      ]
    })
  }}
  nameKey="id"
  labelKey="name"
/>

// 超级选择器
<SuperSelect
  name="department"
  label="部门"
  options={[
    { label: "技术部", value: "tech" },
    { label: "产品部", value: "product" }
  ]}
  single  // 单选模式
/>

// 表格选择器
<SuperSelectTableList
  name="items"
  label="选择项目"
  columns={[
    { title: "名称", dataIndex: "name" },
    { title: "描述", dataIndex: "desc" }
  ]}
  api={{ loader: () => ({ pageData: [...] }) }}
/>

// 用户选择器
<SuperSelectUser
  name="manager"
  label="负责人"
/>

// 树形选择器
<SuperSelectTree
  name="category"
  label="分类"
  treeData={[{
    title: "根节点",
    value: "root",
    children: [...]
  }]}
/>
```

### 4. 日期时间类

```jsx
const { DatePicker, DateRangePicker, TimePicker, TimeRangePicker, DatePickerToday, MonthPicker, WeekPicker } = fields;

// 日期选择
<DatePicker
  name="birthday"
  label="出生日期"
  disabledDate={current => current && current < dayjs().startOf('day')}  // 禁止选择过去日期
/>

// 日期范围
<DateRangePicker
  name="period"
  label="时间段"
/>

// 今日起止（包含"至今"选项）
<DatePickerToday
  name="workPeriod"
  label="工作经历"
/>

// 月份选择
<MonthPicker name="month" label="月份" />

// 周选择
<WeekPicker name="week" label="周" />

// 时间选择
<TimePicker name="time" label="时间" />

// 时间范围
<TimeRangePicker name="timeRange" label="时间范围" />
```

### 5. 业务专用类

```jsx
const { PhoneNumber, MoneyInput, SalaryInput, AddressSelect, AddressInput, FunctionSelect, IndustrySelect } = fields;

// 手机号
<PhoneNumber
  name="phone"
  label="手机号"
  rule="REQ"
  format="string"  // 返回字符串格式
/>

// 金额输入
<MoneyInput
  name="amount"
  label="金额"
  precision={2}  // 精度
  prefix="¥"   // 前缀
/>

// 薪资输入
<SalaryInput
  name="salary"
  label="薪资"
/>

// 地址选择
<AddressSelect
  name="address"
  label="地址"
  level={3}  // 选择级别数
/>

// 地址输入
<AddressInput
  name="detailAddress"
  label="详细地址"
/>

// 职能选择
<FunctionSelect
  name="function"
  label="职能"
/>

// 行业选择
<IndustrySelect
  name="industry"
  label="行业"
/>
```

### 6. 上传类

```jsx
const { Upload, Avatar, Signature } = fields;

// 文件上传
<Upload
  name="file"
  label="文件"
  block
  maxLength={1}
  accept={['.xls', '.xlsx']}
  multiple={false}
  interceptor="photo-string-list"  // 转换为字符串列表
/>

// 头像上传
<Avatar
  name="avatar"
  label="头像"
  shape="circle"
/>

// 签名
<Signature
  name="signature"
  label="签名"
/>
```

### 7. 其他

```jsx
const { Cascader, ColorPicker, TreeSelect, TypeDateRangePicker } = fields;

// 级联选择
<Cascader
  name="location"
  label="地区"
  options={[{
    value: 'zhejiang',
    label: '浙江',
    children: [{
      value: 'hangzhou',
      label: '杭州'
    }]
  }]}
/>

// 颜色选择
<ColorPicker
  name="color"
  label="颜色"
/>

// 树形选择
<TreeSelect
  name="tree"
  label="树形选择"
  treeData={[{
    title: 'Node1',
    value: '0-0',
    children: [{
      title: 'Child Node1',
      value: '0-0-1'
    }]
  }]}
/>

// 带类型的日期范围
<TypeDateRangePicker
  name="dateRange"
  label="日期范围"
/>
```

---

## 五、校验规则

### 1. 内置规则

| 规则 | 说明 | 示例 |
|-----|-----|-----|
| `REQ` | 必填 | `rule="REQ"` |
| `EMAIL` | 邮箱格式 | `rule="EMAIL"` |
| `TEL` | 电话格式 | `rule="TEL"` |
| `PHONE` | 手机号格式 | `rule="PHONE"` |
| `NUM` | 数字 | `rule="NUM"` |
| `INT` | 整数 | `rule="INT"` |
| `ID_CARD` | 身份证号 | `rule="ID_CARD"` |
| `LEN-最小-最大` | 长度限制 | `rule="LEN-3-10"` |
| `LEN-0-最大` | 最大长度 | `rule="LEN-0-500"` |

### 2. 组合使用

```jsx
<Input name="email" label="邮箱" rule="REQ EMAIL" />
<Input name="username" label="用户名" rule="REQ LEN-4-16" />
<Input name="content" label="内容" rule="LEN-0-1000" />
```

### 3. 自定义规则

```jsx
<Form
  rules={{
    PASSWORD_STRENGTH: (value) => {
      const hasLetter = /[a-zA-Z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      return {
        result: hasLetter && hasNumber,
        errMsg: "密码必须包含字母和数字"
      };
    },
    REMOTE_RULE: async (value) => {
      // 异步校验
      const res = await checkValue(value);
      return { result: res };
    }
  }}
>
  <Input name="password" label="密码" rule="REQ PASSWORD_STRENGTH" />
</Form>
```

### 4. 字段通用属性

```jsx
<Input
  name="name"
  label="姓名"
  rule="REQ LEN-2-20"
  tips="请输入真实姓名"
  value="默认值"
  defaultValue="默认值"
  disabled
  readOnly
  labelHidden
  block
  placeholder="请输入"
  display={({ formData }) => formData.type === 'vip'}  // 条件显示
  onChange={(value, { formData }) => console.log(value)}
/>
```

---

## 六、列表组件

### 1. List（卡片式列表）

```jsx
import { List } from '@components/FormInfo';

<List
  name="experiences"
  title="工作经历"
  itemTitle={({ index, data }) => data?.companyName || `经历 ${index + 1}`}
  maxLength={5}
  minLength={1}
  important  // 重要样式
  addText="添加经历"
  removeText="删除"
  list={[
    <Input name="company" label="公司名称" rule="REQ" />,
    <Input name="position" label="职位" rule="REQ" />,
    <DateRangePicker name="period" label="在职时间" />,
    <TextArea name="description" label="工作描述" block />
  ]}
/>
```

**API:**

| 属性 | 说明 | 类型 | 默认值 |
|-----|-----|-----|-----|
| name | 字段名 | string | - |
| title | 列表标题 | string \| ReactNode | - |
| itemTitle | 项标题渲染 | function | - |
| list | 字段列表 | ReactNode[] | - |
| maxLength | 最大条数 | number | - |
| minLength | 最小条数 | number | - |
| important | 重要样式 | boolean | false |
| addText | 添加按钮文本 | string | 添加 |
| removeText | 删除按钮文本 | string | 删除 |

### 2. TableList（表格列表）

```jsx
import { TableList } from '@components/FormInfo';

<TableList
  name="items"
  title="明细列表"
  maxLength={10}
  addText="添加"
  removeText="删除"
  list={[
    <Input name="name" label="名称" rule="REQ" />,
    <InputNumber name="quantity" label="数量" rule="REQ" />,
    <MoneyInput name="price" label="单价" rule="REQ" />
  ]}
/>
```

### 3. MultiField（多字段）

```jsx
import { MultiField } from '@components/FormInfo';

<MultiField
  name="certificates"
  label="职业证书"
  field={Input}
  block
  addText="添加证书"
  placeholder="请输入证书名称"
/>
```

### 4. 嵌套列表

```jsx
<List
  name="projects"
  title="项目列表"
  list={[
    <Input name="projectName" label="项目名称" rule="REQ" />,
    <TableList
      name="tasks"
      title="任务列表"
      block
      list={[
        <Input name="taskName" label="任务名称" rule="REQ" />,
        <DatePicker name="deadline" label="截止日期" />
      ]}
    />
  ]}
/>
```

---

## 七、弹窗与抽屉

### 1. useFormModal（表单弹窗 Hook）

```jsx
import { createWithRemoteLoader } from '@kne/remote-loader';

const Component = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal']
})(({ remoteModules }) => {
  const [useFormModal] = remoteModules;
  const formModal = useFormModal();

  return (
    <Button onClick={() => {
      formModal({
        title: "编辑项目",
        size: "large",
        autoClose: true,  // 提交成功后自动关闭
        width: 800,
        formProps: {
          data: { field1: "默认值" },
          onSubmit: async (data) => {
            console.log(data);
            // return false 可以阻止关闭弹窗
          }
        },
        children: <FormInner />
      });
    }}>
      打开表单
    </Button>
  );
});
```

### 2. useFormDrawer（抽屉表单 Hook）

```jsx
import { createWithRemoteLoader } from '@kne/remote-loader';

const Component = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormDrawer']
})(({ remoteModules }) => {
  const [useFormDrawer] = remoteModules;
  const formDrawer = useFormDrawer();

  return (
    <Button onClick={() => {
      formDrawer({
        title: "编辑",
        width: 600,
        formProps: {
          data: { name: "初始值" },
          onSubmit: (data) => console.log(data)
        },
        children: <FormInner />
      });
    }}>
      打开抽屉
    </Button>
  );
});
```

### 3. FormModal 组件

```jsx
import { FormModal, FormInfo, Input } from '@components/FormInfo';

<FormModal
  title="编辑信息"
  open={open}
  onCancel={() => onOpenChange(false)}
  formProps={{
    data: initialData,
    onSubmit: handleSubmit
  }}
  autoClose={true}
  okText="保存"
  cancelText="取消"
  width={800}
>
  <FormInfo
    title="基本信息"
    column={2}
    list={[
      <Input name="name" label="姓名" rule="REQ" />,
      <Input name="email" label="邮箱" rule="EMAIL" />
    ]}
  />
</FormModal>
```

### 4. FormDrawer 组件

```jsx
import { FormDrawer, FormInfo, Input } from '@components/FormInfo';

<FormDrawer
  title="编辑信息"
  open={open}
  onClose={() => onOpenChange(false)}
  width={600}
  formProps={{
    data: initialData,
    onSubmit: handleSubmit
  }}
>
  <FormInfo
    list={[
      <Input name="name" label="姓名" rule="REQ" />
    ]}
  />
</FormDrawer>
```

---

## 八、分步表单

### 1. FormSteps（步骤表单）

```jsx
import { FormSteps, FormInfo, Input, SubmitButton, CancelButton } from '@components/FormInfo';

<FormSteps
  items={[
    {
      title: '基本信息',
      formProps: { data: formData },
      children: (
        <FormInfo
          title="个人资料"
          column={2}
          list={[
            <Input name="name" label="姓名" rule="REQ" />,
            <Input name="email" label="邮箱" rule="REQ EMAIL" />
          ]}
        />
      )
    },
    {
      title: '详细信息',
      formProps: { data: formData },
      children: (
        <FormInfo
          list={[
            <Input name="company" label="公司" rule="REQ" />
          ]}
        />
      )
    }
  ]}
  autoStep={true}
  onComplete={handleComplete}
  onChange={(current, data) => console.log(current, data)}
/>
```

**API:**

| 属性 | 说明 | 类型 | 默认值 |
|-----|-----|-----|-----|
| items | 步骤配置项 | array | [] |
| autoStep | 自动切换下一步 | boolean | true |
| orientation | 步骤条方向 | horizontal \| vertical | horizontal |
| onChange | 步骤切换回调 | function | - |
| onComplete | 完成回调 | function | - |

### 2. FormStepsModal（模态框步骤表单）

```jsx
import { FormStepsModal, FormInfo, Input } from '@components/FormInfo';

<FormStepsModal
  modalProps={{
    open,
    title: '分步表单',
    onCancel: () => onOpenChange(false),
    width: 900
  }}
  items={[...]}  // 同 FormSteps items
  autoStep={true}
  completeText="提交"
  nextText="下一步"
  onComplete={handleComplete}
/>
```

### 3. useFormStepModal（Hook 方式）

```jsx
import { createWithRemoteLoader } from '@kne/remote-loader';

const Component = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormStepModal']
})(({ remoteModules }) => {
  const [useFormStepModal] = remoteModules;
  const stepModal = useFormStepModal();

  return (
    <Button onClick={() => {
      stepModal({
        title: "分步表单",
        items: [...]
      });
    }}>
      打开分步表单
    </Button>
  );
});
```

---

## 九、表单上下文与API

### 1. useFormContext

```jsx
import { useFormContext } from '@components/FormInfo';

const FormActions = () => {
  const { openApi, formData } = useFormContext();

  return (
    <>
      <Button onClick={() => {
        openApi.setFields([
          { name: "name", value: "张三" },
          { name: "email", value: "test@example.com" }
        ]);
      }}>
        填充数据
      </Button>

      <Button onClick={() => openApi.validateAll()}>
        校验表单
      </Button>

      <Button onClick={() => openApi.reset()}>
        重置表单
      </Button>

      <Button onClick={() => console.log(formData)}>
        查看数据
      </Button>
    </>
  );
};
```

### 2. openApi 方法

| 方法 | 说明 | 参数 |
|-----|-----|-----|
| getFormData() | 获取表单数据 | - |
| getValue(name) | 获取字段值 | name |
| setField({ name, value }) | 设置单个字段 | name, value |
| setFields([...]) | 设置多个字段 | array |
| setFormData(data) | 设置整个表单 | object |
| validateAll() | 校验所有字段 | - |
| validate(name) | 校验单个字段 | name |
| reset() | 重置表单 | - |
| getFieldError(name) | 获取错误信息 | name |

### 3. FormApiButton

```jsx
import { FormApiButton } from '@components/FormInfo';

<FormApiButton
  onClick={({ openApi, formData }) => {
    console.log("当前数据:", formData);
    openApi.setFields([
      { name: "name", value: "新值" }
    ]);
  }}
>
  操作表单
</FormApiButton>
```

### 4. 字段关联（associations）

```jsx
<Input name="firstName" label="名" rule="REQ" />
<Input name="familyName" label="姓" rule="REQ" />
<Input
  name="fullName"
  label="全名"
  rule="REQ"
  associations={{
    fields: [{ name: 'firstName' }, { name: 'familyName' }],
    callback: ({ target, openApi }) => {
      const { firstName, familyName } = openApi.getFormData();
      openApi.setFieldValue(target, `${firstName} ${familyName}`);
    }
  }}
/>
```

---

## 十、多语言支持

### 1. Form 多语言配置

```jsx
<Form
  lang={[
    "cn",
    {
      name: "EnUS",
      label: "英文",
      options: {
        labelTransform: (label) => label + "(en)",
        ignore: [{ name: "avatar" }],
        disabled: [{ name: "file" }]
      }
    }
  ]}
>
  <FormInfo
    list={[
      <Input name="name" label="姓名" rule="REQ" />
    ]}
  />
</Form>
```

### 2. lang 配置项

| 配置 | 说明 |
|-----|-----|
| name | 语言标识 |
| label | 语言名称 |
| options.labelTransform | label 转换函数 |
| options.ignore | 忽略的字段 |
| options.disabled | 禁用的字段 |
| options.nameTransform | name 转换函数 |

---

## 十一、最佳实践

### ✅ 推荐做法

1. **使用 createWithRemoteLoader 导入**: FormInfo 必须通过 `createWithRemoteLoader` 加载
2. **禁止通过 props 传递 FormInfo**: 子组件需要使用 FormInfo 时，应自行加载
3. **字段命名**: 使用有意义的 name，支持嵌套如 `data.name`
4. **校验规则**: 组合使用内置规则，如 `"REQ LEN-3-10 EMAIL"`
5. **布局**: 使用 `column` 控制列数，常用 `column={1}` 或 `column={2}`
6. **条件渲染**: 使用 `display` 属性进行条件判断
7. **日期限制**: 使用 `dayjs` 进行日期比较，禁止过去日期
8. **列表字段**: 设置 `maxLength` 限制数量

### ❌ 错误示例

```jsx
// 错误：通过 props 传递 FormInfo
const Parent = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  return <ChildForm FormInfo={FormInfo} />;
});

const ChildForm = ({ FormInfo }) => {
  return (
    <Form>
      <FormInfo list={[...]} />
    </Form>
  );
};
```

### ✅ 正确示例

```jsx
// 正确：子组件自行加载 FormInfo
const Parent = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  return <ChildForm />;
});

const ChildForm = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  return (
    <Form>
      <FormInfo list={[...]} />
    </Form>
  );
});
```

---

## 附录

### 完整示例：员工信息表单

```jsx
import { createWithRemoteLoader } from '@kne/remote-loader';

const EmployeeForm = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules }) => {
  const [FormInfo] = remoteModules;
  const { Form, SubmitButton, CancelButton, fields } = FormInfo;
  const { Input, TextArea, Select, DatePicker, PhoneNumber, List, TableList } = fields;

  return (
    <Form
      data={{ employeeId: 'EMP001' }}
      onSubmit={async (data) => {
        console.log('提交数据:', data);
      }}
    >
      <FormInfo
        title="基本信息"
        subtitle="请填写员工基本个人信息"
        column={2}
        gap={20}
        list={[
          <Input name="employeeId" label="工号" rule="REQ" disabled />,
          <Input name="name" label="姓名" rule="REQ" placeholder="请输入姓名" />,
          <PhoneNumber name="phone" label="手机号" rule="REQ" />,
          <Input name="email" label="邮箱" rule="REQ EMAIL" />,
          <DatePicker name="birthday" label="出生日期" />,
          <Select
            name="department"
            label="部门"
            rule="REQ"
            options={[
              { label: "技术部", value: "tech" },
              { label: "产品部", value: "product" }
            ]}
          />
        ]}
      />

      <List
        name="workExperience"
        title="工作经历"
        itemTitle={({ index, data }) => data?.companyName || `经历 ${index + 1}`}
        maxLength={5}
        important
        addText="添加经历"
        list={[
          <Input name="companyName" label="公司名称" rule="REQ" />,
          <Input name="jobTitle" label="职位" rule="REQ" />,
          <DatePicker name="period" label="在职时间" />,
          <TextArea name="description" label="工作描述" block />
        ]}
      />

      <TableList
        name="familyMembers"
        title="家庭成员"
        maxLength={5}
        addText="添加成员"
        list={[
          <Input name="name" label="姓名" rule="REQ" />,
          <Input name="relationship" label="关系" rule="REQ" />,
          <PhoneNumber name="phone" label="电话" />
        ]}
      />

      <FormInfo
        title="紧急联系人"
        column={3}
        list={[
          <Input name="emergencyContact" label="姓名" rule="REQ" />,
          <Input name="emergencyRelation" label="关系" rule="REQ" />,
          <PhoneNumber name="emergencyPhone" label="电话" rule="REQ TEL" />
        ]}
      />

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <CancelButton>取消</CancelButton>
        <SubmitButton type="primary">提交</SubmitButton>
      </div>
    </Form>
  );
});

export default EmployeeForm;
```
