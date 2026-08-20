### API 文档

#### 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| option | object | - | ECharts 配置对象（必需） |
| loading | ReactNode | - | 自定义加载状态组件 |
| error | ReactNode | - | 自定义错误状态组件 |
| className | string | - | 自定义样式类名 |
| style | object | - | 自定义内联样式 |

#### 注意事项

- option 更新时会自动重新渲染图表
- 如果 ECharts 库未成功加载，会显示错误状态
- 组件会自动处理图表的初始化和销毁

#### option 配置

option 对象遵循 ECharts 官方配置规范，主要包含以下部分：

| 配置项 | 类型 | 说明 |
|--------|------|------|
| title | object | 图表标题配置 |
| tooltip | object | 提示框配置 |
| legend | object | 图例配置 |
| grid | object | 直角坐标系网格配置 |
| xAxis | array | X轴配置 |
| yAxis | array | Y轴配置 |
| series | array | 系列列表（核心数据配置） |

#### 常用图表类型示例

```javascript
// 柱状图
const barOption = {
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [120, 200, 150] }]
};

// 折线图  
const lineOption = {
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
  yAxis: { type: 'value' },
  series: [{ type: 'line', data: [120, 200, 150] }]
};

// 饼图
const pieOption = {
  series: [{
    type: 'pie',
    data: [{ value: 1048, name: '搜索引擎' }, { value: 735, name: '直接访问' }]
  }]
};

#### Echart.WordCloud

简化词云调用。不必手写 `type: 'custom'` / `renderItem: 'wordCloud'` / `coordinateSystem: 'none'`。

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| data | array | [] | 词条。支持 `{ name, value, color, fontWeight }`、`[name, value, color]` |
| shape | string | 'circle' | 云形状：circle / cardioid / diamond / triangle / pentagon / star |
| sizeRange | [number, number] | [12, 36] | 字号范围 |
| rotationRange | [number, number] | [0, 0] | 旋转角度范围（度） |
| gridSize | number | 8 | 词间距网格 |
| tooltip | boolean \| object | true | `true` 显示默认 tooltip；也可传入 ECharts tooltip 配置 |
| option | object | - | 额外 ECharts option，会与生成配置合并 |
| style / className / loading / error | 同 Echart | - | 透传给 Echart |

```javascript
const { default: Echart } = _Echart;

<Echart.WordCloud
  style={{ height: 320 }}
  data={[
    { name: '标签A', value: 120, color: '#5470c6' },
    { name: '标签B', value: 80, color: '#91cc75' },
    ['标签C', 60]
  ]}
/>
```

#### 注意事项

- 组件会自动处理图表的大小调整
- ECharts 核心库通过远程动态加载
- option 更新时会自动重新渲染图表