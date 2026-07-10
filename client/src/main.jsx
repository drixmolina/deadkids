import React, { createContext, useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Heart, Search, ShoppingBag, Moon, Sun, Trash2, LogOut, Package, LayoutDashboard, MessageSquare, Star, Plus, UploadCloud, X, SlidersHorizontal, Ruler, ReceiptText, Settings, Sparkles, User, Menu, ChevronLeft, ChevronRight, ImagePlus } from 'lucide-react';
import { API, request, customerRequest, uploadImage } from './api.js';
import BackgroundManager from './BackgroundManager.jsx';
import SectionWithMotionBackground from './SectionWithMotionBackground.jsx';
import { useBackgroundSettings } from './useBackgroundSettings.js';
import './styles.css';

const CartContext = createContext();
const CustomerContext = createContext();
const categories = ['T-shirts','Hoodies','Pants','Polo shirts','Bags','Caps','Bonnets','Crop tops','Shorts'];
const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};
const safeJson = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value ?? fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
};
const pesos = n => `₱${toNumber(n).toLocaleString()}`;
const asset = path => !path ? `${API}/placeholder/product-1.svg` : (String(path).startsWith('http') ? path : `${API}${path}`);
const heroAsset = path => !path ? '/ddkds-hero-banner.jpg' : (String(path).startsWith('http') ? path : (String(path).startsWith('/uploads') || String(path).startsWith('/placeholder') ? `${API}${path}` : path));
const siteDefaults = {
  nav_brand: 'DDKDS', nav_brand_accent: 'CLO.', nav_tagline: 'Limited streetwear atelier',
  nav_shop_label: 'Shop', nav_size_label: 'Sizing', nav_reviews_label: 'Reviews', nav_track_label: 'Track', nav_contact_label: 'Contact', nav_admin_label: 'Admin',
  hero_eyebrow: 'LUXURY / Y2K / STREETWEAR', hero_title: 'DDKDS CLO.', hero_subtitle: 'ELEGANT Y2K STREETWEAR.',
  hero_story: 'DDKDS CLO. is built for clean silhouettes, chrome-era attitude, and limited streetwear drops that feel premium, wearable, and loud in the right way.',
  hero_primary_button: 'SHOP THE DROP', hero_secondary_button: 'CUSTOMER LOVE',
  hero_note_1: 'Small batch drops', hero_note_2: 'Minimal black/red/white palette', hero_note_3: 'Y2K chrome energy', hero_note_4: 'Street-ready premium fits',
  latest_drop_title: 'DDKDS REDLINE COLLECTION', latest_drop_description: 'Limited pieces, clean structure, chrome attitude, and premium contrast details.',
  reviews_eyebrow: 'REVIEWS', reviews_title: 'Customer Reviews', reviews_description: 'Clean feedback from DDKDS customers.', reviews_empty_text: 'No approved reviews yet. Be the first to rate the drop.', reviews_view_button: 'View Reviews',
  page_eyebrow: 'DDKDS CLO.', footer_brand: 'DDKDS CLO.', footer_text: 'Premium black/red/white streetwear e-commerce experience.', footer_track_label: 'Track an order', footer_admin_label: 'Admin Portal',
  site_bg: '#050505', site_surface: '#111111', site_surface2: '#191919', site_text: '#ffffff', site_muted: '#aaa4a4', site_accent: '#d90429', site_accent2: '#ff2a4f',
  site_light_bg: '#fbf8f2', site_light_surface: '#fffdfa', site_light_surface2: '#f5eee4', site_light_text: '#14110f', site_light_muted: '#746b62', site_light_accent: '#c6002b', site_light_accent2: '#e00034',
  site_background_style: 'motion-grid', site_background_image: '', site_background_overlay: '#050505'
};

function useCart() { return useContext(CartContext); }
function useCustomer() { return useContext(CustomerContext); }
function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(() => safeJson('deadkids_customer', null));
  const signedIn = !!customer;
  const saveSession = payload => {
    localStorage.setItem('deadkids_customer_token', payload.token);
    localStorage.setItem('deadkids_customer', JSON.stringify(payload.customer));
    setCustomer(payload.customer);
  };
  const loadProfile = async () => {
    const res = await customerRequest('/api/auth/me');
    localStorage.setItem('deadkids_customer', JSON.stringify(res.customer));
    setCustomer(res.customer);
    return res.customer;
  };
  const register = async form => saveSession(await customerRequest('/api/customer/register', { method: 'POST', body: JSON.stringify(form) }));
  const login = async form => saveSession(await customerRequest('/api/customer/login', { method: 'POST', body: JSON.stringify(form) }));
  const googleLogin = () => { window.location.href = `${API}/api/auth/google`; };
  const logout = () => {
    localStorage.removeItem('deadkids_customer_token');
    localStorage.removeItem('deadkids_customer');
    setCustomer(null);
  };
  useEffect(() => {
    if (!localStorage.getItem('deadkids_customer_token')) return;
    loadProfile().catch(logout);
  }, []);
  return <CustomerContext.Provider value={{ customer, signedIn, register, login, googleLogin, loadProfile, logout }}>{children}</CustomerContext.Provider>;
}
function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = safeJson('deadkids_cart', []);
    return Array.isArray(stored) ? stored : [];
  });
  useEffect(() => localStorage.setItem('deadkids_cart', JSON.stringify(items)), [items]);
  const add = (product, size = product.sizes?.[0] || 'One Size', color = product.colors?.[0] || 'Black', qty = 1) => {
    setItems(prev => {
      const key = `${product.id}-${size}-${color}`;
      const safeQty = Math.max(1, toNumber(qty, 1));
      const found = prev.find(i => i.key === key);
      if (found) return prev.map(i => i.key === key ? { ...i, qty: toNumber(i.qty, 1) + safeQty } : i);
      return [...prev, { key, product_id: product.id, name: product.name, price: toNumber(product.price), image: product.images?.[0], size, color, qty: safeQty }];
    });
  };
  const remove = key => setItems(prev => prev.filter(i => i.key !== key));
  const update = (key, qty) => setItems(prev => prev.map(i => i.key === key ? { ...i, qty: Math.max(1, toNumber(qty, 1)) } : i));
  const clear = () => setItems([]);
  const total = items.reduce((sum, i) => sum + toNumber(i.price) * toNumber(i.qty, 1), 0);
  return <CartContext.Provider value={{ items, add, remove, update, clear, total }}>{children}</CartContext.Provider>;
}

function LoadingScreen() {
  const [show, setShow] = useState(true);
  useEffect(() => { const t = setTimeout(() => setShow(false), 1250); return () => clearTimeout(t); }, []);
  if (!show) return null;
  return <div className="loader-screen" aria-label="DDKDS CLO loading">
    <div className="loader-brand">
      <div className="loader-mark">DDKDS <span>CLO.</span></div>
      <small>LIMITED STREETWEAR ATELIER</small>
    </div>
    <div className="loader-line"><span /></div>
    <p>LOADING THE DROP</p>
  </div>;
}

function MouseGlow() {
  useEffect(() => {
    const move = e => {
      document.documentElement.style.setProperty('--mx', `${e.clientX}px`);
      document.documentElement.style.setProperty('--my', `${e.clientY}px`);
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return <div className="cursor-glow"/>;
}

function YouTubeMusicPlayer() {
  // Hidden background music player. Browsers may block sound autoplay until the first click/tap,
  // so this also reloads the iframe after the first user interaction.
  const [content, setContent] = useState({ music_enabled: true, music_video_id: 'g4dScvHrXC8' });
  const [ready, setReady] = useState(false);
  useEffect(() => { request('/api/site-content').then(setContent).catch(()=>{}); }, []);
  const videoId = content.music_video_id || 'g4dScvHrXC8';
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${videoId}`;
  useEffect(() => {
    if (!content.music_enabled) return;
    setReady(true);
    const unlock = () => setReady(false) || setTimeout(() => setReady(true), 80);
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, [content.music_enabled, videoId]);
  if (!content.music_enabled) return null;
  return <div className="hidden-music" aria-hidden="true">
    {ready && <iframe
      src={embedUrl}
      title="Background music"
      allow="autoplay; encrypted-media"
      tabIndex="-1">
    </iframe>}
  </div>;
}


function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return <button className="back-to-top no-loading" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">↑</button>;
}

function ThemeController({ light }) {
  useEffect(() => {
    let active = true;
    request('/api/site-content').then(content => {
      if (!active) return;
      const merged = { ...siteDefaults, ...content };
      const root = document.documentElement;
      const map = light ? {
        '--bg': merged.site_light_bg, '--surface': merged.site_light_surface, '--surface2': merged.site_light_surface2, '--text': merged.site_light_text, '--muted': merged.site_light_muted, '--red': merged.site_light_accent, '--red2': merged.site_light_accent2
      } : {
        '--bg': merged.site_bg, '--surface': merged.site_surface, '--surface2': merged.site_surface2, '--text': merged.site_text, '--muted': merged.site_muted, '--red': merged.site_accent, '--red2': merged.site_accent2
      };
      Object.entries(map).forEach(([key, value]) => root.style.setProperty(key, value || ''));
      root.style.setProperty('--site-bg-image', merged.site_background_image ? `url("${merged.site_background_image}")` : 'none');
      root.style.setProperty('--site-bg-overlay', merged.site_background_overlay || merged.site_bg || '#050505');
      document.body.dataset.bgStyle = merged.site_background_style || 'motion-grid';
    }).catch(()=>{});
    return () => { active = false; };
  }, [light]);
  return null;
}

function App() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    document.body.classList.toggle('light-mode', light);
    return () => document.body.classList.remove('light-mode');
  }, [light]);
  return <CustomerProvider><CartProvider><BrowserRouter><ThemeController light={light}/><AppShell light={light} setLight={setLight}/></BrowserRouter></CartProvider></CustomerProvider>;
}

function AppShell({ light, setLight }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [pageLoading, setPageLoading] = useState(false);
  const { settings: bgSettings } = useBackgroundSettings();

  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => setPageLoading(false), 420);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    if (isAdminRoute) return;
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      const goingDown = currentY > lastY && currentY > 120;
      document.body.classList.toggle('nav-hidden', goingDown);
      lastY = currentY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.body.classList.remove('nav-hidden');
    };
  }, [isAdminRoute]);

  useEffect(() => {
    const candidates = document.querySelectorAll('main section, .card, .product, .page-title, .split, .drop-strip, .review-card, .admin-content > *');
    candidates.forEach((el, index) => {
      if (!el.classList.contains('reveal-on-scroll')) {
        el.classList.add('reveal-on-scroll');
        el.style.setProperty('--stagger', `${Math.min(index % 12, 8) * 55}ms`);
      }
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    candidates.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    const onClick = e => {
      const button = e.target.closest('button, .btn');
      if (!button || button.disabled || button.classList.contains('no-loading')) return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--rx', `${e.clientX - rect.left}px`);
      button.style.setProperty('--ry', `${e.clientY - rect.top}px`);
      button.classList.remove('ripple-run');
      void button.offsetWidth;
      button.classList.add('ripple-run', 'button-busy');
      setTimeout(() => button.classList.remove('button-busy'), 520);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return <div className={`${light ? 'app light' : 'app'} ${isAdminRoute ? 'admin-app' : 'customer-app'} ${bgSettings.productTiltEnabled ? 'product-tilt-enabled' : 'product-tilt-disabled'}`}>
    {pageLoading && !isAdminRoute && <div className="top-loading-bar"/>}
    {!isAdminRoute && <LoadingScreen/>}
    <MouseGlow/>
    {!isAdminRoute && <Navbar light={light} setLight={setLight}/>}
    {!isAdminRoute && <YouTubeMusicPlayer/>}
    <div className="page-fade-shell" key={location.pathname}>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/shop" element={<Shop/>}/>
      <Route path="/product/:id" element={<ProductDetails/>}/>
      <Route path="/cart" element={<Cart/>}/>
      <Route path="/checkout" element={<Checkout/>}/>
      <Route path="/account" element={<Account/>}/>
      <Route path="/auth/success" element={<AuthSuccess/>}/>
      <Route path="/receipt" element={<ReceiptPage/>}/>
      <Route path="/track" element={<Track/>}/>
      <Route path="/size-guide" element={<SizeGuide/>}/>
      <Route path="/reviews" element={<ReviewsPage/>}/>
      <Route path="/about" element={<About/>}/>
      <Route path="/contact" element={<Contact/>}/>
      <Route path="/admin/login" element={<AdminLogin/>}/>
      <Route path="/admin/*" element={<AdminLayout/>}/>
    </Routes>
    </div>
    {!isAdminRoute && <BackToTopButton/>}
    {!isAdminRoute && <Footer/>}
  </div>;
}

function Navbar({ light, setLight }) {
  const { items } = useCart();
  const { customer } = useCustomer();
  const [open,setOpen]=useState(false);
  const [content,setContent]=useState(siteDefaults);
  useEffect(()=>{request('/api/site-content').then(x=>setContent({...siteDefaults,...x})).catch(()=>{})},[]);
  useEffect(()=>{document.body.classList.toggle('side-nav-open', open);return()=>document.body.classList.remove('side-nav-open')},[open]);
  const close=()=>setOpen(false);
  return <>
    <header className="nav customer-nav luxury-nav dbtk-nav">
      <button className="hamburger-btn" type="button" aria-label="Open menu" onClick={()=>setOpen(true)}><Menu size={25}/></button>
      <Link to="/" className="logo centered-logo" onClick={close}>{content.nav_brand} <span>{content.nav_brand_accent}</span></Link>
      <div className="nav-actions compact-nav-actions">
        <Link className="icon-btn account-icon" to="/account" aria-label={customer ? 'Account' : 'Sign in'}><User size={18}/></Link>
        <Link className="cart-pill icon-cart" to="/cart" aria-label="Cart"><ShoppingBag size={18}/><span>{items.length}</span></Link>
      </div>
    </header>
    <div className={`side-nav-backdrop ${open?'open':''}`} onClick={close}/>
    <aside className={`side-drawer ${open?'open':''}`} aria-hidden={!open}>
      <div className="side-drawer-head"><strong>DDKDS <span>CLO.</span></strong><button type="button" aria-label="Close menu" onClick={close}><X size={20}/></button></div>
      <nav className="side-drawer-links">
        <NavLink to="/shop" onClick={close}>{content.nav_shop_label || 'Shop'}</NavLink>
        <NavLink to="/reviews" onClick={close}>{content.nav_reviews_label || 'Reviews'}</NavLink>
        <NavLink to="/contact" onClick={close}>{content.nav_contact_label || 'Contact'}</NavLink>
        <NavLink to="/account" onClick={close}>{customer ? 'Account' : 'Sign In'}</NavLink>
        <NavLink to="/admin/login" onClick={close}>Admin Portal</NavLink>
      </nav>
      <button className="side-theme-toggle" type="button" onClick={()=>setLight(!light)}>{light ? <Moon size={18}/> : <Sun size={18}/>} {light ? 'Dark mode' : 'Light mode'}</button>
    </aside>
  </>;
}

function HeroCarousel({ banners = [], content }) {
  const slides = banners.length ? banners : [{
    image_url: '/ddkds-hero-banner.jpg',
    small_label: content.hero_eyebrow,
    heading: content.hero_title || 'DEADKIDS',
    subtitle: content.hero_story,
    button_text: '',
    button_link: '/shop'
  }];
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const hasMultiple = slides.length > 1;
  const autoplay = content.hero_autoplay_enabled !== false && content.hero_autoplay_enabled !== 'false';
  const go = dir => setActive(index => (index + dir + slides.length) % slides.length);
  useEffect(() => {
    if (!hasMultiple || !autoplay || paused) return;
    const timer = setInterval(() => go(1), 5200);
    return () => clearInterval(timer);
  }, [hasMultiple, autoplay, paused, slides.length]);
  return <section className="hero premium-hero brand-hero dbtk-hero hero-carousel" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
    {slides.map((slide, index) => <img key={slide.id || slide.image_url || index} className={`dbtk-hero-img hero-slide ${index===active?'active':''}`} src={heroAsset(slide.image_url)} alt={slide.heading || 'DDKDS CLO streetwear hero banner'} loading={index===0?'eager':'lazy'} decoding="async"/>)}
    <div className="dbtk-hero-overlay"/>
    <div className="dbtk-hero-content reveal">
      <p className="eyebrow">{slides[active]?.small_label || content.hero_eyebrow || 'LUXURY / Y2K / STREETWEAR'}</p>
      <h1 className="glitch" data-text={slides[active]?.heading || content.hero_title || 'DEADKIDS'}>{slides[active]?.heading || content.hero_title || 'DEADKIDS'}</h1>
      <p className="brand-story">{slides[active]?.subtitle || content.hero_story}</p>
      {slides[active]?.button_text && <Link className="btn primary hero-banner-btn" to={slides[active]?.button_link || '/shop'}>{slides[active].button_text}</Link>}
    </div>
    {hasMultiple && <div className="hero-carousel-controls" aria-label="Hero banner controls">
      <button type="button" aria-label="Previous hero image" onClick={()=>go(-1)}><ChevronLeft size={20}/></button>
      <div className="hero-carousel-indicators">{slides.map((slide,index)=><button type="button" key={slide.id || index} aria-label={`Show hero image ${index+1}`} className={index===active?'active':''} onClick={()=>setActive(index)}/>)}</div>
      <button type="button" aria-label="Next hero image" onClick={()=>go(1)}><ChevronRight size={20}/></button>
    </div>}
  </section>;
}

function Home() {
  const [products, setProducts] = useState([]); const [reviews, setReviews] = useState([]); const [content,setContent]=useState(siteDefaults); const [heroBanners,setHeroBanners]=useState([]);
  useEffect(() => {
    async function loadHome(){
      const [featuredProducts, approvedReviews, siteContent, banners] = await Promise.all([
        request('/api/products?featured=1'),
        request('/api/reviews'),
        request('/api/site-content').catch(()=>({})),
        request('/api/hero-banners').catch(()=>[])
      ]);
      setProducts(featuredProducts);
      setReviews(approvedReviews);
      setContent({...siteDefaults,...siteContent});
      setHeroBanners(Array.isArray(banners) ? banners : []);
    }
    loadHome().catch(console.error);
  }, []);
  return <main>
    <HeroCarousel banners={heroBanners} content={content}/>
    <Marquee/>
    <FeaturedVisualRunway products={products}/>
    <SectionWithMotionBackground section="countdown"><section className="latest-drop-section"><div className="section-head"><p className="eyebrow">LATEST DROP</p><h2>{content.latest_drop_title || 'DDKDS REDLINE COLLECTION'}</h2><p className="muted">{content.latest_drop_description || siteDefaults.latest_drop_description}</p></div><div className="grid four">{products.slice(0,4).map(p => <ProductCard key={p.id} product={p}/>)}</div></section></SectionWithMotionBackground>
    <ProductSection title="Featured Products" products={products}/>
    <CustomerReviewsSection reviews={reviews} compact={true}/>
  </main>;
}


function Marquee(){ return <div className="marquee luxury-marquee"><div>DDKDS CLO. / PRIVATE DROP / Y2K CHROME / PREMIUM STREET ESSENTIALS / LIMITED STOCK / NO RESTOCK / </div></div>; }

function FeaturedVisualRunway({ products=[] }) {
  const productShots = products.flatMap(product => {
    const images = product.images?.length ? product.images : ['/placeholder/product-1.svg'];
    return images.slice(0, 3).map((image, index) => ({
      image,
      name: product.name,
      label: index === 0 ? 'Model fit' : index === 1 ? 'Design detail' : 'Drop preview',
      category: product.category
    }));
  });
  const shots = productShots.length ? productShots : [
    { image: '/placeholder/product-1.svg', name: 'DDKDS fit preview', label: 'Model fit', category: 'Streetwear' },
    { image: '/placeholder/product-2.svg', name: 'Chrome design detail', label: 'Design detail', category: 'Y2K' },
    { image: '/placeholder/product-3.svg', name: 'Drop styling', label: 'Drop preview', category: 'Limited' }
  ];
  const loop = [...shots, ...shots];
  return <section className="visual-runway" aria-label="Featured model and design photos">
    <div className="visual-runway-head">
      <div>
        <p className="eyebrow">MODEL / DESIGN / DETAIL</p>
        <h2>Featured Visuals</h2>
      </div>
      <span>Moving lookbook</span>
    </div>
    <div className="visual-runway-track-wrap">
      <div className="visual-runway-track">
        {loop.map((shot, index) => <figure className="visual-shot" key={`${shot.image}-${index}`}>
          <img src={asset(shot.image)} alt={`${shot.name} ${shot.label}`} loading="lazy" decoding="async"/>
          <figcaption><span>{shot.label}</span><strong>{shot.name}</strong><small>{shot.category}</small></figcaption>
        </figure>)}
      </div>
    </div>
  </section>;
}

function ProductSection({ title, products }) { return <SectionWithMotionBackground section="products"><section><h2>{title}</h2><div className="grid four">{products.map(p => <ProductCard key={p.id} product={p}/>)}</div></section></SectionWithMotionBackground>; }
function ProductCard({ product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const isSoldOut = Number(product.stock || 0) <= 0 || product.status === 'Sold Out';
  const isLowStock = !isSoldOut && Number(product.stock || 0) <= 5;
  const badge = isSoldOut ? 'SOLD OUT' : isLowStock ? 'LOW STOCK' : product.limited_drop ? 'LIMITED' : product.best_seller ? 'BEST SELLER' : product.featured ? 'NEW DROP' : 'DDKDS';
  const colors = (product.colors || []).slice(0, 4);
  const addItem = () => {
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  };
  return <div className={`product card clean-product luxury-product ${isSoldOut ? 'sold-out-card' : ''}`}>
    <span className={`badge product-badge ${isSoldOut ? 'soldout' : ''}`}>{badge}</span>
    <button className="wishlist" title="Wishlist" aria-label="Wishlist"><Heart size={18}/></button>
    <Link to={`/product/${product.id}`}><div className="product-image-wrap"><img src={asset(product.images?.[0])} alt={product.name} loading="lazy" decoding="async"/>{isSoldOut && <div className="sold-overlay">SOLD OUT</div>}</div><h3>{product.name}</h3></Link>
    <div className="product-meta-row"><p className="muted">{product.category}</p>{colors.length > 0 && <div className="swatches" aria-label="Available colors">{colors.map(color => <span key={color} title={color} style={{'--swatch': color.toLowerCase()}} />)}</div>}</div>
    {isLowStock && <p className="low-stock-text">Only {product.stock} left</p>}
    <div className="between product-buy-row"><strong>{pesos(product.price)}</strong><button disabled={isSoldOut} className={`icon-btn red-bg cart-pop add-cart-effect ${added ? 'added' : ''}`} onClick={addItem}>{isSoldOut ? 'Sold' : added ? 'Added' : <ShoppingBag size={18}/>}</button></div>
    <Link to={`/product/${product.id}`} className="quick-view">View Details</Link>
  </div>;
}

function Shop() {
  const [products,setProducts]=useState([]), [search,setSearch]=useState(''), [category,setCategory]=useState(''), [filtersOpen,setFiltersOpen]=useState(false), [dropStatus,setDropStatus]=useState('');
  useEffect(()=>{ request(`/api/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`).then(rows => {
    const filtered = rows.filter(p => {
      if (dropStatus === 'New Drop') return p.featured || p.new_arrival;
      if (dropStatus === 'Limited Stock') return p.limited_drop || Number(p.stock || 0) <= 5;
      if (dropStatus === 'Best Seller') return p.best_seller;
      if (dropStatus === 'Sold Out') return Number(p.stock || 0) <= 0 || p.status === 'Sold Out';
      return true;
    });
    setProducts(filtered);
  }); },[search,category,dropStatus]);
  const tabs = ['ALL','TEES','HOODIES','PANTS','POLOS','BAGS','CAPS','BONNETS','CROP TOPS','SHORTS'];
  const mapTab = {ALL:'',TEES:'T-shirts',HOODIES:'Hoodies',PANTS:'Pants',POLOS:'Polo shirts',BAGS:'Bags',CAPS:'Caps',BONNETS:'Bonnets','CROP TOPS':'Crop tops',SHORTS:'Shorts'};
  return <main><PageTitle title="SHOP THE DROP" sub="Search, filter, wishlist, and add premium DDKDS streetwear to your cart."/>
    <div className="category-tabs clean-tabs">{tabs.map(t=><button key={t} className={category===mapTab[t]?'active':''} onClick={()=>setCategory(mapTab[t])}>{t}</button>)}</div>
    <button className="btn filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={18}/> {filtersOpen ? 'Hide Filters' : 'Filter Products'}</button>
    {filtersOpen && <div className="toolbar filter-panel"><div className="search"><Search size={18}/><input placeholder="Search the drop..." value={search} onChange={e=>setSearch(e.target.value)}/></div><select value={category} onChange={e=>setCategory(e.target.value)}><option value="">All Categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select><select value={dropStatus} onChange={e=>setDropStatus(e.target.value)}><option value="">All Drop Status</option><option>New Drop</option><option>Limited Stock</option><option>Best Seller</option><option>Sold Out</option></select></div>}
    <div className="grid four product-grid-clean">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div>
  </main>;
}

function ProductImageGallery({ product }) {
  const images = product.images?.length ? product.images : ['/placeholder/product-1.svg'];
  const [active, setActive] = useState(images[0]);
  useEffect(() => setActive(images[0]), [product.id, images[0]]);
  return <div className="product-gallery">
    <div className="product-gallery-main"><img src={asset(active)} alt={product.name} loading="lazy" decoding="async"/></div>
    {images.length > 1 && <div className="product-gallery-thumbs" aria-label="Product image gallery">
      {images.map((img, index) => <button type="button" key={`${img}-${index}`} className={img === active ? 'active' : ''} onClick={() => setActive(img)}>
        <img src={asset(img)} alt={`${product.name} view ${index + 1}`} loading="lazy" decoding="async"/>
      </button>)}
    </div>}
  </div>;
}

const blankSizeRow = size => ({ size, chest: '', length: '', fit: '' });
function productSizeRows(product) {
  const saved = Array.isArray(product?.size_chart) ? product.size_chart.filter(row => row.size || row.chest || row.length || row.fit) : [];
  if (saved.length) return saved;
  return (product?.sizes?.length ? product.sizes : ['One Size']).map(blankSizeRow);
}

function ProductSizeChart({ product }) {
  const rows = productSizeRows(product);
  return <div className="product-size-template">
    <div className="size-template-head"><Ruler size={16}/><div><strong>Sizing for this item</strong><small>Measurements are filled by admin per product.</small></div></div>
    <table><thead><tr><th>Size</th><th>Chest</th><th>Length</th><th>Best fit</th></tr></thead><tbody>{rows.map((row,index)=><tr key={`${row.size}-${index}`}><td>{row.size || '-'}</td><td>{row.chest || '-'}</td><td>{row.length || '-'}</td><td>{row.fit || '-'}</td></tr>)}</tbody></table>
  </div>;
}

function ProductDetails() {
  const { id } = useParams(); const { add } = useCart(); const [p,setP]=useState(null), [size,setSize]=useState(''), [color,setColor]=useState(''), [added,setAdded]=useState(false);
  useEffect(()=>{request(`/api/products/${id}`).then(x=>{setP(x); setSize(x.sizes?.[0]||''); setColor(x.colors?.[0]||'');});},[id]);
  if(!p) return <main><p>Loading product...</p></main>;
  const isSoldOut = Number(p.stock || 0) <= 0 || p.status === 'Sold Out';
  const addSelected = () => {
    add(p,size,color);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };
  return <main>
    <SectionWithMotionBackground section="productDetails">
    <div className="details">
      <ProductImageGallery product={p}/>
      <div className="card">
        <p className="eyebrow">{p.category}</p><h1>{p.name}</h1><h2>{pesos(p.price)}</h2><p>{p.description}</p>
        <label>Size</label><select value={size} onChange={e=>setSize(e.target.value)}>{(p.sizes||[]).map(s=><option key={s}>{s}</option>)}</select>
        <ProductSizeChart product={p}/>
        <label>Color</label><select value={color} onChange={e=>setColor(e.target.value)}>{(p.colors||[]).map(c=><option key={c}>{c}</option>)}</select>
        <p className={isSoldOut ? 'red' : ''}>Stock: {isSoldOut ? 'Sold Out' : p.stock}</p>
        <button disabled={isSoldOut} className={`btn primary add-cart-effect ${added ? 'added' : ''}`} onClick={addSelected}>{isSoldOut ? 'Sold Out' : added ? 'Added to Cart' : 'Add to Cart'}</button>
      </div>
    </div>
    </SectionWithMotionBackground>
    <section className="product-review-section"><CustomerReviewForm productId={p.id} productName={p.name}/></section>
  </main>;
}

function RatingStars({ value, onChange, readOnly=false }) {
  return <div className={`rating-stars ${readOnly ? 'read-only' : ''}`} aria-label={`${value} star rating`}>
    {[1,2,3,4,5].map(n => <button key={n} type="button" disabled={readOnly} className={n <= Number(value) ? 'active' : ''} onClick={() => !readOnly && onChange(n)}>★</button>)}
  </div>;
}

function CustomerReviewForm({ productId='', productName='', onSubmitted }) {
  const [products,setProducts]=useState([]);
  const [form,setForm]=useState({customer_name:'',product_id:productId || '',rating:5,comment:''});
  const [message,setMessage]=useState('');
  const [saving,setSaving]=useState(false);
  useEffect(()=>{ if(productId){ setForm(f=>({...f,product_id:productId})); } else { request('/api/products').then(setProducts).catch(()=>{}); } },[productId]);
  const submit=async e=>{
    e.preventDefault();
    setMessage('');
    if(!form.customer_name.trim() || !form.comment.trim()) { setMessage('Please add your name and short review.'); return; }
    setSaving(true);
    try {
      const selectedProduct = productName || products.find(p => String(p.id) === String(form.product_id))?.name || '';
      await request('/api/reviews',{method:'POST',body:JSON.stringify({...form,rating:Number(form.rating)})});
      onSubmitted?.({...form,product_name:selectedProduct,status:'Pending',id:`pending-${Date.now()}`});
      setForm({customer_name:'',product_id:productId || '',rating:5,comment:''});
      setMessage('Review submitted. It is waiting for admin approval.');
    } catch (err) {
      setMessage(err.message || 'Could not submit review. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  return <form className="review-form card" onSubmit={submit}>
    <div className="review-form-head"><div><p className="eyebrow">REVIEW</p><h2>Write a Review</h2><p className="muted">Short, honest feedback. Admin approves reviews before they go public.</p></div><RatingStars value={form.rating} onChange={rating=>setForm({...form,rating})}/></div>
    <div className="review-form-grid">
      <input required placeholder="Your name" value={form.customer_name} onChange={e=>setForm({...form,customer_name:e.target.value})}/>
      {!productId && <select value={form.product_id} onChange={e=>setForm({...form,product_id:e.target.value})}><option value="">Select product (optional)</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>}
    </div>
    <textarea required maxLength="240" placeholder="Write a short review, example: Quality is premium and fit is clean." value={form.comment} onChange={e=>setForm({...form,comment:e.target.value})}/>
    <div className="between review-form-bottom"><small>{form.comment.length}/240 characters</small><button className="btn primary" disabled={saving}>{saving ? 'Submitting...' : 'Submit Review'}</button></div>
    {message && <p className="form-message">{message}</p>}
  </form>;
}

function CustomerReviewsSection({ reviews=[], compact=false, pendingReviews=[] }) {
  const [content,setContent]=useState(siteDefaults);
  useEffect(()=>{request('/api/site-content').then(x=>setContent({...siteDefaults,...x})).catch(()=>{})},[]);
  const visibleReviews = [...pendingReviews, ...reviews].slice(0, compact ? 3 : 12);
  return <section className="reviews customer-review-block">
    <div className="section-head split-head"><div><p className="eyebrow">{content.reviews_eyebrow}</p><h2>{content.reviews_title}</h2><p className="muted">{content.reviews_description}</p></div>{compact && <Link to="/reviews" className="btn ghost">{content.reviews_view_button}</Link>}</div>
    <div className="grid three review-grid">{visibleReviews.map(r => <ReviewCard key={r.id} review={r}/>)}</div>
    {!visibleReviews.length && <p className="muted">No approved reviews yet. Be the first to rate the drop.</p>}
    {!compact && null}
  </section>;
}

function ReviewCard({ review }) {
  return <div className="card review-card"><div className="review-card-top"><RatingStars value={review.rating || 5} readOnly/>{review.status === 'Pending' && <span className="badge pending-badge">Pending</span>}</div><h3>{review.customer_name}</h3>{review.product_name && <p className="muted small-text">{review.product_name}</p>}<p>{review.comment}</p></div>;
}

function ReviewsPage(){
  const [reviews,setReviews]=useState([]);
  const [pendingReviews,setPendingReviews]=useState([]);
  const [err,setErr]=useState('');
  useEffect(()=>{request('/api/reviews').then(setReviews).catch(e=>setErr(e.message || 'Could not load reviews'))},[]);
  return <main className="reviews-page"><PageTitle title="Reviews" sub="Minimal feedback from DDKDS customers." />{err&&<p className="form-message error-message">{err}</p>}<CustomerReviewForm onSubmitted={review=>setPendingReviews(prev=>[review,...prev])}/><CustomerReviewsSection reviews={reviews} pendingReviews={pendingReviews}/></main>;
}

function GoogleSignInButton({ onClick }) {
  return <button type="button" className="btn google-btn" onClick={onClick}>Continue with Google</button>;
}

function Account() {
  const { customer, signedIn, register, login, googleLogin, logout } = useCustomer();
  const nav = useNavigate();
  const [mode,setMode]=useState('login');
  const [form,setForm]=useState({name:'',email:'',password:''});
  const [err,setErr]=useState(''),[msg,setMsg]=useState('');
  const submit=async e=>{
    e.preventDefault();
    setErr(''); setMsg('');
    try{
      if(mode==='register') await register(form);
      else await login(form);
      setMsg('Signed in. You can now checkout.');
    }catch(error){setErr(error.message || 'Could not sign in');}
  };
  if (signedIn) return <main className="account-page"><SectionWithMotionBackground section="login"><PageTitle title="My Account" sub="Your DDKDS checkout profile."/><div className="account-card card"><div className="account-avatar">{customer.avatar ? <img src={customer.avatar} alt={customer.name}/> : <User/>}</div><h2>{customer.name}</h2><p className="muted">{customer.email}</p><div className="row-actions"><Link className="btn primary" to="/checkout">Continue Checkout</Link><button className="btn ghost" onClick={()=>{logout();nav('/')}}>Sign Out</button></div></div></SectionWithMotionBackground></main>;
  return <main className="account-page"><SectionWithMotionBackground section="login"><PageTitle title="Customer Account" sub="Create an account or sign in before placing an order."/><form className="form card account-form" onSubmit={submit}><div className="account-tabs"><button type="button" className={mode==='login'?'active':''} onClick={()=>setMode('login')}>Sign in</button><button type="button" className={mode==='register'?'active':''} onClick={()=>setMode('register')}>Create account</button></div>{mode==='register'&&<input required placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>}<input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input required type="password" minLength="6" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button className="btn primary">{mode==='register'?'Create Account':'Sign In'}</button><div className="account-divider"><span>or</span></div><GoogleSignInButton onClick={googleLogin}/>{err&&<p className="form-message error-message">{err}</p>}{msg&&<p className="form-message">{msg}</p>}<p className="muted small-text">Your account is for checkout only. Admin stays separate.</p></form></SectionWithMotionBackground></main>;
}

function AuthSuccess() {
  const nav = useNavigate();
  const { loadProfile } = useCustomer();
  const [message,setMessage]=useState('Finishing Google sign in...');
  useEffect(()=>{
    const token = new URLSearchParams(window.location.search).get('token');
    if(!token){ setMessage('Missing login token. Please try signing in again.'); return; }
    localStorage.setItem('deadkids_customer_token', token);
    loadProfile().then(()=>nav('/account', { replace:true })).catch(()=>setMessage('Could not finish Google sign in. Please try again.'));
  },[loadProfile,nav]);
  return <main className="account-page"><SectionWithMotionBackground section="login"><div className="card account-card"><User/><h2>{message}</h2></div></SectionWithMotionBackground></main>;
}

function Cart() { const {items,remove,update,total}=useCart(); return <main><SectionWithMotionBackground section="checkout"><PageTitle title="Cart" sub="Review your selected DDKDS items."/>{items.map(i=><div className="cart-row card" key={i.key}><img src={API+(i.image||'/placeholder/product-1.svg')} alt={i.name} loading="lazy" decoding="async"/><div><h3>{i.name}</h3><p>{i.size} / {i.color}</p></div><strong>{pesos(i.price)}</strong><input type="number" value={i.qty} onChange={e=>update(i.key,Number(e.target.value))}/><button className="icon-btn" onClick={()=>remove(i.key)}><Trash2/></button></div>)}<div className="checkout-box"><h2>Total: {pesos(total)}</h2><Link className="btn primary" to="/checkout">Checkout</Link></div></SectionWithMotionBackground></main>; }

function Checkout() { const {items,total,clear}=useCart(); const {customer,signedIn}=useCustomer(); const nav=useNavigate(); const [content,setContent]=useState({payment_methods:'GCash,Maya,Bank Transfer,COD',checkout_note:'Alternative ordering: Google Form, Facebook Messenger, Instagram DM, WhatsApp, or email.'}); const [form,setForm]=useState({customer_name:'',email:'',phone:'',address:'',payment_method:'GCash'}); const [err,setErr]=useState(''); useEffect(()=>{request('/api/site-content').then(x=>{setContent({...content,...x}); const first=String(x.payment_methods||content.payment_methods).split(',').map(v=>v.trim()).filter(Boolean)[0]||'GCash'; setForm(f=>({...f,payment_method:first}));}).catch(()=>{})},[]); useEffect(()=>{if(customer)setForm(f=>({...f,customer_name:f.customer_name||customer.name||'',email:f.email||customer.email||''}))},[customer]); const methods=String(content.payment_methods||'GCash,Maya,Bank Transfer,COD').split(',').map(v=>v.trim()).filter(Boolean); const submit=async e=>{e.preventDefault(); setErr(''); try{const res=await customerRequest('/api/orders',{method:'POST',body:JSON.stringify({...form,items,total})}); localStorage.setItem('deadkids_last_order', JSON.stringify({order_number:res.order_number,total,payment_method:form.payment_method,customer_name:form.customer_name})); clear(); nav('/receipt');}catch(error){setErr(error.message || 'Could not place order')}}; if(!signedIn)return <main><SectionWithMotionBackground section="checkout"><PageTitle title="Sign In to Checkout" sub="Create an account or sign in before placing your DDKDS order."/><div className="card checkout-login-card"><User/><h2>Customer account required</h2><p className="muted">This keeps your order connected to your profile and makes checkout cleaner.</p><Link className="btn primary" to="/account">Sign in / Create Account</Link></div></SectionWithMotionBackground></main>; return <main><SectionWithMotionBackground section="checkout"><PageTitle title="Checkout" sub={content.checkout_title || 'Pay securely using your preferred payment method.'}/><form className="form card" onSubmit={submit}>{['customer_name','email','phone','address'].map(k=><input key={k} required={k==='customer_name'} placeholder={k.replace('_',' ')} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}<select value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})}>{methods.map(x=><option key={x}>{x}</option>)}</select><div className="order-summary"><h3>Total: {pesos(total)}</h3><p className="muted">Items: {items.length}</p></div>{err&&<p className="form-message error-message">{err}</p>}<button className="btn primary">{content.checkout_button || 'Place Order'}</button><p className="muted">{content.checkout_note}</p></form></SectionWithMotionBackground></main>; }

function ReceiptPage(){ const order = safeJson('deadkids_last_order', null); return <main><PageTitle title="Order Receipt" sub="Your order has been received."/><div className="card receipt-card"><ReceiptText className="red"/><h2>Thank you for your order</h2>{order ? <><p><strong>Order Number:</strong> {order.order_number}</p><p><strong>Payment Method:</strong> {order.payment_method}</p><p><strong>Total:</strong> {pesos(order.total)}</p><p><strong>Status:</strong> Pending</p><div className="row-actions"><Link className="btn primary" to="/shop">Back to Shop</Link><Link className="btn ghost" to="/track">Track Order</Link></div></> : <><p>No recent order found.</p><Link className="btn primary" to="/shop">Back to Shop</Link></>}</div></main>}

function SizeGuide(){return <main><PageTitle title="Size Guide" sub="Use this quick guide before placing your order."/><div className="card size-guide-card"><table><thead><tr><th>Size</th><th>Chest</th><th>Length</th><th>Best Fit</th></tr></thead><tbody>{[['S','18 in','26 in','Slim / small frame'],['M','20 in','28 in','Regular fit'],['L','22 in','29 in','Relaxed fit'],['XL','24 in','30 in','Oversized fit'],['XXL','26 in','31 in','Loose oversized']].map(r=><tr key={r[0]}>{r.map(c=><td key={c}>{c}</td>)}</tr>)}</tbody></table><p className="muted">Measurements are guide only. For oversized streetwear fit, choose one size up.</p></div></main>}

function Track() { const [num,setNum]=useState(''),[order,setOrder]=useState(null),[err,setErr]=useState(''); const track=async()=>{try{setErr('');setOrder(await request(`/api/orders/track/${num.trim()}`));}catch(e){setErr(e.message)}}; return <main><PageTitle title="Order Tracking" sub="Enter your DDKDS order number."/><div className="form card"><input placeholder="DDKDS-XXXXXXXX" value={num} onChange={e=>setNum(e.target.value)}/><button className="btn primary" onClick={track}>Track Order</button>{err&&<p className="red">{err}</p>}{order&&<div className="timeline"><h2>{order.order_number}</h2>{['Pending','Processing','Shipped','Out for Delivery','Completed'].map(s=><div className={s===order.status?'step active':'step'} key={s}>{s}</div>)}</div>}</div></main>; }
function About(){const [c,setC]=useState({about_title:'About DDKDS CLO',about_subtitle:'Modern streetwear, comfort, confidence, and bold fashion.',about_story:'DDKDS CLO is built for people who want clean but bold urban clothing. The brand combines minimalist design, luxury streetwear, grunge details, and Y2K-inspired energy.',mission:'To create premium everyday streetwear that makes customers feel confident.',vision:'To become a recognizable local streetwear brand known for quality, creativity, and strong identity.'}); useEffect(()=>{request('/api/site-content').then(x=>setC({...c,...x})).catch(()=>{})},[]); return <main><SectionWithMotionBackground section="about"><PageTitle title={c.about_title} sub={c.about_subtitle}/><div className="card prose"><h2>Brand Story</h2><p>{c.about_story}</p><h2>Mission</h2><p>{c.mission}</p><h2>Vision</h2><p>{c.vision}</p></div></SectionWithMotionBackground></main>}
function Contact(){const [f,setF]=useState({name:'',email:'',message:''}); const [c,setC]=useState({contact_title:'Contact',contact_subtitle:'Message DDKDS CLO for orders, collabs, or support.',contact_channels:'Messenger • Instagram DM • WhatsApp • Email'}); useEffect(()=>{request('/api/site-content').then(x=>setC({...c,...x})).catch(()=>{})},[]); const send=async e=>{e.preventDefault(); await request('/api/contact',{method:'POST',body:JSON.stringify(f)}); setF({name:'',email:'',message:''}); alert('Message sent!')}; return <main><PageTitle title={c.contact_title} sub={c.contact_subtitle}/><form onSubmit={send} className="form card"><input required placeholder="Name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/><input placeholder="Email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/><textarea required placeholder="Message" value={f.message} onChange={e=>setF({...f,message:e.target.value})}/><button className="btn primary">Send Message</button><p>{c.contact_channels}</p></form></main>}
function PageTitle({title,sub}){const [c,setC]=useState(siteDefaults);useEffect(()=>{request('/api/site-content').then(x=>setC({...siteDefaults,...x})).catch(()=>{})},[]);return <section className="page-title"><p className="eyebrow">{c.page_eyebrow}</p><h1>{title}</h1><p>{sub}</p></section>}
function Footer(){const [c,setC]=useState(siteDefaults); useEffect(()=>{request('/api/site-content').then(x=>setC({...siteDefaults,...x})).catch(()=>{})},[]); return <SectionWithMotionBackground section="footer"><footer><div className="footer-main"><strong>{c.footer_brand}</strong><p>{c.footer_text}</p></div><Link className="footer-admin-link" to="/admin/login" aria-label={c.footer_admin_label}>{c.footer_admin_label}</Link></footer></SectionWithMotionBackground>}

function AdminLogin(){const nav=useNavigate(); const [email,setEmail]=useState('admin@deadkids.com'),[password,setPassword]=useState('admin123'),[err,setErr]=useState(''); const login=async e=>{e.preventDefault();try{const r=await request('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})});localStorage.setItem('deadkids_token',r.token);nav('/admin')}catch(e){setErr(e.message === 'Failed to fetch' ? 'Backend is not connected. Please run npm run dev and make sure the server says DDKDS CLO API running on http://localhost:5000.' : e.message)}}; return <main className="admin-login-page"><SectionWithMotionBackground section="login"><div className="admin-login-top"><Link to="/" className="btn ghost">← Back to Customer Shop</Link><span>Separate Admin Portal</span></div><form className="form card login" onSubmit={login}><p className="eyebrow">DDKDS ADMIN</p><h1>Admin Login</h1><p className="muted">Manage products, reviews, messages, and website content.</p><input value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/>{err&&<p className="red">{err}</p>}<button className="btn primary">Login</button></form></SectionWithMotionBackground></main>}
function AdminLayout(){const nav=useNavigate(); useEffect(()=>{if(!localStorage.getItem('deadkids_token')) nav('/admin/login', { replace:true });},[nav]); const logout=()=>{localStorage.removeItem('deadkids_token');nav('/admin/login')}; return <main className="admin"><aside><h2>DDKDS Admin</h2><Link className="admin-store-link" to="/">View Store</Link><NavLink to="/admin" end><LayoutDashboard/> Dashboard</NavLink><NavLink to="/admin/products"><Package/> Products</NavLink><NavLink to="/admin/hero-banners"><ImagePlus/> Hero Banner</NavLink><NavLink to="/admin/backgrounds"><Sparkles/> Backgrounds</NavLink><NavLink to="/admin/reviews"><Star/> Reviews</NavLink><NavLink to="/admin/messages"><MessageSquare/> Messages</NavLink><NavLink to="/admin/settings"><Settings/> Settings</NavLink><button onClick={logout}><LogOut/> Logout</button></aside><section className="admin-content"><Routes><Route index element={<AdminDashboard/>}/><Route path="products" element={<AdminProducts/>}/><Route path="hero-banners" element={<AdminHeroBanners/>}/><Route path="backgrounds" element={<BackgroundManager/>}/><Route path="reviews" element={<AdminReviews/>}/><Route path="messages" element={<AdminMessages/>}/><Route path="settings" element={<AdminSettings/>}/></Routes></section></main>}
function AdminDashboard(){
  const defaultStats={products:0,reviews:0};
  const [s,setS]=useState(defaultStats),[err,setErr]=useState(''),[loading,setLoading]=useState(true);
  const load=()=>{setLoading(true);request('/api/admin/stats').then(x=>{setS({...defaultStats,...x});setErr('')}).catch(e=>setErr(e.message||'Could not load dashboard')).finally(()=>setLoading(false))};
  useEffect(load,[]);
  const cards=[['products','Products','Total items in shop'],['reviews','Reviews','Customer ratings']];
  return <><div className="admin-page-head"><div><p className="eyebrow">Admin Overview</p><h1>Dashboard</h1><p className="muted">Quick summary of products, reviews, messages, and website content.</p></div><div className="row-actions"><Link className="btn ghost" to="/">View Store</Link><button className="btn ghost" onClick={load}>Refresh</button></div></div>{err&&<AdminHelp title="Dashboard notice">{err}. Make sure backend is running and you are logged in.</AdminHelp>}{loading&&<p className="muted">Loading dashboard...</p>}<div className="grid four admin-dashboard-cards">{cards.map(([key,label,help])=><div className="card stat solid-card" key={key}><p>{label}</p><h2>{s[key]||0}</h2><small>{help}</small></div>)}</div><div className="grid two"><div className="card admin-guide solid-card"><h2>Start here</h2><p>Use <strong>Products</strong> to add items and upload photos. Use <strong>Reviews</strong> to approve customer feedback. Use <strong>Settings</strong> to edit customer website content.</p></div><div className="card admin-guide solid-card"><h2>Quick actions</h2><div className="row-actions"><Link className="btn primary" to="/admin/products">Add Product</Link><Link className="btn ghost" to="/admin/reviews">Review Feedback</Link><Link className="btn ghost" to="/admin/settings">Edit Website</Link></div></div></div></>}


function AdminHelp({title, children}){return <div className="admin-help"><strong>{title}</strong><p>{children}</p></div>}
function AdminProducts(){
  const empty={name:'',category:'T-shirts',description:'',price:0,sizes:['S','M','L'],size_chart:['S','M','L'].map(blankSizeRow),colors:['Black'],stock:0,images:[],status:'Active',featured:false,best_seller:false,limited_drop:false,new_arrival:false,sort_order:9999};
  const [items,setItems]=useState([]),[form,setForm]=useState(empty),[editing,setEditing]=useState(null),[query,setQuery]=useState(''),[category,setCategory]=useState(''),[savingOrder,setSavingOrder]=useState(false);
  const load=()=>request('/api/products?status=all').then(setItems);
  useEffect(load,[]);
  const reset=()=>{setForm(empty);setEditing(null)};
  const edit=item=>{setEditing(item.id);setForm({...empty,...item,images:item.images||[]});window.scrollTo({top:0,behavior:'smooth'})};
  const save=async e=>{e.preventDefault(); const payload={...form,price:Number(form.price||0),stock:Number(form.stock||0)}; if(editing){await request(`/api/products/${editing}`,{method:'PUT',body:JSON.stringify(payload)}); alert('Product updated!')} else {await request('/api/products',{method:'POST',body:JSON.stringify(payload)}); alert('Product added!')} reset(); load();};
  const del=async id=>{if(confirm('Delete this product?')){await request(`/api/products/${id}`,{method:'DELETE'});load()}};
  const filtered=items.filter(p=>(!query||p.name.toLowerCase().includes(query.toLowerCase()))&&(!category||p.category===category));
  const canSort=!query&&!category;
  const reorder=async nextRows=>{
    setItems(nextRows);
    setSavingOrder(true);
    try{await request('/api/products/reorder/list',{method:'PUT',body:JSON.stringify({ids:nextRows.map(p=>p.id)})});}
    catch(err){alert(err.message || 'Could not save product order.'); load();}
    finally{setSavingOrder(false);}
  };
  return <><div className="admin-page-head"><div><p className="eyebrow">STEP 1</p><h1>Products</h1><p className="muted">Add, upload pictures, edit price/stock, and control what customers see in the shop.</p></div><button className="btn ghost" onClick={reset}>New Product</button></div><AdminHelp title="How to use">Upload multiple images for the product gallery. Drag products or use Move Up/Down to control product order in the customer shop. Clear search/category filters before sorting.</AdminHelp><AdminProductForm form={form} setForm={setForm} save={save} editing={editing} reset={reset}/><div className="card admin-list-card"><div className="admin-toolbar"><input placeholder="Search products..." value={query} onChange={e=>setQuery(e.target.value)}/><select value={category} onChange={e=>setCategory(e.target.value)}><option value="">All categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select></div><div className="sort-note"><strong>Product order:</strong> {canSort ? (savingOrder ? 'Saving order...' : 'Drag rows or use Move Up/Down. The order saves automatically.') : 'Clear search and category filter to sort all products.'}</div><AdminProductTable rows={filtered} onEdit={edit} onDelete={del} onReorder={canSort?reorder:null}/></div></>}

function AdminImageUploader({ label='Upload image', multiple=false, images, onChange }) {
  const currentImages = Array.isArray(images) ? images : (images ? [images] : []);
  const [busy, setBusy] = useState(false);
  const handleFiles = async e => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const result = await uploadImage(file);
        uploaded.push(result.url);
      }
      if (multiple) onChange([...(Array.isArray(images) ? images : []), ...uploaded]);
      else onChange(uploaded[0] || '');
    } catch (err) {
      alert(err.message || 'Upload failed. Make sure you are logged in as admin.');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };
  const remove = img => {
    if (multiple) onChange(currentImages.filter(x => x !== img));
    else onChange('');
  };
  const moveImage = (from, direction) => {
    if (!multiple) return;
    const to = from + direction;
    if (to < 0 || to >= currentImages.length) return;
    const next = [...currentImages];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };
  return <div className="upload-panel">
    <label>{label}</label>
    <label className="upload-box">
      <UploadCloud/>
      <strong>{busy ? 'Uploading...' : 'Click to upload picture'}</strong>
      <span>{multiple ? 'Upload front, back, close-up, and model photos. First image becomes the cover photo.' : 'Upload one teaser/featured image'}</span>
      <input type="file" accept="image/*" multiple={multiple} onChange={handleFiles}/>
    </label>
    {!!currentImages.length && <div className="upload-preview-grid gallery-admin-preview">
      {currentImages.map((img,index) => <div className="upload-preview" key={`${img}-${index}`}>
        <img src={asset(img)} alt="Uploaded preview" loading="lazy" decoding="async"/>
        <button type="button" className="remove-upload" onClick={() => remove(img)}><X size={16}/></button>
        {multiple && <div className="image-order-actions"><button type="button" disabled={index===0} onClick={()=>moveImage(index,-1)}>←</button><button type="button" disabled={index===currentImages.length-1} onClick={()=>moveImage(index,1)}>→</button></div>}
        {multiple && index===0 && <span className="cover-badge">Cover</span>}
      </div>)}
    </div>}
  </div>;
}

function AdminSizeChartEditor({ form, setForm }) {
  const rows = Array.isArray(form.size_chart) && form.size_chart.length ? form.size_chart : (form.sizes || ['S','M','L']).map(blankSizeRow);
  const updateRow = (index, key, value) => {
    const next = rows.map((row, i) => i === index ? { ...row, [key]: value } : row);
    setForm({ ...form, size_chart: next, sizes: next.map(row => row.size).filter(Boolean) });
  };
  const addRow = () => setForm({ ...form, size_chart: [...rows, blankSizeRow('') ] });
  const removeRow = index => {
    const next = rows.filter((_, i) => i !== index);
    setForm({ ...form, size_chart: next, sizes: next.map(row => row.size).filter(Boolean) });
  };
  return <div className="admin-size-template">
    <div className="form-title-row"><div><label>Item sizing template</label><p className="muted">Fill only numbers or short notes. Customers see this after opening the item.</p></div><button type="button" className="btn ghost" onClick={addRow}>Add Size</button></div>
    <div className="admin-size-grid">{rows.map((row,index)=><div className="admin-size-row" key={index}>
      <input placeholder="Size" value={row.size || ''} onChange={e=>updateRow(index,'size',e.target.value)}/>
      <input placeholder="Chest, ex: 22 in" value={row.chest || ''} onChange={e=>updateRow(index,'chest',e.target.value)}/>
      <input placeholder="Length, ex: 29 in" value={row.length || ''} onChange={e=>updateRow(index,'length',e.target.value)}/>
      <input placeholder="Best fit" value={row.fit || ''} onChange={e=>updateRow(index,'fit',e.target.value)}/>
      <button type="button" className="icon-btn" onClick={()=>removeRow(index)}><X size={16}/></button>
    </div>)}</div>
  </div>;
}

function AdminProductForm({form,setForm,save,editing,reset}){return <form className="form card admin-editor" onSubmit={save}><div className="form-title-row"><div><p className="eyebrow">Product Editor</p><h2>{editing?'Edit Product':'Add New Product'}</h2></div>{editing&&<button type="button" className="btn ghost" onClick={reset}>Cancel Edit</button>}</div><AdminImageUploader label="Upload product pictures" multiple images={form.images || []} onChange={images=>setForm({...form,images})}/><label>Product name shown to customers</label><input required placeholder="Example: DDKDS Redline Tee" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><div className="form-grid"><div><label>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></div><div><label>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{['Active','Draft','Sold Out','Hidden'].map(x=><option key={x}>{x}</option>)}</select></div></div><div className="form-grid"><div><label>Price</label><input type="number" min="0" placeholder="699" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})}/></div><div><label>Stock</label><input type="number" min="0" placeholder="20" value={form.stock} onChange={e=>setForm({...form,stock:Number(e.target.value)})}/></div></div><AdminSizeChartEditor form={form} setForm={setForm}/><label>Available colors</label><input placeholder="Black,Red,White" value={(form.colors||[]).join(',')} onChange={e=>setForm({...form,colors:e.target.value.split(',').map(x=>x.trim()).filter(Boolean)})}/><label>Description</label><textarea placeholder="Describe the product for customers" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><div className="checks nice-checks"><label><input type="checkbox" checked={!!form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Feature in product sections</label><label><input type="checkbox" checked={!!form.best_seller} onChange={e=>setForm({...form,best_seller:e.target.checked})}/> Best Seller badge</label><label><input type="checkbox" checked={!!form.limited_drop} onChange={e=>setForm({...form,limited_drop:e.target.checked})}/> Limited Drop badge</label><label><input type="checkbox" checked={!!form.new_arrival} onChange={e=>setForm({...form,new_arrival:e.target.checked})}/> New Arrival</label></div><button className="btn primary"><Plus/> {editing?'Update Product':'Add Product'}</button></form>}
function AdminProductTable({rows,onEdit,onDelete,onReorder}){
  const [dragId,setDragId]=useState(null);
  const move=(index,dir)=>{
    if(!onReorder) return;
    const to=index+dir;
    if(to<0||to>=rows.length) return;
    const next=[...rows];
    [next[index],next[to]]=[next[to],next[index]];
    onReorder(next);
  };
  const dropOn=targetId=>{
    if(!onReorder || !dragId || dragId===targetId) return;
    const from=rows.findIndex(r=>String(r.id)===String(dragId));
    const to=rows.findIndex(r=>String(r.id)===String(targetId));
    if(from<0||to<0) return;
    const next=[...rows];
    const [moved]=next.splice(from,1);
    next.splice(to,0,moved);
    setDragId(null);
    onReorder(next);
  };
  return <div className="table admin-table-wrap"><table><thead><tr><th>Sort</th><th>Image</th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map((r,index)=>{const img=(r.images&&r.images[0])||r.teaser_image||'/placeholder/product-1.svg';return <tr key={r.id} draggable={!!onReorder} onDragStart={()=>setDragId(r.id)} onDragOver={e=>onReorder&&e.preventDefault()} onDrop={()=>dropOn(r.id)} className={dragId===r.id?'dragging-row':''}><td><div className="sort-controls"><span className="drag-handle">☰</span><button type="button" disabled={!onReorder||index===0} onClick={()=>move(index,-1)}>↑</button><button type="button" disabled={!onReorder||index===rows.length-1} onClick={()=>move(index,1)}>↓</button></div></td><td><img className="table-thumb" src={asset(img)} loading="lazy" decoding="async" alt="Preview"/><small>{(r.images||[]).length} photo{(r.images||[]).length===1?'':'s'}</small></td><td><strong>{r.name}</strong><small>{r.description}</small></td><td>{r.category}</td><td>{pesos(r.price)}</td><td>{r.stock}</td><td><span className="badge">{r.status}</span></td><td><div className="row-actions"><button type="button" onClick={()=>onEdit(r)}>Edit</button><button type="button" className="danger-btn" onClick={()=>onDelete(r.id)}>Delete</button></div></td></tr>})}</tbody></table></div>}
function AdminTable({rows,onDelete,onEdit}){return <div className="card table"><table><tbody>{rows.map(r=>{const img=(r.images&&r.images[0])||r.teaser_image||'/placeholder/product-1.svg';return <tr key={r.id}><td><img className="table-thumb" src={asset(img)} loading="lazy" decoding="async" alt="Preview"/></td><td>{r.name}</td><td>{r.category}</td><td>{pesos(r.price)}</td><td>{r.status}</td><td><div className="row-actions">{onEdit&&<button onClick={()=>onEdit(r)}>Edit</button>}<button className="danger-btn" onClick={()=>onDelete(r.id)}>Delete</button></div></td></tr>})}</tbody></table></div>}

const blankHeroBanner = () => ({ image_url:'', small_label:'LUXURY / Y2K / STREETWEAR', heading:'DEADKIDS', subtitle:'', button_text:'', button_link:'/shop', enabled:true });
function AdminHeroBanners(){
  const [rows,setRows]=useState([]),[form,setForm]=useState(blankHeroBanner()),[editing,setEditing]=useState(null),[err,setErr]=useState(''),[msg,setMsg]=useState(''),[settings,setSettings]=useState({hero_autoplay_enabled:true});
  const load=async()=>{setErr('');try{const [banners,content]=await Promise.all([request('/api/admin/hero-banners'),request('/api/site-content').catch(()=>({}))]);setRows(Array.isArray(banners)?banners:[]);setSettings({hero_autoplay_enabled:content.hero_autoplay_enabled !== false && content.hero_autoplay_enabled !== 'false'});}catch(e){setErr(e.message)}};
  useEffect(()=>{load()},[]);
  const reset=()=>{setEditing(null);setForm(blankHeroBanner());setMsg('');setErr('')};
  const save=async e=>{e.preventDefault();setErr('');setMsg('');try{const payload={...form,enabled:!!form.enabled};if(editing){await request(`/api/admin/hero-banners/${editing}`,{method:'PUT',body:JSON.stringify(payload)});setMsg('Hero banner updated.')}else{await request('/api/admin/hero-banners',{method:'POST',body:JSON.stringify(payload)});setMsg('Hero banner added.')}await load();reset();}catch(error){setErr(error.message)}};
  const saveAutoplay=async checked=>{setSettings({hero_autoplay_enabled:checked});try{await request('/api/site-content',{method:'PUT',body:JSON.stringify({hero_autoplay_enabled:checked})});setMsg('Autoplay setting saved.')}catch(e){setErr(e.message)}};
  const edit=row=>{setEditing(row.id);setForm({...blankHeroBanner(),...row,enabled:!!row.enabled});window.scrollTo({top:0,behavior:'smooth'})};
  const del=async id=>{if(!confirm('Delete this hero banner?'))return;setErr('');setMsg('');try{await request(`/api/admin/hero-banners/${id}`,{method:'DELETE'});setMsg('Hero banner deleted.');load();}catch(e){setErr(e.message)}};
  const toggle=async row=>{try{await request(`/api/admin/hero-banners/${row.id}`,{method:'PUT',body:JSON.stringify({...row,enabled:!row.enabled})});load();}catch(e){setErr(e.message)}};
  const setMain=async row=>{try{const ordered=[row,...rows.filter(item=>item.id!==row.id)];await request('/api/admin/hero-banners/reorder/list',{method:'PUT',body:JSON.stringify({ids:ordered.map(item=>item.id)})});if(!row.enabled)await request(`/api/admin/hero-banners/${row.id}`,{method:'PUT',body:JSON.stringify({...row,enabled:true,sort_order:1})});setMsg('Main hero banner set.');load();}catch(e){setErr(e.message)}};
  const move=(index,dir)=>{const to=index+dir;if(to<0||to>=rows.length)return;const next=[...rows];[next[index],next[to]]=[next[to],next[index]];setRows(next);request('/api/admin/hero-banners/reorder/list',{method:'PUT',body:JSON.stringify({ids:next.map(item=>item.id)})}).catch(e=>setErr(e.message));};
  return <><div className="admin-page-head"><div><p className="eyebrow">Homepage Visuals</p><h1>Hero Banner</h1><p className="muted">Upload one banner for a static hero, or enable multiple banners for a smooth carousel.</p></div><Link className="btn ghost" to="/">Preview Customer Site</Link></div>{err&&<AdminHelp title="Hero banner needs attention">{err}</AdminHelp>}{msg&&<p className="form-message">{msg}</p>}<div className="card hero-admin-control"><label className="check-row"><input type="checkbox" checked={!!settings.hero_autoplay_enabled} onChange={e=>saveAutoplay(e.target.checked)}/> Autoplay hero carousel when multiple banners are active</label></div><form className="form card admin-editor hero-banner-editor" onSubmit={save}><div className="form-title-row"><div><p className="eyebrow">{editing?'Edit Banner':'New Banner'}</p><h2>{editing?'Edit hero image':'Add hero image'}</h2></div>{editing&&<button type="button" className="btn ghost" onClick={reset}>Cancel Edit</button>}</div><AdminImageUploader label="Upload hero banner image" images={form.image_url} onChange={image_url=>setForm({...form,image_url})}/>{form.image_url&&<div className="hero-banner-preview"><img src={heroAsset(form.image_url)} alt="Hero preview"/><div><span>{form.small_label}</span><strong>{form.heading}</strong><p>{form.subtitle}</p></div></div>}<div className="form-grid"><Field label="Small label"><input value={form.small_label||''} onChange={e=>setForm({...form,small_label:e.target.value})}/></Field><Field label="Heading"><input value={form.heading||''} onChange={e=>setForm({...form,heading:e.target.value})}/></Field></div><Field label="Subtitle / short story"><textarea value={form.subtitle||''} onChange={e=>setForm({...form,subtitle:e.target.value})}/></Field><div className="form-grid"><Field label="Button text optional"><input value={form.button_text||''} onChange={e=>setForm({...form,button_text:e.target.value})}/></Field><Field label="Button link"><input value={form.button_link||''} onChange={e=>setForm({...form,button_link:e.target.value})}/></Field></div><label className="check-row"><input type="checkbox" checked={!!form.enabled} onChange={e=>setForm({...form,enabled:e.target.checked})}/> Show this hero image on the customer homepage</label><button className="btn primary">{editing?'Save Hero Banner':'Add Hero Banner'}</button></form><div className="grid two hero-banner-admin-grid">{rows.map((row,index)=><div className="card hero-admin-card" key={row.id}><img src={heroAsset(row.image_url)} alt={row.heading || 'Hero banner'} loading="lazy" decoding="async"/><div className="between"><div><span className="badge">{row.enabled?'Active':'Off'}</span><h3>{row.heading || 'Untitled banner'}</h3><p className="muted">{row.small_label || 'No small label'}</p></div><strong>#{index+1}</strong></div><p>{row.subtitle}</p><div className="row-actions"><button type="button" disabled={index===0} onClick={()=>move(index,-1)}>Move Up</button><button type="button" disabled={index===rows.length-1} onClick={()=>move(index,1)}>Move Down</button><button type="button" onClick={()=>setMain(row)}>Set Main</button><button type="button" onClick={()=>toggle(row)}>{row.enabled?'Turn Off':'Turn On'}</button><button type="button" onClick={()=>edit(row)}>Edit</button><button type="button" className="danger-btn" onClick={()=>del(row.id)}>Delete</button></div></div>)}</div>{!rows.length&&<div className="card"><h3>No hero banners yet</h3><p className="muted">Add one image to keep a static hero. Add more active images to create a carousel.</p></div>}</>
}
function AdminReviews(){const [rows,setRows]=useState([]),[filter,setFilter]=useState('All'); const load=()=>request('/api/admin/reviews').then(setRows); useEffect(load,[]); const upd=async(r,changes)=>{await request(`/api/reviews/${r.id}`,{method:'PUT',body:JSON.stringify({...r,...changes})});load()}; const del=async id=>{if(confirm('Delete this review?')){await request(`/api/reviews/${id}`,{method:'DELETE'});load()}}; const visible=rows.filter(r=>filter==='All'||r.status===filter); return <><div className="admin-page-head"><div><p className="eyebrow">Customer Feedback</p><h1>Reviews & Ratings</h1><p className="muted">Approve customer reviews before they appear on the customer website.</p></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Pending</option><option>Approved</option><option>Hidden</option></select></div><div className="review-admin-summary grid three"><div className="card"><h3>{rows.length}</h3><p>Total reviews</p></div><div className="card"><h3>{rows.filter(r=>r.status==='Pending').length}</h3><p>Waiting approval</p></div><div className="card"><h3>{rows.filter(r=>r.status==='Approved').length}</h3><p>Live reviews</p></div></div><div className="grid two admin-review-list">{visible.map(r=><div className="card admin-review-card" key={r.id}><div className="between"><div><h3>{r.customer_name}</h3><p className="muted">{r.product_name || 'General review'}</p></div><span className={`badge status-${String(r.status).toLowerCase()}`}>{r.status}</span></div><RatingStars value={r.rating||5} readOnly/><p>{r.comment}</p><div className="admin-review-actions"><select value={r.status} onChange={e=>upd(r,{status:e.target.value})}><option>Pending</option><option>Approved</option><option>Hidden</option></select><label className="check-row"><input type="checkbox" checked={!!r.featured} onChange={e=>upd(r,{featured:e.target.checked})}/> Feature</label><button className="danger-btn" onClick={()=>del(r.id)}>Delete</button></div></div>)}</div>{!visible.length&&<p className="muted">No reviews in this filter.</p>}</>}
function AdminMessages(){const [rows,setRows]=useState([]),[loading,setLoading]=useState(false),[err,setErr]=useState(''),[msg,setMsg]=useState(''); const load=async()=>{setLoading(true);setErr('');try{setRows(await request('/api/contact'))}catch(e){setErr(e.message)}finally{setLoading(false)}}; useEffect(()=>{load()},[]); const mark=async(m,status)=>{setErr('');setMsg('');try{await request(`/api/contact/${m.id}`,{method:'PUT',body:JSON.stringify({status})});setMsg('Message updated.');load()}catch(e){setErr(e.message)}}; const del=async id=>{if(confirm('Delete this message?')){setErr('');setMsg('');try{await request(`/api/contact/${id}`,{method:'DELETE'});setMsg('Message deleted.');load()}catch(e){setErr(e.message)}}}; return <><div className="admin-page-head"><div><p className="eyebrow">Inbox</p><h1>Contact Messages</h1><p className="muted">Read, mark, and delete customer messages.</p></div><button className="btn ghost" type="button" onClick={load}>Refresh</button></div>{err&&<AdminHelp title="Messages need attention">{err}</AdminHelp>}{msg&&<p className="form-message">{msg}</p>}{loading&&<p className="muted">Loading messages...</p>}{!loading&&!rows.length&&<div className="card"><h3>No messages yet</h3><p className="muted">Customer contact form messages will appear here.</p></div>}<div className="grid two">{rows.map(m=><div className="card" key={m.id}><div className="between"><h3>{m.name||'No name'}</h3><span className="badge">{m.status||'Unread'}</span></div><p className="muted">{m.email||'No email provided'}</p><p>{m.message}</p><div className="row-actions"><button type="button" onClick={()=>mark(m,(m.status||'Unread')==='Unread'?'Read':'Unread')}>Mark {(m.status||'Unread')==='Unread'?'Read':'Unread'}</button><button type="button" className="danger-btn" onClick={()=>del(m.id)}>Delete</button></div></div>)}</div></>}
function extractYouTubeId(value){
  const text = String(value || '').trim();
  if (!text) return '';
  const patterns = [/youtu\.be\/([^?&]+)/, /v=([^?&]+)/, /embed\/([^?&]+)/];
  for (const pattern of patterns){ const match = text.match(pattern); if (match) return match[1]; }
  return text;
}
function Field({label, children, help}){return <div className="field-block"><label>{label}</label>{children}{help&&<small>{help}</small>}</div>}
function AdminSettings(){
  const defaults=siteDefaults;
  const [f,setF]=useState(defaults),[tab,setTab]=useState('homepage');
  const [err,setErr]=useState(''),[msg,setMsg]=useState('');
  useEffect(()=>{request('/api/site-content').then(x=>setF({...defaults,...x})).catch(e=>setErr(e.message))},[]);
  const save=async e=>{e.preventDefault(); setErr(''); setMsg(''); try{const payload={...f,music_video_id:extractYouTubeId(f.music_video_id)}; await request('/api/site-content',{method:'PUT',body:JSON.stringify(payload)}); setF(payload); setMsg('Website settings saved. Refresh the customer page to see the changes.')}catch(e){setErr(e.message)}};
  const tabs=[['homepage','Home page'],['brand','Words on site'],['design','Colors & background'],['about','About page'],['contact','Contact page'],['pos','Checkout'],['music','Music'],['footer','Footer']];
  return <><div className="admin-page-head"><div><p className="eyebrow">Easy Editor</p><h1>Website Settings</h1><p className="muted">Change the words, colors, background, checkout text, and music without touching code.</p></div><Link className="btn ghost" to="/">Preview Customer Site</Link></div>{err&&<AdminHelp title="Settings need attention">{err}</AdminHelp>}{msg&&<p className="form-message">{msg}</p>}<form className="form card admin-editor settings-editor" onSubmit={save}><div className="settings-tabs">{tabs.map(([id,name])=><button type="button" key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{name}</button>)}</div>{tab==='homepage'&&<div className="settings-panel"><h2>Homepage</h2><Field label="Big main title"><input value={f.hero_title||''} onChange={e=>setF({...f,hero_title:e.target.value})}/></Field><Field label="Text under main title"><input value={f.hero_subtitle||''} onChange={e=>setF({...f,hero_subtitle:e.target.value})}/></Field><Field label="Moving announcement text"><input value={f.announcement_text||''} onChange={e=>setF({...f,announcement_text:e.target.value})}/></Field><Field label="Featured products title"><input value={f.latest_drop_title||''} onChange={e=>setF({...f,latest_drop_title:e.target.value})}/></Field><Field label="Text under featured products"><textarea value={f.latest_drop_description||''} onChange={e=>setF({...f,latest_drop_description:e.target.value})}/></Field></div>}{tab==='brand'&&<div className="settings-panel"><h2>Words on site</h2><div className="form-grid"><Field label="Store name in logo"><input value={f.nav_brand||''} onChange={e=>setF({...f,nav_brand:e.target.value})}/></Field><Field label="Small logo ending"><input value={f.nav_brand_accent||''} onChange={e=>setF({...f,nav_brand_accent:e.target.value})}/></Field></div><Field label="Tiny text under logo"><input value={f.nav_tagline||''} onChange={e=>setF({...f,nav_tagline:e.target.value})}/></Field><div className="form-grid"><Field label="Shop menu text"><input value={f.nav_shop_label||''} onChange={e=>setF({...f,nav_shop_label:e.target.value})}/></Field><Field label="Size guide menu text"><input value={f.nav_size_label||''} onChange={e=>setF({...f,nav_size_label:e.target.value})}/></Field><Field label="Reviews menu text"><input value={f.nav_reviews_label||''} onChange={e=>setF({...f,nav_reviews_label:e.target.value})}/></Field><Field label="Track menu text"><input value={f.nav_track_label||''} onChange={e=>setF({...f,nav_track_label:e.target.value})}/></Field><Field label="Contact menu text"><input value={f.nav_contact_label||''} onChange={e=>setF({...f,nav_contact_label:e.target.value})}/></Field></div><Field label="Small text above title"><input value={f.hero_eyebrow||''} onChange={e=>setF({...f,hero_eyebrow:e.target.value})}/></Field><Field label="Short brand story"><textarea value={f.hero_story||''} onChange={e=>setF({...f,hero_story:e.target.value})}/></Field><div className="form-grid"><Field label="Main button text"><input value={f.hero_primary_button||''} onChange={e=>setF({...f,hero_primary_button:e.target.value})}/></Field><Field label="Second button text"><input value={f.hero_secondary_button||''} onChange={e=>setF({...f,hero_secondary_button:e.target.value})}/></Field><Field label="Small badge 1"><input value={f.hero_note_1||''} onChange={e=>setF({...f,hero_note_1:e.target.value})}/></Field><Field label="Small badge 2"><input value={f.hero_note_2||''} onChange={e=>setF({...f,hero_note_2:e.target.value})}/></Field><Field label="Small badge 3"><input value={f.hero_note_3||''} onChange={e=>setF({...f,hero_note_3:e.target.value})}/></Field><Field label="Small badge 4"><input value={f.hero_note_4||''} onChange={e=>setF({...f,hero_note_4:e.target.value})}/></Field><Field label="Small label on pages"><input value={f.page_eyebrow||''} onChange={e=>setF({...f,page_eyebrow:e.target.value})}/></Field></div><Field label="Small reviews label"><input value={f.reviews_eyebrow||''} onChange={e=>setF({...f,reviews_eyebrow:e.target.value})}/></Field><Field label="Reviews heading"><input value={f.reviews_title||''} onChange={e=>setF({...f,reviews_title:e.target.value})}/></Field><Field label="Text under reviews heading"><textarea value={f.reviews_description||''} onChange={e=>setF({...f,reviews_description:e.target.value})}/></Field><Field label="Text when there are no reviews"><input value={f.reviews_empty_text||''} onChange={e=>setF({...f,reviews_empty_text:e.target.value})}/></Field><Field label="Reviews button text"><input value={f.reviews_view_button||''} onChange={e=>setF({...f,reviews_view_button:e.target.value})}/></Field></div>}{tab==='design'&&<div className="settings-panel"><h2>Colors & background</h2><div className="form-grid color-grid">{[['site_bg','Main background color'],['site_surface','Card color'],['site_surface2','Input and soft box color'],['site_text','Main text color'],['site_muted','Small text color'],['site_accent','Button / brand color'],['site_accent2','Second brand color'],['site_light_bg','Light mode background'],['site_light_surface','Light mode card color'],['site_light_surface2','Light mode input color'],['site_light_text','Light mode text color'],['site_light_muted','Light mode small text'],['site_light_accent','Light mode button color'],['site_light_accent2','Light mode second brand color'],['site_background_overlay','Image dark/light cover color']].map(([key,label])=><Field key={key} label={label}><input type="color" value={f[key]||'#000000'} onChange={e=>setF({...f,[key]:e.target.value})}/></Field>)}</div><Field label="Background type"><select value={f.site_background_style||'motion-grid'} onChange={e=>setF({...f,site_background_style:e.target.value})}><option value="motion-grid">Moving pattern</option><option value="clean">Plain color</option><option value="image">Use image</option></select></Field><Field label="Background image link" help="Paste a picture link, then choose Use image."><input value={f.site_background_image||''} onChange={e=>setF({...f,site_background_image:e.target.value})}/></Field></div>}{tab==='about'&&<div className="settings-panel"><h2>About Page</h2><Field label="Page heading"><input value={f.about_title||''} onChange={e=>setF({...f,about_title:e.target.value})}/></Field><Field label="Text under heading"><input value={f.about_subtitle||''} onChange={e=>setF({...f,about_subtitle:e.target.value})}/></Field><Field label="About brand story"><textarea value={f.about_story||''} onChange={e=>setF({...f,about_story:e.target.value})}/></Field><Field label="Mission"><textarea value={f.mission||''} onChange={e=>setF({...f,mission:e.target.value})}/></Field><Field label="Vision"><textarea value={f.vision||''} onChange={e=>setF({...f,vision:e.target.value})}/></Field></div>}{tab==='contact'&&<div className="settings-panel"><h2>Contact Page</h2><Field label="Contact title"><input value={f.contact_title||''} onChange={e=>setF({...f,contact_title:e.target.value})}/></Field><Field label="Contact subtitle"><input value={f.contact_subtitle||''} onChange={e=>setF({...f,contact_subtitle:e.target.value})}/></Field><Field label="Ordering/contact channels"><input value={f.contact_channels||''} onChange={e=>setF({...f,contact_channels:e.target.value})}/></Field></div>}{tab==='pos'&&<div className="settings-panel"><h2>POS / Checkout Settings</h2><Field label="Payment choices" help="Separate by comma. Example: GCash,Maya,Bank Transfer,COD"><input value={f.payment_methods||''} onChange={e=>setF({...f,payment_methods:e.target.value})}/></Field><Field label="Checkout page text"><input value={f.checkout_title||''} onChange={e=>setF({...f,checkout_title:e.target.value})}/></Field><Field label="Checkout button text"><input value={f.checkout_button||''} onChange={e=>setF({...f,checkout_button:e.target.value})}/></Field><Field label="Note under checkout"><textarea value={f.checkout_note||''} onChange={e=>setF({...f,checkout_note:e.target.value})}/></Field><Field label="Shipping message"><input value={f.shipping_note||''} onChange={e=>setF({...f,shipping_note:e.target.value})}/></Field></div>}{tab==='music'&&<div className="settings-panel"><h2>Background music</h2><label className="check-row"><input type="checkbox" checked={!!f.music_enabled} onChange={e=>setF({...f,music_enabled:e.target.checked})}/> Turn on background music</label><Field label="YouTube music link"><input value={f.music_video_id||''} onChange={e=>setF({...f,music_video_id:e.target.value})}/></Field><Field label="Music name"><input value={f.music_title||''} onChange={e=>setF({...f,music_title:e.target.value})}/></Field><p className="muted">The player is hidden from customers. Browsers may still block autoplay with sound until first click/tap.</p></div>}{tab==='footer'&&<div className="settings-panel"><h2>Footer</h2><Field label="Footer store name"><input value={f.footer_brand||''} onChange={e=>setF({...f,footer_brand:e.target.value})}/></Field><Field label="Footer short message"><input value={f.footer_text||''} onChange={e=>setF({...f,footer_text:e.target.value})}/></Field><Field label="Footer tracking link text"><input value={f.footer_track_label||''} onChange={e=>setF({...f,footer_track_label:e.target.value})}/></Field><Field label="Footer admin link text"><input value={f.footer_admin_label||''} onChange={e=>setF({...f,footer_admin_label:e.target.value})}/></Field></div>}<button className="btn primary">Save Customer Website Settings</button></form></>}

createRoot(document.getElementById('root')).render(<App/>);
