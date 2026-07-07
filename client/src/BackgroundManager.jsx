import React, { useMemo, useState } from 'react';
import { backgroundPresets, backgroundSections, backgroundTypes, defaultBackgroundSettings, mergeBackgroundSettings } from './backgroundConfig.js';
import { useBackgroundSettings } from './useBackgroundSettings.js';
import BackgroundPreview from './BackgroundPreview.jsx';

const intensityOptions = ['low', 'medium', 'high'];

export default function BackgroundManager() {
  const { settings, setSettings, save, reset, loading } = useBackgroundSettings();
  const [section, setSection] = useState('hero');
  const [copyFrom, setCopyFrom] = useState('hero');
  const draft = mergeBackgroundSettings(settings);
  const current = draft.sections[section];
  const presetNames = useMemo(() => Object.keys(backgroundPresets), []);

  const updateGlobal = changes => setSettings({ ...draft, ...changes });
  const updateSection = changes => setSettings({ ...draft, sections: { ...draft.sections, [section]: { ...current, ...changes } } });
  const applyPreset = preset => updateSection(backgroundPresets[preset]);
  const applyAll = () => {
    const sections = {};
    for (const [key] of backgroundSections) sections[key] = { ...draft.sections[key], ...current };
    setSettings({ ...draft, sections });
  };
  const copySettings = () => updateSection(draft.sections[copyFrom]);

  const colorFields = [
    ['base', 'Main color'],
    ['accent', 'Brand glow color'],
    ['secondary', 'Second color']
  ];
  const numberFields = [
    ['opacity', 'How visible', 0, 1, 0.05],
    ['speed', 'Animation speed', 0.1, 1.5, 0.05],
    ['overlay', 'Dark cover strength', 0, 1, 0.05],
    ['amount', 'Particle/object amount', 8, 80, 1],
    ['density', 'Smoke/grid density', 0, 1, 0.05],
    ['glow', 'Glow strength', 0, 1, 0.05],
    ['blur', 'Soft blur', 0, 60, 1],
    ['size', 'Object/blob size', 0.5, 2, 0.05],
    ['tilt', 'Logo/card tilt', 0, 25, 1]
  ];

  return <div className="background-manager">
    <div className="admin-page-head">
      <div>
        <p className="eyebrow">Motion Backgrounds</p>
        <h1>Background Manager</h1>
        <p className="muted">Change the moving backgrounds behind each part of the website. Content and buttons stay clickable.</p>
      </div>
      <div className="row-actions">
        <button className="btn ghost" type="button" onClick={() => reset()}>Reset to Default</button>
        <button className="btn primary" type="button" onClick={() => save(draft)}>Save Settings</button>
      </div>
    </div>

    <div className="card admin-editor">
      <div className="toggle-grid">
        <Toggle label="Motion backgrounds" checked={!!draft.globalEnabled} onChange={checked=>updateGlobal({ globalEnabled:checked })}/>
        <Toggle label="Product card 3D tilt" checked={!!draft.productTiltEnabled} onChange={checked=>updateGlobal({ productTiltEnabled:checked })}/>
        <Toggle label="Show motion on phones" checked={!!draft.mobileEnabled} onChange={checked=>updateGlobal({ mobileEnabled:checked })}/>
        <Toggle label="Calm motion mode" checked={!!draft.reducedMotion} onChange={checked=>updateGlobal({ reducedMotion:checked })}/>
      </div>
      {loading && <p className="muted">Loading saved background settings...</p>}
    </div>

    <div className="background-manager-grid">
      <div className="card admin-editor">
        <h2>Choose Section</h2>
        <div className="background-section-list">
          {backgroundSections.map(([key,label]) => <button type="button" key={key} className={section===key?'active':''} onClick={()=>setSection(key)}>{label}</button>)}
        </div>

        <h2>Quick Presets</h2>
        <div className="preset-buttons">
          {presetNames.map(name => <button type="button" key={name} onClick={()=>applyPreset(name)}>{name}</button>)}
        </div>

        <div className="form-grid">
          <button type="button" className="btn ghost" onClick={applyAll}>Apply this look to all sections</button>
          <div className="copy-row">
            <select value={copyFrom} onChange={e=>setCopyFrom(e.target.value)}>{backgroundSections.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select>
            <button type="button" className="btn ghost" onClick={copySettings}>Copy from section</button>
          </div>
        </div>
      </div>

      <div className="card admin-editor">
        <h2>{backgroundSections.find(([key])=>key===section)?.[1]}</h2>
        <Toggle label="Background for this section" checked={!!current.enabled} onChange={checked=>updateSection({ enabled:checked })}/>
        <Field label="Background type"><select value={current.type} onChange={e=>updateSection({ type:e.target.value })}>{backgroundTypes.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></Field>
        <div className="form-grid color-grid">{colorFields.map(([key,label]) => <Field key={key} label={label}><input type="color" value={current[key]} onChange={e=>updateSection({ [key]:e.target.value })}/></Field>)}</div>
        <div className="form-grid">{numberFields.map(([key,label,min,max,step]) => <Field key={key} label={`${label}: ${current[key]}`}><input type="range" min={min} max={max} step={step} value={current[key]} onChange={e=>updateSection({ [key]: Number(e.target.value) })}/></Field>)}</div>
        <Field label="Motion intensity"><select value={current.intensity} onChange={e=>updateSection({ intensity:e.target.value })}>{intensityOptions.map(x=><option key={x}>{x}</option>)}</select></Field>
        <div className="toggle-grid">
          <Toggle label="Follow mouse movement" checked={!!current.mouseInteraction} onChange={checked=>updateSection({ mouseInteraction:checked })}/>
          <Toggle label="React to scrolling" checked={!!current.scrollInteraction} onChange={checked=>updateSection({ scrollInteraction:checked })}/>
          <Toggle label="Show on phones" checked={!!current.mobileEnabled} onChange={checked=>updateSection({ mobileEnabled:checked })}/>
          <Toggle label="Calm this section" checked={!!current.reducedMotion} onChange={checked=>updateSection({ reducedMotion:checked })}/>
        </div>
        <Field label="Image background link"><input value={current.imageUrl || ''} onChange={e=>updateSection({ imageUrl:e.target.value })}/></Field>
        <Field label="Video background link"><input value={current.videoUrl || ''} onChange={e=>updateSection({ videoUrl:e.target.value })}/></Field>
        <Field label="Image/video position"><select value={current.position || 'center'} onChange={e=>updateSection({ position:e.target.value })}><option>center</option><option>top</option><option>bottom</option><option>left</option><option>right</option></select></Field>
      </div>

      <div className="card admin-editor">
        <h2>Live Preview</h2>
        <BackgroundPreview section={section} draft={draft}/>
        <p className="muted">Preview is smaller than the real page, but uses the same saved settings.</p>
      </div>
    </div>
  </div>;
}

function Field({ label, children }) {
  return <div className="field-block"><label>{label}</label>{children}</div>;
}

function Toggle({ label, checked, onChange }) {
  return <label className={`toggle-control ${checked ? 'is-on' : 'is-off'}`}>
    <span>{label}</span>
    <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/>
    <b aria-hidden="true"><i/></b>
    <em>{checked ? 'ON' : 'OFF'}</em>
  </label>;
}
