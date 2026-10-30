# CodeEditor

### 概述

### 组件概述

CodeEditor 是基于 Monaco Editor 的代码编辑器组件，提供了强大的代码编辑功能。Monaco Editor 是 VS Code 的编辑器核心，支持语法高亮、代码补全、错误检测等特性。

### 主要特性

- 支持多种编程语言的语法高亮
- 智能代码补全
- 错误检测和提示
- 可自定义编辑器主题
- 支持代码格式化
- 可配置的编辑器高度
- 支持外部 Monaco Editor 路径配置

### 使用场景

适用于需要代码编辑功能的应用，如在线编程平台、配置编辑器、代码示例展示、开发工具等场景。

### 示例

#### 示例代码

- 基础用法
- 编辑一段排版凌乱的订单金额计算函数，点击左下角的「格式化」浮层（或按 Shift + Alt + F）即可一键整理代码，浮层默认开启
- _CodeEditor(@components/CodeEditor)

```jsx
const { default: CodeEditor } = _CodeEditor;

const messyCode = &#96;const calcOrderAmount=(order)=>{
const {items=[],coupon}=order;
  const total=items.reduce((sum,{price,quantity})=>sum+price*quantity,0);
if(coupon&&total>=coupon.threshold){return total-coupon.discount}
      return total;
};

export default calcOrderAmount;
&#96;;

const BaseExample = () => {
  return <CodeEditor height={300} defaultLanguage="javascript" defaultValue={messyCode} />;
};

render(<BaseExample />);

```

- 多语言与受控模式
- 通过 language、path 切换 JSON / CSS / HTML / Markdown，用 value + onChange 受控保存每种语言的内容；没有内置格式化器的语言（如 Markdown）不展示格式化按钮
- _CodeEditor(@components/CodeEditor),antd(antd)

```jsx
const { default: CodeEditor } = _CodeEditor;
const { Flex, Segmented, Typography } = antd;
const { useState } = React;

const files = {
  json: {
    label: 'JSON',
    code: '{"jobTitle":"高级前端工程师","department":"技术部","city":"上海","salary":{"min":25000,"max":40000},"skills":["React","TypeScript","Webpack"]}'
  },
  css: {
    label: 'CSS',
    code: '.candidate-card{display:flex;gap:12px;padding:16px;border-radius:8px}.candidate-card .name{font-weight:600;color:#262626}'
  },
  html: {
    label: 'HTML',
    code: '<div class="offer"><h2>录用通知</h2><p>张三，您好：</p><p>恭喜您通过技术部的面试，入职日期为 2026-11-16。</p></div>'
  },
  markdown: {
    label: 'Markdown',
    code: '# 面试反馈\n\n- 候选人：李四\n- 岗位：产品经理\n- 结论：**建议进入终面**\n'
  }
};

const LanguageExample = () => {
  const [language, setLanguage] = useState('json');
  const [values, setValues] = useState(() => Object.fromEntries(Object.entries(files).map(([key, { code }]) => [key, code])));
  return (
    <Flex vertical gap={12}>
      <Segmented value={language} onChange={setLanguage} options={Object.entries(files).map(([value, { label }]) => ({ label, value }))} />
      <CodeEditor
        height={240}
        path={&#96;demo.${language}&#96;}
        language={language}
        value={values[language]}
        onChange={value => setValues(current => Object.assign({}, current, { [language]: value }))}
      />
      <Typography.Text type="secondary">
        当前 {files[language].label} 内容共 {(values[language] || '').length} 个字符；Markdown 没有内置格式化器，切换过去后格式化按钮自动隐藏。
      </Typography.Text>
    </Flex>
  );
};

render(<LanguageExample />);

```

- 主题、编辑器配置与格式化开关
- 展示 theme、options、loading 的用法，并通过 formatActionOpen 控制格式化浮层；options.readOnly 为 true 时浮层自动隐藏。注意 Monaco 的 theme 是全局的，切换后同页面所有编辑器一起生效
- _CodeEditor(@components/CodeEditor),antd(antd)

```jsx
const { default: CodeEditor } = _CodeEditor;
const { Flex, Switch, Space, Typography } = antd;
const { useState } = React;

const tsCode = &#96;// 统计各部门本月入职人数
interface Employee { name: string; department: string; entryDate: string }

export const countHiredByDepartment=(list:Employee[],month:string)=>list
.filter(({entryDate})=>entryDate.startsWith(month))
.reduce<Record<string,number>>((result,{department})=>({...result,[department]:(result[department]||0)+1}),{});
&#96;;

const OptionsExample = () => {
  const [dark, setDark] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [formatActionOpen, setFormatActionOpen] = useState(true);
  return (
    <Flex vertical gap={12}>
      <Space size={24} wrap>
        <Space>
          <Switch checked={dark} onChange={setDark} />
          <Typography.Text>暗色主题</Typography.Text>
        </Space>
        <Space>
          <Switch checked={readOnly} onChange={setReadOnly} />
          <Typography.Text>只读（自动隐藏格式化浮层）</Typography.Text>
        </Space>
        <Space>
          <Switch checked={formatActionOpen} onChange={setFormatActionOpen} />
          <Typography.Text>显示格式化浮层</Typography.Text>
        </Space>
      </Space>
      <CodeEditor
        height={220}
        defaultLanguage="typescript"
        defaultValue={tsCode}
        theme={dark ? 'vs-dark' : 'light'}
        formatActionOpen={formatActionOpen}
        loading={<Typography.Text type="secondary">编辑器加载中...</Typography.Text>}
        options={{
          readOnly,
          fontSize: 14,
          wordWrap: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false
        }}
      />
    </Flex>
  );
};

render(<OptionsExample />);

```

- 通过 Ref 操作编辑器
- 关闭内置浮层，改由外部按钮调用 ref 上的 setValue、format、getValue、getEditor，适合把格式化集成到自定义工具栏的场景
- _CodeEditor(@components/CodeEditor),antd(antd)

```jsx
const { default: CodeEditor } = _CodeEditor;
const { Flex, Button, Space, Typography, message } = antd;
const { useRef, useState } = React;

const templates = {
  interview: '{"title":"面试邀约","receiver":"王芳","time":"2026-11-05 14:00","location":"上海市徐汇区漕河泾开发区 A 座 8 楼","interviewer":["赵磊","陈静"]}',
  offer: '{"title":"录用通知","receiver":"张伟","position":"Java 开发工程师","entryDate":"2026-11-16","probationMonths":3}'
};

const RefExample = () => {
  const editorRef = useRef(null);
  const [output, setOutput] = useState('');
  return (
    <Flex vertical gap={12}>
      <Space wrap>
        <Button onClick={() => editorRef.current.setValue(templates.interview)}>载入面试邀约</Button>
        <Button onClick={() => editorRef.current.setValue(templates.offer)}>载入录用通知</Button>
        <Button
          onClick={async () => {
            const formatted = await editorRef.current.format();
            formatted || message.info('当前语言暂不支持格式化');
          }}>
          调用 format()
        </Button>
        <Button
          type="primary"
          onClick={() => {
            try {
              setOutput(JSON.stringify(JSON.parse(editorRef.current.getValue())));
            } catch (e) {
              message.error('内容不是合法的 JSON');
            }
          }}>
          读取并压缩 getValue()
        </Button>
        <Button
          onClick={() => {
            const editor = editorRef.current.getEditor();
            editor.setSelection(editor.getModel().getFullModelRange());
            editor.focus();
          }}>
          getEditor() 全选
        </Button>
      </Space>
      <CodeEditor ref={editorRef} height={240} defaultLanguage="json" defaultValue={templates.interview} formatActionOpen={false} />
      {output && <Typography.Paragraph copyable code>{output}</Typography.Paragraph>}
    </Flex>
  );
};

render(<RefExample />);

```

### API

### API 文档

#### 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| height | number \| string | 500 | 编辑器高度，支持 `'100%'` 等字符串 |
| formatActionOpen | boolean | true | 是否在左下角显示「格式化」浮层。格式化依赖 Monaco 内置格式化器（JSON、JavaScript、TypeScript、CSS、HTML 等），当前语言不支持格式化或 `options.readOnly` 为 true 时不展示 |
| defaultLanguage | string | - | 默认编程语言 |
| defaultValue | string | - | 默认代码内容 |
| value | string | - | 受控的代码内容 |
| onChange | function | - | 内容变化回调函数 |
| theme | string | - | 编辑器主题 |
| options | object | - | Monaco Editor 配置选项 |
| loading | ReactNode | - | 自定义加载组件 |
| path | string | - | 文件路径，用于语言检测 |

#### Ref 方法

通过 ref 可以访问编辑器的实例方法：

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| getValue | - | string | 获取编辑器内容 |
| setValue | value: string | - | 设置编辑器内容 |
| format | - | Promise\<boolean\> | 格式化当前内容，当前语言不支持格式化时返回 false |
| getEditor | - | Editor | 获取 Monaco Editor 实例 |
| getMonaco | - | Monaco | 获取 Monaco 命名空间 |

#### 全局配置

组件支持通过 `window.MONACO_EDITOR_DIR` 全局变量配置 Monaco Editor 的路径：

```javascript
window.MONACO_EDITOR_DIR = '/path/to/monaco-editor';
```

#### Monaco Editor 常用配置选项

```javascript
const options = {
  fontSize: 14,           // 字体大小
  wordWrap: 'on',         // 自动换行
  minimap: { enabled: false }, // 禁用小地图
  scrollBeyondLastLine: false, // 禁止滚动到最后一行之后
  automaticLayout: true   // 自动布局
};
```