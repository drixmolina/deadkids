import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'deadkids-db.json');

const emptyData = () => ({
  admins: [],
  products: [],
  upcoming_products: [],
  orders: [],
  reviews: [],
  promo_codes: [],
  notify_requests: [],
  contact_messages: [],
  background_settings: {
    globalEnabled: true,
    productTiltEnabled: true,
    reducedMotion: false,
    mobileEnabled: true,
    sections: {
      hero: { enabled: true, type: 'floating-products', base: '#000000', accent: '#D72323', secondary: '#3E3636', opacity: 0.44, speed: 0.55, intensity: 'medium', mouseInteraction: true, scrollInteraction: true, mobileEnabled: true, reducedMotion: false, overlay: 0.56, amount: 34, density: 0.45, glow: 0.45, blur: 24, size: 1, tilt: 10, imageUrl: '', videoUrl: '', position: 'center' },
      countdown: { enabled: true, type: 'smoke-fog', base: '#000000', accent: '#D72323', secondary: '#3E3636', opacity: 0.32, speed: 0.45, intensity: 'medium', mouseInteraction: true, scrollInteraction: true, mobileEnabled: true, reducedMotion: false, overlay: 0.62, amount: 34, density: 0.45, glow: 0.45, blur: 24, size: 1, tilt: 10, imageUrl: '', videoUrl: '', position: 'center' },
      products: { enabled: true, type: 'liquid-blob', base: '#000000', accent: '#D72323', secondary: '#3E3636', opacity: 0.26, speed: 0.4, intensity: 'medium', mouseInteraction: true, scrollInteraction: true, mobileEnabled: true, reducedMotion: false, overlay: 0.45, amount: 34, density: 0.45, glow: 0.45, blur: 24, size: 1, tilt: 10, imageUrl: '', videoUrl: '', position: 'center' },
      productDetails: { enabled: true, type: 'showroom', base: '#000000', accent: '#D72323', secondary: '#3E3636', opacity: 0.3, speed: 0.35, intensity: 'medium', mouseInteraction: true, scrollInteraction: true, mobileEnabled: true, reducedMotion: false, overlay: 0.52, amount: 34, density: 0.45, glow: 0.45, blur: 24, size: 1, tilt: 10, imageUrl: '', videoUrl: '', position: 'center' },
      about: { enabled: true, type: 'fabric-wave', base: '#000000', accent: '#D72323', secondary: '#3E3636', opacity: 0.3, speed: 0.38, intensity: 'medium', mouseInteraction: true, scrollInteraction: true, mobileEnabled: true, reducedMotion: false, overlay: 0.5, amount: 34, density: 0.45, glow: 0.45, blur: 24, size: 1, tilt: 10, imageUrl: '', videoUrl: '', position: 'center' },
      login: { enabled: true, type: 'particle-network', base: '#000000', accent: '#D72323', secondary: '#3E3636', opacity: 0.25, speed: 0.35, intensity: 'medium', mouseInteraction: true, scrollInteraction: true, mobileEnabled: true, reducedMotion: false, overlay: 0.55, amount: 34, density: 0.45, glow: 0.45, blur: 24, size: 1, tilt: 10, imageUrl: '', videoUrl: '', position: 'center' },
      checkout: { enabled: true, type: 'gradient-waves', base: '#000000', accent: '#D72323', secondary: '#3E3636', opacity: 0.22, speed: 0.28, intensity: 'medium', mouseInteraction: true, scrollInteraction: true, mobileEnabled: true, reducedMotion: false, overlay: 0.58, amount: 34, density: 0.45, glow: 0.45, blur: 24, size: 1, tilt: 10, imageUrl: '', videoUrl: '', position: 'center' },
      footer: { enabled: true, type: 'particle-network', base: '#000000', accent: '#D72323', secondary: '#3E3636', opacity: 0.24, speed: 0.3, intensity: 'medium', mouseInteraction: true, scrollInteraction: true, mobileEnabled: true, reducedMotion: false, overlay: 0.48, amount: 34, density: 0.45, glow: 0.45, blur: 24, size: 1, tilt: 10, imageUrl: '', videoUrl: '', position: 'center' }
    }
  },
  site_content: {
    nav_brand: 'DDKDS',
    nav_brand_accent: 'CLO.',
    nav_tagline: 'Limited streetwear atelier',
    nav_shop_label: 'Shop',
    nav_size_label: 'Sizing',
    nav_reviews_label: 'Reviews',
    nav_track_label: 'Track',
    nav_contact_label: 'Contact',
    nav_admin_label: 'Admin',
    hero_eyebrow: 'LUXURY / Y2K / STREETWEAR',
    hero_title: 'DDKDS CLO.',
    hero_subtitle: 'STREETWEAR BUILT DIFFERENT.',
    announcement_text: 'LIMITED DROPS. NO RESTOCKS.',
    latest_drop_title: 'DDKDS REDLINE COLLECTION',
    latest_drop_description: 'Limited pieces, clean structure, chrome attitude, and premium contrast details.',
    hero_story: 'DDKDS CLO. is built for clean silhouettes, chrome-era attitude, and limited streetwear drops that feel premium, wearable, and loud in the right way.',
    hero_primary_button: 'SHOP THE DROP',
    hero_secondary_button: 'CUSTOMER LOVE',
    hero_note_1: 'Small batch drops',
    hero_note_2: 'Minimal black/red/white palette',
    hero_note_3: 'Y2K chrome energy',
    hero_note_4: 'Street-ready premium fits',
    hero_product_id: '',
    about_title: 'About DDKDS CLO',
    about_subtitle: 'Modern streetwear, comfort, confidence, and bold fashion.',
    about_story: 'DDKDS CLO is built for people who want clean but bold urban clothing. The brand combines minimalist design, luxury streetwear, grunge details, and Y2K-inspired energy.',
    mission: 'To create premium everyday streetwear that makes customers feel confident.',
    vision: 'To become a recognizable local streetwear brand known for quality, creativity, and strong identity.',
    contact_title: 'Contact',
    contact_subtitle: 'Message DDKDS CLO for orders, collabs, or support.',
    contact_channels: 'Messenger • Instagram DM • WhatsApp • Email',
    footer_brand: 'DDKDS CLO.',
    footer_text: 'Premium black/red/white streetwear e-commerce experience.',
    footer_track_label: 'Track an order',
    footer_admin_label: 'Admin Portal',
    page_eyebrow: 'DDKDS CLO.',
    reviews_eyebrow: 'REVIEWS',
    reviews_title: 'Customer Reviews',
    reviews_description: 'Clean feedback from DDKDS customers.',
    reviews_empty_text: 'No approved reviews yet. Be the first to rate the drop.',
    reviews_view_button: 'View Reviews',
    site_bg: '#050505',
    site_surface: '#111111',
    site_surface2: '#191919',
    site_text: '#ffffff',
    site_muted: '#aaa4a4',
    site_accent: '#d90429',
    site_accent2: '#ff2a4f',
    site_light_bg: '#fbf8f2',
    site_light_surface: '#fffdfa',
    site_light_surface2: '#f5eee4',
    site_light_text: '#14110f',
    site_light_muted: '#746b62',
    site_light_accent: '#c6002b',
    site_light_accent2: '#e00034',
    site_background_style: 'motion-grid',
    site_background_image: '',
    site_background_overlay: '#050505',
    payment_methods: 'GCash,Maya,Bank Transfer,COD',
    checkout_title: 'Pay using GCash, Maya, Bank Transfer, or COD.',
    checkout_button: 'Place Order',
    checkout_note: 'Alternative ordering: Google Form, Facebook Messenger, Instagram DM, WhatsApp, or email.',
    shipping_note: 'Local delivery / nationwide shipping available.',
    music_enabled: true,
    music_video_id: 'g4dScvHrXC8',
    music_title: 'DDKDS SOUND',
    drop_title: 'NEXT DROP LOADING',
    main_drop_id: '',
    countdown_enabled: true,
    countdown_location: 'Both',
    notify_enabled: true,
    auto_release_enabled: true
  }
});

export let data = emptyData();

function now() {
  return new Date().toISOString();
}

function nextId(collectionName) {
  const rows = data[collectionName] || [];
  return rows.length ? Math.max(...rows.map(item => Number(item.id) || 0)) + 1 : 1;
}

export function saveDb() {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

export function initDb() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (fs.existsSync(dataFile)) {
    try {
      data = { ...emptyData(), ...JSON.parse(fs.readFileSync(dataFile, 'utf8')) };
    } catch {
      data = emptyData();
    }
  }

  if (!data.admins.some(admin => admin.email === 'admin@deadkids.com')) {
    data.admins.push({
      id: nextId('admins'),
      email: 'admin@deadkids.com',
      password: bcrypt.hashSync('admin123', 10),
      created_at: now()
    });
  }

  data.site_content = { ...emptyData().site_content, ...(data.site_content || {}) };
  data.background_settings = { ...emptyData().background_settings, ...(data.background_settings || {}), sections: { ...emptyData().background_settings.sections, ...(data.background_settings?.sections || {}) } };
  data.products = (data.products || []).map((product, index) => ({
    ...product,
    sort_order: product.sort_order ?? index + 1,
    images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),
    size_chart: Array.isArray(product.size_chart) ? product.size_chart : []
  }));
  if (!data.products.length) seedProducts();
  saveDb();
}

function seedProducts() {
  const products = [
    ['DDKDS Redline Tee', 'T-shirts', 'Premium streetwear tee with bold redline graphic.', 699, ['S','M','L','XL'], ['Black','White','Red'], 40, 1, 1, 0, 1],
    ['DDKDS Shadow Hoodie', 'Hoodies', 'Oversized hoodie with luxury streetwear feel.', 1499, ['M','L','XL'], ['Black','Gray'], 25, 1, 1, 1, 0],
    ['DDKDS Utility Pants', 'Pants', 'Modern cargo-inspired pants for daily fit.', 1299, ['S','M','L','XL'], ['Black'], 22, 0, 0, 0, 1],
    ['DDKDS Classic Polo', 'Polo shirts', 'Clean premium polo with minimal chest logo.', 899, ['S','M','L'], ['White','Black'], 30, 0, 0, 0, 0],
    ['DDKDS Everyday Cap', 'Caps', 'Adjustable cap with embroidered logo.', 499, ['One Size'], ['Black','Red'], 50, 1, 0, 0, 1],
    ['DDKDS Tote Bag', 'Bags', 'Canvas street tote for everyday carry.', 599, ['One Size'], ['Black','White'], 35, 0, 0, 0, 0],
    ['DDKDS Crop Signature', 'Crop tops', 'Minimal crop top with premium DDKDS mark.', 649, ['S','M','L'], ['Black','Red'], 20, 0, 1, 0, 1],
    ['DDKDS Urban Shorts', 'Shorts', 'Comfortable streetwear shorts with bold trim.', 799, ['S','M','L','XL'], ['Black'], 28, 0, 0, 0, 0]
  ];

  data.products = products.map((p, i) => ({
    id: nextId('products') + i,
    name: p[0],
    category: p[1],
    description: p[2],
    price: p[3],
    sizes: p[4],
    colors: p[5],
    stock: p[6],
    featured: p[7],
    best_seller: p[8],
    limited_drop: p[9],
    new_arrival: p[10],
    images: [`/placeholder/product-${(i % 4) + 1}.svg`],
    status: 'Active',
    sort_order: i + 1,
    created_at: now(),
    updated_at: now()
  }));

  data.upcoming_products.push({
    id: nextId('upcoming_products'),
    name: 'DDKDS Limited Drop Jacket',
    category: 'Hoodies',
    description: 'A limited red-black jacket drop for the next collection.',
    teaser_image: '/placeholder/upcoming.svg',
    release_date: '2026-12-20',
    release_time: '20:00',
    countdown_enabled: 1,
    notify_enabled: 1,
    auto_release: 1,
    status: 'Coming Soon',
    created_at: now(),
    updated_at: now()
  });

  data.reviews.push({
    id: nextId('reviews'),
    product_id: 1,
    product_name: 'DDKDS Redline Tee',
    customer_name: 'Mika',
    rating: 5,
    comment: 'Premium quality and the design is clean.',
    status: 'Approved',
    featured: 1,
    created_at: now()
  });

  data.promo_codes.push({
    id: nextId('promo_codes'),
    code: 'DDKDS10',
    discount_type: 'percentage',
    discount_value: 10,
    minimum_order: 500,
    expires_at: '',
    active: 1,
    usage_count: 0,
    created_at: now()
  });
}

export function insert(collectionName, item) {
  const row = { id: nextId(collectionName), ...item };
  data[collectionName].push(row);
  saveDb();
  return row;
}

export function update(collectionName, id, changes) {
  const row = data[collectionName].find(item => Number(item.id) === Number(id));
  if (!row) return null;
  Object.assign(row, changes, { updated_at: now() });
  saveDb();
  return row;
}

export function remove(collectionName, id) {
  const before = data[collectionName].length;
  data[collectionName] = data[collectionName].filter(item => Number(item.id) !== Number(id));
  saveDb();
  return before !== data[collectionName].length;
}

export function makeOrderNumber() {
  return `DDKDS-${nanoid(8).toUpperCase()}`;
}

export function timestamp() {
  return now();
}
