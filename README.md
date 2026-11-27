# Union Fire Store

A premium dark streetwear storefront and admin dashboard, built around the supplied Union Fire product images.

## Start locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin` for the admin dashboard.

## Included

- Responsive storefront for acid wash, hoodies, sweatshirts and bottoms
- Product catalogue with source images organised under `public/images/products`
- Product details, size selection, cart and checkout-ready flow
- Full admin dashboard UI for product edits, inventory adjustment, orders, customer summary, discounts and settings
- Cash-on-delivery messaging and India delivery experience
- `supabase/schema.sql` for the live product, customer and order database
- `.env.example` listing the Supabase, Razorpay and Shiprocket settings needed for live commerce

## Before taking live orders

1. Create a Supabase project, run `supabase/schema.sql`, and copy its keys to `.env.local`.
2. Add Razorpay production keys and webhook secret. The checkout button then needs a server route that creates and verifies Razorpay orders.
3. Add Shiprocket credentials and create shipments after payment/COD confirmation.
4. Add admin authentication and restrict the admin routes and database policies to your admin account.

The initial frontend catalogue is in `src/lib/catalog.ts`; this is the single source of sample product data until the Supabase connection is enabled.
