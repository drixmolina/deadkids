import React from 'react';
import { defaultBackgroundSettings, mergeBackgroundSettings } from './backgroundConfig.js';
import MotionBackgroundRenderer from './MotionBackgroundRenderer.jsx';

export default function BackgroundPreview({ section, draft }) {
  const settings = mergeBackgroundSettings(draft || defaultBackgroundSettings);
  return <div className="background-preview">
    <MotionBackgroundRenderer section={section} settings={settings} preview/>
    <div className="background-preview-content">
      <p>Preview</p>
      <strong>{section}</strong>
      <span>Text and buttons stay above the motion layer.</span>
    </div>
  </div>;
}
