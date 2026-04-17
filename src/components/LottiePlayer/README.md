# LottiePlayer

### 概述

### 组件概述

LottiePlayer 是基于 Lottie Web 的动画播放器组件，用于播放 Adobe After Effects 导出的动画文件。该组件支持 JSON 格式的动画数据，提供了流畅的动画播放体验。

### 主要特性

- 支持外部动画文件路径加载
- 支持内联动画数据
- 可配置循环播放
- 支持多种渲染模式：Canvas、SVG、HTML
- 自动播放控制
- 资源自动清理
- 支持自定义样式和属性

### 使用场景

适用于需要展示动画效果的应用，如加载动画、交互反馈、数据可视化动画、UI 动画效果等场景。支持从 URL 加载动画文件或直接使用动画数据。


### 示例

#### 示例代码

- 这里填写示例标题
- 这里填写示例说明
- _LottiePlayer(@components/LottiePlayer),_data(@components/LottiePlayer/doc/hello_animation.json)

```jsx
const { default: LottiePlayer } = _LottiePlayer;
const { default: data } = _data;

console.log(data);

const BaseExample = () => {
  return <LottiePlayer animationData={data}/>;
};

render(<BaseExample />);

```

### API

### API 文档

#### 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| path | string | - | 动画文件路径（URL） |
| animationData | object | - | 动画数据对象（JSON格式） |
| loop | boolean | true | 是否循环播放 |
| renderer | string | 'canvas' | 渲染模式，可选 'canvas'、'svg'、'html' |
| autoplay | boolean | true | 是否自动播放 |

#### 渲染模式说明

| 渲染模式 | 说明 | 特点 |
|----------|------|------|
| canvas | Canvas 渲染 | 性能较好，适合复杂动画 |
| svg | SVG 渲染 | 矢量图形，支持缩放 |
| html | HTML 渲染 | DOM 元素渲染，适合简单动画 |

#### 使用示例

```javascript
// 使用外部文件
<LottiePlayer 
  path="/animations/loading.json"
  loop={true}
  renderer="svg"
/>

// 使用内联数据
<LottiePlayer 
  animationData={animationJson}
  loop={false}
  renderer="canvas"
/>
```

#### 注意事项

- path 和 animationData 必须提供其中一个
- 动画文件必须是 Lottie 兼容的 JSON 格式
- 组件会自动处理动画的销毁和清理
