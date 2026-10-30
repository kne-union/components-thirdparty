import { useId } from 'react';
import classnames from 'classnames';

// 彩色 AI 图标（渐变底 + 白色 AI 字样），尺寸跟随字号（1em），可直接作为 antd Button 的 icon
const AiIcon = ({ className, style }) => {
  const gradientId = `ai-icon-gradient-${useId().replace(/:/g, '')}`;
  return (
    <span role="img" aria-hidden="true" className={classnames('anticon', className)} style={style}>
      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" focusable="false">
        <defs>
          <linearGradient id={gradientId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4f8cff" />
            <stop offset="0.5" stopColor="#9b5cff" />
            <stop offset="1" stopColor="#ff5c9a" />
          </linearGradient>
        </defs>
        <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill={`url(#${gradientId})`} />
        <path
          d="M5.5 17 9.25 7l3.75 10M6.9 13.4h4.7M17 7v10"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
};

export default AiIcon;
