import React from 'react';
import MotionBackgroundRenderer from './MotionBackgroundRenderer.jsx';
import { useBackgroundSettings } from './useBackgroundSettings.js';

export default function SectionWithMotionBackground({ section, className='', as: Tag='div', children }) {
  const { settings } = useBackgroundSettings();
  return <Tag className={`motion-section motion-section-${section} ${className}`}>
    <MotionBackgroundRenderer section={section} settings={settings}/>
    <div className="motion-content">{children}</div>
  </Tag>;
}
