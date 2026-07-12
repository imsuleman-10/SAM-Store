# Baroque.pk — Next.js + Supabase Store (COD Only)

Ye ek full working e-commerce store hai:
- Public storefront (home, product page, cart, checkout)
- **Cash on Delivery (COD) only** checkout — koi online payment gateway nahi
- Admin dashboard (`/admin`) — password-protected, products aur orders manage karne ke liye

## 1. Supabase Setup (5 minutes)

1. [supabase.com](https://supabase.com) pe free account banayein, naya project create karein
2. Project ke andar **SQL Editor** kholein, `supabase-schema.sql` file ka pura content paste karke **Run** karein — isse `products` aur `orders` tables ban jayenge, aur 3 sample products bhi add ho jayenge
3. **Project Settings → API** mein jayein, ye 3 cheezein copy karein:
   - `Project URL`
   - `anon public` key
   - `service_role` key (⚠️ ye secret hai, kabhi client-side code ya GitHub mein commit na karein)

## 2. Local Setup

```bash
npm install
cp .env.local.example .env.local
```

`.env.local` file kholein aur apni Supabase details aur admin password fill karein:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx
ADMIN_PASSWORD=apna-password-yahan
```

Agar aap video upload karna chahte hain, to Supabase Storage mein public `videos` bucket banayein. Admin panel ka new product form selected video ko Supabase par upload karega, aur product media URL save karega.

Phir run karein:

```bash
npm run dev
```

Store `http://localhost:3000` par khul jayega, aur admin dashboard `http://localhost:3000/admin/login` par.

## 3. Deploy (Vercel — Free)

1. Is code ko GitHub repo mein push karein
2. [vercel.com](https://vercel.com) pe jayein → "Add New Project" → apna repo select karein
3. Environment Variables section mein wahi 4 values dalein jo `.env.local` mein thi
4. Deploy karein — 2 minute mein live ho jayega

## 4. Apni Domain Connect Karna

Vercel project ke **Settings → Domains** mein jayein, apni domain (jo aapne Namecheap se khareedi hai) add karein, phir Namecheap ke DNS settings mein Vercel ke diye gaye records daal dein. 10-15 minute mein propagate ho jata hai.

## Kaise Kaam Karta Hai

- **Products**: Supabase `products` table se aate hain. Admin dashboard se add/edit/delete karein — turant store pe reflect ho jayega.
- **Orders**: Jab customer checkout karta hai (COD), order Supabase `orders` table mein save hota hai. Admin dashboard ke "Orders" tab mein sab orders dikhte hain, status update kar sakte hain (Pending → Confirmed → Shipped → Delivered).
- **Cart**: Browser ke localStorage mein save hota hai, isliye page refresh karne par bhi cart khali nahi hota.
- **Security**: Admin routes ek password-protected cookie se protect hain (`middleware.js`). Product/order editing sirf server-side `service_role` key se hoti hai, jo kabhi browser mein expose nahi hoti.

## Next Steps (Optional Improvements)

- Product images ke liye Supabase Storage ya Cloudinary use karein (abhi sirf image URL field hai)
- WhatsApp order-confirmation notification add karein (jab naya order aaye)
- Real admin login ko Supabase Auth mein upgrade karein (abhi simple single-password hai)
