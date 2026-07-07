# DEADKIDS Full-Stack E-Commerce Website

A modern full-stack streetwear/merch e-commerce starter for **DEADKIDS** with a customer website, admin dashboard, backend API, and a local JSON file database.

This version is fixed to run on **Node.js 22 and Node.js 24**. It no longer uses `better-sqlite3`, so you do not need Python, node-gyp, or Visual Studio Build Tools.

## Tech stack used

- **Frontend:** React.js + Vite
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **Backend:** Node.js + Express.js
- **Database:** Local JSON file database stored in `server/data/deadkids-db.json`
- **Authentication:** JWT for protected admin routes
- **Password Security:** bcryptjs
- **File Uploads:** Multer local uploads
- **Styling:** Custom CSS with black/red/white theme, glassmorphism, neumorphism, hover effects, responsive layout

## Features included

### Customer side
- Home page
- Shop page with search, category, price, size, color, availability filters
- Product details page
- Upcoming products page with countdown and Notify Me form
- Cart drawer/page logic using React context
- Checkout page with GCash, Maya, bank transfer, and COD options
- Order tracking page
- Reviews section
- About page
- Contact page
- Dark/light mode toggle
- Smooth animations and responsive design

### Admin side
- Admin login
- Dashboard overview with stats
- Product management CRUD
- Upcoming product management CRUD
- Order management and status updates
- Promo code management
- Review management
- Contact message management
- Notify Me request list

## Default admin account

```txt
Email: admin@deadkids.com
Password: admin123
```

Change this immediately before real deployment.

## How to run locally on Windows CMD

From the root folder:

```cmd
npm install
npm run install:all
copy server\.env.example server\.env
npm run dev
```

If CMD asks to overwrite `.env`, type `Y` and press Enter.

## How to run locally on PowerShell / Mac / Linux

```bash
npm install
npm run install:all
cp server/.env.example server/.env
npm run dev
```

This starts:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Important folders

```txt
client/       React frontend
server/       Express backend
server/data/  Local JSON database
server/uploads/ Uploaded product images
```

## Notes

This is a complete starter project. For production, connect a real payment gateway, use cloud image storage like Cloudinary, set secure environment variables, and deploy backend/frontend separately.

## Premium streetwear upgrade included

This build has been upgraded into a luxury streetwear drop-site style for **DEADKIDS**. It includes:

- Full-screen premium hero section
- Red neon glow effects
- Glitch headline animation
- Marquee drop text
- Mouse-follow red glow
- Loading screen with DEADKIDS branding
- Glassmorphism product cards
- 3D product card hover tilt
- Wishlist heart button styling
- Product badges like NEW DROP, LIMITED, BEST SELLER, SOLD OUT
- Sticky category tabs for shop page
- Upcoming drop cards with locked/unlocking-soon styling
- Neon countdown card styling
- Dark admin dashboard styling with red highlights

Color palette:

```txt
Primary Black: #050505
Soft Black: #111111
Dark Gray: #1A1A1A
Streetwear Red: #D90429
Neon Red: #FF003C
White: #FFFFFF
Muted White: #EDEDED
Gray Text: #A3A3A3
```


## Admin image upload

This version includes image upload directly inside the admin website.

1. Run the project.
2. Open `http://localhost:5173/admin/login`.
3. Login using `admin@deadkids.com` / `admin123`.
4. Go to **Products** to upload product pictures.
5. Go to **Upcoming** to upload teaser pictures for upcoming drops.

Uploaded pictures are saved in `server/uploads/`, and the image URL is saved in the local JSON database at `server/data/deadkids-db.json`.

Supported image types: JPG, PNG, WEBP, GIF, and SVG. Max upload size is 5MB per image.

## Admin/customer navigation separation update

The customer shop and admin portal are now separated:

- Customer pages no longer show an Admin tab/link in the main navbar.
- Admin pages no longer show the customer navbar, cart, shop tabs, or footer.
- Admin portal URL: `http://localhost:5173/admin/login`
- Customer website URL: `http://localhost:5173/`

Default admin login:

- Email: `admin@deadkids.com`
- Password: `admin123`

## Admin UX update
This version includes a friendlier admin side:
- Product add/edit with picture upload, stock, sizes, colors, badges, and status.
- Upcoming drop add/edit with teaser image and release date.
- POS/order management for status and tracking number.
- Website Content Settings so the admin can edit homepage text, About page, Contact page, footer, checkout/POS payment methods, checkout notes, and hidden music settings without coding.
