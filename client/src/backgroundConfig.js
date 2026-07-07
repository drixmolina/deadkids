export const backgroundTypes = [
  ['floating-products', 'Floating 3D Products'],
  ['gradient-waves', 'Dark 3D Gradient Waves'],
  ['particle-network', '3D Particle Network'],
  ['fabric-wave', '3D Cloth / Fabric Wave'],
  ['rotating-logo', '3D Rotating Logo Background'],
  ['showroom', '3D Showroom Background'],
  ['smoke-fog', '3D Smoke / Fog Background'],
  ['neon-grid', '3D Neon Grid Floor'],
  ['liquid-blob', '3D Liquid Blob Background'],
  ['static-media', 'Image / Video Fallback']
];

export const backgroundSections = [
  ['hero', 'Homepage Hero'],
  ['countdown', 'New Drop / Countdown'],
  ['products', 'Product Collection'],
  ['productDetails', 'Product Details Page'],
  ['about', 'About Brand Section'],
  ['login', 'Login/Register Page'],
  ['checkout', 'Cart / Checkout Page'],
  ['footer', 'Footer']
];

export const baseSectionSettings = {
  enabled: true,
  type: 'gradient-waves',
  base: '#000000',
  accent: '#D72323',
  secondary: '#3E3636',
  opacity: 0.35,
  speed: 0.5,
  intensity: 'medium',
  mouseInteraction: true,
  scrollInteraction: true,
  mobileEnabled: true,
  reducedMotion: false,
  overlay: 0.55,
  amount: 34,
  density: 0.45,
  glow: 0.45,
  blur: 24,
  size: 1,
  tilt: 10,
  imageUrl: '',
  videoUrl: '',
  position: 'center'
};

export const defaultBackgroundSettings = {
  globalEnabled: true,
  productTiltEnabled: true,
  reducedMotion: false,
  mobileEnabled: true,
  sections: {
    hero: { ...baseSectionSettings, type: 'floating-products', opacity: 0.44, speed: 0.55, overlay: 0.56 },
    countdown: { ...baseSectionSettings, type: 'smoke-fog', opacity: 0.32, speed: 0.45, overlay: 0.62 },
    products: { ...baseSectionSettings, type: 'liquid-blob', opacity: 0.26, speed: 0.4, overlay: 0.45 },
    productDetails: { ...baseSectionSettings, type: 'showroom', opacity: 0.3, speed: 0.35, overlay: 0.52 },
    about: { ...baseSectionSettings, type: 'fabric-wave', opacity: 0.3, speed: 0.38, overlay: 0.5 },
    login: { ...baseSectionSettings, type: 'particle-network', opacity: 0.25, speed: 0.35, overlay: 0.55 },
    checkout: { ...baseSectionSettings, type: 'gradient-waves', opacity: 0.22, speed: 0.28, overlay: 0.58 },
    footer: { ...baseSectionSettings, type: 'particle-network', opacity: 0.24, speed: 0.3, overlay: 0.48 }
  }
};

export const backgroundPresets = {
  'Minimal Dark': { type: 'gradient-waves', base: '#000000', accent: '#3E3636', secondary: '#F5EDED', opacity: 0.2, speed: 0.25, overlay: 0.62 },
  'Streetwear Red': { type: 'floating-products', base: '#000000', accent: '#D72323', secondary: '#3E3636', opacity: 0.42, speed: 0.55, overlay: 0.56 },
  'Cyber Grid': { type: 'neon-grid', base: '#000000', accent: '#D72323', secondary: '#F5EDED', opacity: 0.38, speed: 0.5, glow: 0.75, overlay: 0.58 },
  'Smoke Drop': { type: 'smoke-fog', base: '#000000', accent: '#D72323', secondary: '#3E3636', opacity: 0.34, speed: 0.42, density: 0.65, overlay: 0.64 },
  'Premium Product': { type: 'liquid-blob', base: '#000000', accent: '#D72323', secondary: '#F5EDED', opacity: 0.28, speed: 0.35, blur: 30, overlay: 0.48 },
  'Clean Particles': { type: 'particle-network', base: '#000000', accent: '#F5EDED', secondary: '#D72323', opacity: 0.24, speed: 0.3, amount: 28, overlay: 0.55 },
  'Fabric Motion': { type: 'fabric-wave', base: '#000000', accent: '#3E3636', secondary: '#D72323', opacity: 0.3, speed: 0.35, overlay: 0.5 },
  'Luxury Showroom': { type: 'showroom', base: '#000000', accent: '#D72323', secondary: '#F5EDED', opacity: 0.32, speed: 0.28, overlay: 0.55 }
};

export function mergeBackgroundSettings(value = {}) {
  const merged = {
    ...defaultBackgroundSettings,
    ...value,
    sections: { ...defaultBackgroundSettings.sections, ...(value.sections || {}) }
  };
  for (const [key, defaults] of Object.entries(defaultBackgroundSettings.sections)) {
    merged.sections[key] = { ...defaults, ...(value.sections?.[key] || {}) };
  }
  return merged;
}
