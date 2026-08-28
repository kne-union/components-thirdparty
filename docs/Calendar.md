# Calendar

### 概述

### 组件概述

Calendar 是一个基于 FullCalendar 的日历组件，提供了丰富的日历展示和交互功能。该组件支持多种视图模式（月视图、周视图、日视图、列表视图），并集成了拖拽、点击等交互操作。

### 主要特性

- 支持多种视图模式：月视图、周视图、日视图、列表视图
- 自动调整大小，响应式设计
- 中文本地化支持
- 事件内容工具提示显示
- 自定义事件渲染
- 支持日期点击和事件点击回调
- 集成 dayjs 进行日期处理
- 可配置的工具栏按钮

### 使用场景

适用于需要展示和管理日程安排的各类应用，如会议管理系统、活动预约平台、个人日程管理等场景。

### 示例

#### 示例代码

- 这里填写示例标题
- 这里填写示例说明
- _Calendar(@components/Calendar)

```jsx
const { default: Calendar } = _Calendar;
const BaseExample = () => {
  return <Calendar />;
};

render(<BaseExample />);

```

### API

### API 文档

#### 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| className | string | - | 自定义样式类名 |
| initialView | string | 'dayGridMonth' | 初始视图模式 |
| aspectRatio | number | 1.6 | 日历宽高比 |
| weekends | boolean | true | 是否显示周末 |
| slotEventOverlap | boolean | false | 时间槽事件是否允许重叠 |
| displayEventEnd | boolean | true | 是否显示事件结束时间 |
| editable | boolean | false | 事件是否可编辑 |
| firstDay | number | 1 | 一周的第一天（0=周日，1=周一） |
| headerToolbar | object | 见下方 | 工具栏配置 |
| buttonText | object | 见下方 | 按钮文本配置 |
| dayMinWidth | number | 100 | 日单元格最小宽度 |
| locale | string | 'zh-cn' | 语言本地化 |
| height | string | 'auto' | 日历高度 |
| handleWindowResize | boolean | false | 是否处理窗口大小变化 |
| dateClick | function | () => {} | 日期点击回调 |
| eventClick | function | () => {} | 事件点击回调 |
| eventContent | function | 自定义渲染 | 事件内容渲染函数 |
| initialDate | string | 当前日期 | 初始日期 |

#### 默认配置

```javascript
// headerToolbar 默认配置
{
  left: 'prev,next today',
  center: 'title', 
  right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
}

// buttonText 默认配置
{
  today: '今天',
  month: '月',
  week: '周', 
  day: '天'
}
```

#### Ref 方法

通过 ref 可以获取 FullCalendar 的 API 实例，支持调用所有 FullCalendar 的原生方法。
