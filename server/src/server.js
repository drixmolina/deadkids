import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { data, initDb, insert, update, remove, makeOrderNumber, timestamp, saveDb } from './db.js';
import { requireAdmin } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;
const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

initDb();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/placeholder', express.static(path.join(__dirname, '..', 'placeholder')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image uploads are allowed'));
    cb(null, true);
  }
});

function bool(value) {
  return value ? 1 : 0;
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function safeString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function safeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map(item => safeString(item)).filter(Boolean);
}

function safeSizeChart(value) {
  if (!Array.isArray(value)) return [];
  return value.map(item => ({
    size: safeString(item?.size),
    chest: safeString(item?.chest),
    length: safeString(item?.length),
    fit: safeString(item?.fit)
  })).filter(item => item.size || item.chest || item.length || item.fit);
}

function safeOrderItems(value) {
  if (!Array.isArray(value)) return [];
  return value.map(item => ({
    key: safeString(item?.key),
    product_id: item?.product_id ?? '',
    name: safeString(item?.name, 'Product'),
    price: Math.max(0, safeNumber(item?.price)),
    image: safeString(item?.image),
    size: safeString(item?.size, 'One Size'),
    color: safeString(item?.color, 'Black'),
    qty: Math.max(1, safeNumber(item?.qty, 1))
  }));
}

function dropDateTime(row) {
  if (!row?.release_date) return null;
  return new Date(`${row.release_date}T${row.release_time || '00:00'}`);
}

function applyAutoRelease(row) {
  if (!row) return row;
  const releaseAt = dropDateTime(row);
  if (row.auto_release && releaseAt && releaseAt <= new Date() && row.status !== 'Released') {
    row.status = 'Released';
    row.updated_at = timestamp();
    import('./db.js').then(mod => mod.saveDb());
  }
  return row;
}

function productFromBody(body) {
  return {
    name: safeString(body.name),
    category: safeString(body.category),
    description: safeString(body.description),
    price: Math.max(0, safeNumber(body.price)),
    sizes: safeStringArray(body.sizes),
    size_chart: safeSizeChart(body.size_chart),
    colors: safeStringArray(body.colors),
    stock: Math.max(0, safeNumber(body.stock)),
    images: safeStringArray(body.images),
    status: safeString(body.status, 'Active'),
    sort_order: safeNumber(body.sort_order ?? body.sortOrder, 9999),
    featured: bool(body.featured),
    best_seller: bool(body.best_seller),
    limited_drop: bool(body.limited_drop),
    new_arrival: bool(body.new_arrival)
  };
}

function sortNewest(rows) {
  return [...rows].sort((a, b) => {
    const ao = Number(a.sort_order ?? 9999);
    const bo = Number(b.sort_order ?? 9999);
    if (ao !== bo) return ao - bo;
    return String(b.created_at || '').localeCompare(String(a.created_at || ''));
  });
}

app.get('/api/health', (req, res) => res.json({ ok: true, app: 'DDKDS CLO API', database: 'JSON file database' }));

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const admin = data.admins.find(item => item.email === email);
  if (!admin || !bcrypt.compareSync(password, admin.password)) return res.status(401).json({ message: 'Invalid email or password' });
  const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
  res.json({ token, admin: { id: admin.id, email: admin.email } });
});

app.post('/api/upload', requireAdmin, (req, res) => {
  upload.single('image')(req, res, err => {
    if (err) return res.status(400).json({ message: err.message || 'Upload failed' });
    if (!req.file) return res.status(400).json({ message: 'Please choose an image to upload' });
    res.json({ url: `/uploads/${req.file.filename}` });
  });
});

app.get('/api/products', (req, res) => {
  const { search = '', category = '', featured, bestSeller, limitedDrop, status = 'Active' } = req.query;
  const term = String(search).toLowerCase();
  let rows = data.products.filter(product => {
    if (status !== 'all' && product.status !== status) return false;
    if (term && !String(product.name).toLowerCase().includes(term)) return false;
    if (category && product.category !== category) return false;
    if (featured && !product.featured) return false;
    if (bestSeller && !product.best_seller) return false;
    if (limitedDrop && !product.limited_drop) return false;
    return true;
  });
  res.json(sortNewest(rows));
});

app.put('/api/products/reorder/list', requireAdmin, (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ message: 'ids must be an array' });
  ids.forEach((id, index) => {
    const product = data.products.find(item => Number(item.id) === Number(id));
    if (product) {
      product.sort_order = index + 1;
      product.updated_at = timestamp();
    }
  });
  saveDb();
  res.json({ message: 'Product order saved', products: sortNewest(data.products) });
});

app.get('/api/products/:id', (req, res) => {
  const row = data.products.find(product => Number(product.id) === Number(req.params.id));
  if (!row) return res.status(404).json({ message: 'Product not found' });
  res.json(row);
});

app.post('/api/products', requireAdmin, (req, res) => {
  const maxOrder = Math.max(0, ...data.products.map(p => Number(p.sort_order || 0)));
  const product = productFromBody(req.body);
  if (!product.name || !product.category) return res.status(400).json({ message: 'Product name and category are required' });
  const row = insert('products', { ...product, sort_order: safeNumber(req.body.sort_order, maxOrder + 1), created_at: timestamp(), updated_at: timestamp() });
  res.status(201).json(row);
});

app.put('/api/products/:id', requireAdmin, (req, res) => {
  const product = productFromBody(req.body);
  if (!product.name || !product.category) return res.status(400).json({ message: 'Product name and category are required' });
  const row = update('products', req.params.id, product);
  if (!row) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product updated', product: row });
});

app.delete('/api/products/:id', requireAdmin, (req, res) => {
  remove('products', req.params.id);
  res.json({ message: 'Product deleted' });
});

app.get('/api/upcoming', (req, res) => {
  const rows = data.upcoming_products.map(applyAutoRelease);
  res.json([...rows].sort((a, b) => String(a.release_date || '').localeCompare(String(b.release_date || ''))));
});

app.post('/api/upcoming', requireAdmin, (req, res) => {
  const { name, category, description, teaser_image, release_date, release_time, status, countdown_enabled, notify_enabled, auto_release } = req.body;
  const row = insert('upcoming_products', {
    name,
    category,
    description: description || '',
    teaser_image: teaser_image || '',
    release_date: release_date || '',
    release_time: release_time || '20:00',
    countdown_enabled: bool(countdown_enabled),
    notify_enabled: bool(notify_enabled),
    auto_release: bool(auto_release),
    status: status || 'Coming Soon',
    created_at: timestamp(),
    updated_at: timestamp()
  });
  res.status(201).json(row);
});

app.put('/api/upcoming/:id', requireAdmin, (req, res) => {
  const { name, category, description, teaser_image, release_date, release_time, status, countdown_enabled, notify_enabled, auto_release } = req.body;
  const row = update('upcoming_products', req.params.id, { name, category, description, teaser_image, release_date, release_time: release_time || '20:00', status, countdown_enabled: bool(countdown_enabled), notify_enabled: bool(notify_enabled), auto_release: bool(auto_release) });
  if (!row) return res.status(404).json({ message: 'Upcoming product not found' });
  res.json({ message: 'Upcoming product updated', upcoming: row });
});

app.delete('/api/upcoming/:id', requireAdmin, (req, res) => {
  remove('upcoming_products', req.params.id);
  res.json({ message: 'Upcoming product deleted' });
});

app.post('/api/notify', (req, res) => {
  const { upcoming_product_id, customer_name, contact } = req.body;
  insert('notify_requests', { upcoming_product_id, customer_name: customer_name || '', contact, created_at: timestamp() });
  res.status(201).json({ message: 'Notification request saved' });
});

app.get('/api/notify', requireAdmin, (req, res) => {
  const rows = sortNewest(data.notify_requests).map(item => ({
    ...item,
    product_name: data.upcoming_products.find(product => Number(product.id) === Number(item.upcoming_product_id))?.name || ''
  }));
  res.json(rows);
});

app.post('/api/orders', (req, res) => {
  const { customer_name, email, phone, address, items, total, payment_method } = req.body;
  const safeItems = safeOrderItems(items);
  if (!safeString(customer_name)) return res.status(400).json({ message: 'Customer name is required' });
  if (!safeItems.length) return res.status(400).json({ message: 'Cart is empty' });
  const order_number = makeOrderNumber();
  insert('orders', {
    order_number,
    customer_name: safeString(customer_name),
    email: safeString(email),
    phone: safeString(phone),
    address: safeString(address),
    items: safeItems,
    total: Math.max(0, safeNumber(total, safeItems.reduce((sum, item) => sum + item.price * item.qty, 0))),
    payment_method: safeString(payment_method, 'GCash'),
    status: 'Pending',
    tracking_number: '',
    created_at: timestamp()
  });
  res.status(201).json({ message: 'Order placed', order_number });
});

app.get('/api/orders/track/:orderNumber', (req, res) => {
  const row = data.orders.find(order => order.order_number === req.params.orderNumber);
  if (!row) return res.status(404).json({ message: 'Order not found' });
  res.json(row);
});

app.get('/api/orders', requireAdmin, (req, res) => {
  res.json(sortNewest(data.orders));
});

app.put('/api/orders/:id', requireAdmin, (req, res) => {
  const row = update('orders', req.params.id, { status: req.body.status, tracking_number: req.body.tracking_number || '' });
  if (!row) return res.status(404).json({ message: 'Order not found' });
  res.json({ message: 'Order updated', order: row });
});

app.get('/api/reviews', (req, res) => {
  res.json(sortNewest(data.reviews.filter(review => review.status === 'Approved')));
});

app.post('/api/reviews', (req, res) => {
  const { product_id, customer_name, rating, comment } = req.body;
  if (!safeString(customer_name) || !safeString(comment)) return res.status(400).json({ message: 'Name and review are required' });
  const product = product_id ? data.products.find(item => Number(item.id) === Number(product_id)) : null;
  const safeRating = Math.max(1, Math.min(5, safeNumber(rating, 5)));
  insert('reviews', {
    product_id: product_id || '',
    product_name: product ? product.name : '',
    customer_name: safeString(customer_name),
    rating: safeRating,
    comment: safeString(comment).slice(0, 240),
    status: 'Pending',
    featured: 0,
    created_at: timestamp()
  });
  res.status(201).json({ message: 'Review submitted for approval' });
});

app.get('/api/admin/reviews', requireAdmin, (req, res) => res.json(sortNewest(data.reviews)));

app.put('/api/reviews/:id', requireAdmin, (req, res) => {
  const row = update('reviews', req.params.id, { status: req.body.status, featured: bool(req.body.featured) });
  if (!row) return res.status(404).json({ message: 'Review not found' });
  res.json({ message: 'Review updated', review: row });
});

app.delete('/api/reviews/:id', requireAdmin, (req, res) => {
  remove('reviews', req.params.id);
  res.json({ message: 'Review deleted' });
});

app.get('/api/promos/validate/:code', (req, res) => {
  const row = data.promo_codes.find(promo => promo.code === req.params.code.toUpperCase() && promo.active);
  if (!row) return res.status(404).json({ message: 'Promo code not valid' });
  res.json(row);
});

app.get('/api/promos', requireAdmin, (req, res) => res.json(sortNewest(data.promo_codes)));

app.post('/api/promos', requireAdmin, (req, res) => {
  const { code, discount_type, discount_value, minimum_order, expires_at, active } = req.body;
  insert('promo_codes', {
    code: String(code).toUpperCase(),
    discount_type: discount_type || 'percentage',
    discount_value: Number(discount_value || 0),
    minimum_order: Number(minimum_order || 0),
    expires_at: expires_at || '',
    active: bool(active),
    usage_count: 0,
    created_at: timestamp()
  });
  res.status(201).json({ message: 'Promo created' });
});

app.delete('/api/promos/:id', requireAdmin, (req, res) => {
  remove('promo_codes', req.params.id);
  res.json({ message: 'Promo deleted' });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!safeString(name) || !safeString(message)) return res.status(400).json({ message: 'Name and message are required' });
  insert('contact_messages', { name: safeString(name), email: safeString(email), message: safeString(message), status: 'Unread', created_at: timestamp() });
  res.status(201).json({ message: 'Message sent' });
});

app.get('/api/contact', requireAdmin, (req, res) => res.json(sortNewest(data.contact_messages)));

app.put('/api/contact/:id', requireAdmin, (req, res) => {
  update('contact_messages', req.params.id, { status: req.body.status });
  res.json({ message: 'Message updated' });
});

app.delete('/api/contact/:id', requireAdmin, (req, res) => {
  remove('contact_messages', req.params.id);
  res.json({ message: 'Message deleted' });
});


app.get('/api/site-content', (req, res) => {
  res.json(data.site_content || {});
});

app.put('/api/site-content', requireAdmin, (req, res) => {
  data.site_content = { ...(data.site_content || {}), ...req.body, updated_at: timestamp() };
  import('./db.js').then(mod => mod.saveDb());
  res.json({ message: 'Website content updated', site_content: data.site_content });
});

app.get('/api/background-settings', (req, res) => {
  res.json(data.background_settings || {});
});

app.put('/api/background-settings', requireAdmin, (req, res) => {
  data.background_settings = { ...(data.background_settings || {}), ...req.body, updated_at: timestamp() };
  import('./db.js').then(mod => mod.saveDb());
  res.json({ message: 'Background settings saved', background_settings: data.background_settings });
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  res.json({
    products: data.products.length,
    orders: data.orders.length,
    pending: data.orders.filter(order => order.status === 'Pending').length,
    completed: data.orders.filter(order => order.status === 'Completed').length,
    upcoming: data.upcoming_products.length,
    reviews: data.reviews.length,
    sales: data.orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  });
});

app.listen(PORT, () => console.log(`DDKDS CLO API running on http://localhost:${PORT}`));
