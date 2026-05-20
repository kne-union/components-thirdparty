### API 文档

#### 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| src | string | 必填 | 3D模型文件路径（仅支持 .glb 格式） |
| poster | string | - | 加载前的预览图片路径 |
| alt | string | '3D model' | 模型描述文字，用于无障碍访问 |
| autoRotate | boolean | false | 是否自动旋转模型 |
| cameraControls | boolean | true | 是否启用相机控制（拖拽、缩放等） |
| disableZoom | boolean | false | 是否禁用缩放功能 |
| loading | string | 'auto' | 加载模式：'auto'、'lazy'、'eager' |
| reveal | string | 'auto' | 模型显示时机：'auto'、'interaction'、'manual' |
| backgroundColor | string | '#f5f5f5' | 背景颜色 |
| shadowIntensity | number | 1 | 阴影强度（0-1） |
| shadowSoftness | number | 1 | 阴影柔和度（0-1） |
| exposure | number | 1 | 曝光度 |
| className | string | - | 自定义类名 |
| style | object | - | 自定义样式 |

#### 使用示例

```jsx
// 基础用法
<ModelView src="/3d/model.glb" />

// 带预览图和自动旋转
<ModelView 
  src="/3d/model.glb"
  poster="/3d/model-poster.jpg"
  autoRotate
/>

// 禁用相机控制，自定义背景
<ModelView 
  src="/3d/model.glb"
  cameraControls={false}
  backgroundColor="#1a1a1a"
  shadowIntensity={0.5}
/>
```

#### 注意事项

- 模型文件仅支持 GLB 格式
- 首次使用会自动加载 model-viewer 库
- 建议配合 poster 属性提供加载预览图
- cameraControls 和 autoRotate 可以同时启用
