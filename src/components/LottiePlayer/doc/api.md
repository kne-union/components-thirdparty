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
