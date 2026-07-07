import React, { useEffect, useMemo, useState } from 'react';

const productObjects = ['HOODIE', 'TEE', 'CAP', 'BAG', '₱', 'DDKDS', 'TAG'];

export default function MotionBackgroundRenderer({ section, settings, preview=false }) {
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const isMobile = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 720px)').matches;
  const cfg = settings?.sections?.[section];
  const enabled = settings?.globalEnabled && cfg?.enabled && (!isMobile || settings.mobileEnabled !== false) && (!isMobile || cfg.mobileEnabled !== false);
  const reduced = prefersReduced || settings?.reducedMotion || cfg?.reducedMotion;

  useEffect(() => {
    if (!cfg?.mouseInteraction || !enabled) return;
    const move = e => setPointer({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [cfg?.mouseInteraction, enabled]);

  const style = {
    '--mb-base': cfg?.base || '#000',
    '--mb-accent': cfg?.accent || '#D72323',
    '--mb-secondary': cfg?.secondary || '#3E3636',
    '--mb-opacity': cfg?.opacity ?? 0.35,
    '--mb-speed': `${Math.max(0.1, Number(cfg?.speed || 0.5)) * 8}s`,
    '--mb-overlay': cfg?.overlay ?? 0.55,
    '--mb-glow': cfg?.glow ?? 0.45,
    '--mb-blur': `${cfg?.blur || 24}px`,
    '--mb-size': cfg?.size || 1,
    '--mb-density': cfg?.density ?? 0.45,
    '--mb-x': `${pointer.x}%`,
    '--mb-y': `${pointer.y}%`,
    '--mb-image': cfg?.imageUrl ? `url("${cfg.imageUrl}")` : 'none',
    '--mb-video-opacity': cfg?.opacity ?? 0.35,
    backgroundPosition: cfg?.position || 'center'
  };

  const particles = useMemo(() => Array.from({ length: Math.min(80, Number(cfg?.amount || 34)) }, (_, i) => i), [cfg?.amount]);

  if (!enabled) return null;
  return <div className={`motion-bg ${preview ? 'preview' : ''} ${reduced ? 'reduced' : ''} motion-${cfg.type || 'gradient-waves'}`} style={style} aria-hidden="true">
    {cfg.videoUrl && cfg.type === 'static-media' && <video src={cfg.videoUrl} autoPlay muted loop playsInline />}
    {cfg.type === 'floating-products' && productObjects.map((item, i) => <span key={item} className={`float-object f${i}`}>{item}</span>)}
    {cfg.type === 'particle-network' && <div className="particle-field">{particles.map(i => <span key={i} style={{ '--i': i }} />)}</div>}
    {cfg.type === 'rotating-logo' && <div className="motion-logo">DDKDS</div>}
    {cfg.type === 'neon-grid' && <div className="neon-floor" />}
    {cfg.type === 'fabric-wave' && <div className="fabric-lines" />}
    {cfg.type === 'smoke-fog' && <><span className="fog fog-a" /><span className="fog fog-b" /><span className="fog fog-c" /></>}
    {cfg.type === 'liquid-blob' && <><span className="blob blob-a" /><span className="blob blob-b" /><span className="blob blob-c" /></>}
    {cfg.type === 'showroom' && <><span className="stage-light left" /><span className="stage-light right" /><span className="stage-floor" /></>}
    {cfg.type === 'static-media' && <div className="static-media-bg" />}
    <span className="motion-bg-overlay" />
  </div>;
}
