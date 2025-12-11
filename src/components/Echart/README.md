
# Echart


### 概述

### 组件概述

Echart 是基于 Apache ECharts 的图表组件，提供了丰富的数据可视化功能。该组件封装了 ECharts 的初始化、配置更新和响应式调整等核心功能，简化了图表的使用流程。

### 主要特性

- 支持所有 ECharts 图表类型
- 自动响应式调整大小
- 动态加载 ECharts 核心库
- 支持自定义加载和错误状态
- 高性能渲染
- 丰富的配置选项
- 支持图表事件交互

### 使用场景

适用于需要数据可视化的各类应用，如数据报表、业务分析、监控面板、统计图表等场景。支持柱状图、折线图、饼图、散点图、地图等多种图表类型。

### 示例

#### 示例代码

- 这里填写示例标题
- 这里填写示例说明
- _Echart(@components/Echart)

```jsx
const { default: Echart } = _Echart;
const BaseExample = () => {
  return (
    <>
      <Echart
        style={{ height: '400px' }}
        option={{
          xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              data: [820, 932, 901, 934, 1290, 1330, 1320],
              type: 'line',
              smooth: true
            }
          ]
        }}
      />
      <Echart
        style={{ height: '400px' }}
        option={{
          xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              data: [120, 200, 150, 80, 70, 110, 130],
              type: 'bar'
            }
          ]
        }}
      />
    </>
  );
};

render(<BaseExample />);

```

- 动态数据
- 动态数据
- _Echart(@components/Echart)

```jsx
const { default: Echart } = _Echart;
const { useState, useEffect } = React;
const BaseExample = () => {
  const [option, setOption] = useState({
    series: [
      {
        type: 'gauge',
        min: 0,
        max: 100,
        splitNumber: 10,
        radius: '80%',
        axisLine: {
          lineStyle: {
            color: [[1, '#f00']],
            width: 3
          }
        },
        splitLine: {
          distance: -18,
          length: 18,
          lineStyle: {
            color: '#f00'
          }
        },
        axisTick: {
          distance: -12,
          length: 10,
          lineStyle: {
            color: '#f00'
          }
        },
        axisLabel: {
          distance: -50,
          color: '#f00',
          fontSize: 25
        },
        anchor: {
          show: true,
          size: 20,
          itemStyle: {
            borderColor: '#000',
            borderWidth: 2
          }
        },
        pointer: {
          offsetCenter: [0, '10%'],
          icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
          length: '115%',
          itemStyle: {
            color: '#000'
          }
        },
        detail: {
          valueAnimation: true,
          precision: 1
        },
        title: {
          offsetCenter: [0, '-50%']
        },
        data: [
          {
            value: 58.46,
            name: 'PLP'
          }
        ]
      },
      {
        type: 'gauge',
        min: 0,
        max: 60,
        splitNumber: 6,
        axisLine: {
          lineStyle: {
            color: [[1, '#000']],
            width: 3
          }
        },
        splitLine: {
          distance: -3,
          length: 18,
          lineStyle: {
            color: '#000'
          }
        },
        axisTick: {
          distance: 0,
          length: 10,
          lineStyle: {
            color: '#000'
          }
        },
        axisLabel: {
          distance: 10,
          fontSize: 25,
          color: '#000'
        },
        pointer: {
          show: false
        },
        title: {
          show: false
        },
        anchor: {
          show: true,
          size: 14,
          itemStyle: {
            color: '#000'
          }
        }
      }
    ]
  });
  useEffect(() => {
    const timer = setInterval(function () {
      setOption({
        series: [
          {
            type: 'gauge',
            data: [
              {
                value: +(Math.random() * 100).toFixed(2),
                name: 'PLP'
              }
            ]
          }
        ]
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);
  return (
    <>
      <Echart style={{ height: '600px' }} option={option} />
    </>
  );
};

render(<BaseExample />);

```


### API

### API 文档

#### 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| option | object | - | ECharts 配置对象（必需） |
| loading | ReactNode | - | 自定义加载状态组件 |
| error | ReactNode | - | 自定义错误状态组件 |
| className | string | - | 自定义样式类名 |
| style | object | - | 自定义内联样式 |

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
```

#### 注意事项

- 组件会自动处理图表的大小调整
- ECharts 核心库通过远程动态加载
- option 更新时会自动重新渲染图表
