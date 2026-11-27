# FXX Store

A premium dark streetwear storefront and secure admin dashboard, built around the supplied product images.

## Start locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the storefront, `http://localhost:3000/account` for customer signup/login and `http://localhost:3000/admin` for the protected admin dashboard.

## Included

- Responsive storefront for acid wash, hoodies, sweatshirts and bottoms
- Product catalogue with source images organised under `public/images/products`
- Product details, size selection, cart and checkout-ready flow
- Full admin dashboard UI for product edits, inventory adjustment, orders, customer summary, discounts and settings
- Customer signup/login; checkout is unavailable until the customer is signed in
- Supabase Auth profiles with an explicit `admin` role; database Row Level Security blocks non-admin catalogue and order administration
- Cash-on-delivery messaging and India delivery experience
- `supabase/schema.sql` for the live product, customer and order database
- `.env.example` listing the Supabase, Razorpay and Shiprocket settings needed for live commerce

## One-time live setup

1. Create a Supabase project. In its SQL Editor run [schema.sql](supabase/schema.sql), then [seed.sql](supabase/seed.sql). If you already ran those earlier, run [20261127_customer_profiles_and_storage.sql](supabase/migrations/20261127_customer_profiles_and_storage.sql) instead to add saved customer profiles and the secure photo bucket.
2. Copy the project URL and anon key into `.env.local` locally and into Vercel environment variables for production. Never commit `.env.local` or share the service-role key.
3. In Supabase Authentication → URL Configuration, add your Vercel production URL as the Site URL and Redirect URL.
4. Create your own customer account through `/account`, then run this in Supabase SQL Editor, replacing the email with your own:

   ```sql
   update public.profiles set role = 'admin' where email = 'YOUR_ADMIN_EMAIL@example.com';
   ```

5. Add Razorpay production keys and webhook secret. The checkout flow will need the payment route enabled before accepting card/UPI payments; COD orders already record in Supabase.
6. Add Shiprocket credentials when you want automatic shipment creation after orders are paid/confirmed.

The initial frontend catalogue is in `src/lib/catalog.ts`; the database seed publishes those products into Supabase. Admin uploads go to the public-read, admin-write-only `product-images` bucket; deleting a product removes its database row and uploaded bucket image while preserving completed order line items.
