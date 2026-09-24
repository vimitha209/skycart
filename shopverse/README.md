# ShopVerse

A single-file storefront: `index.html` (Tailwind CDN + Lucide + vanilla JS). Open it in a browser. No build step.

## Images

Put your files in `shopverse/images/` using these names. If a file is missing, a labelled placeholder appears in its place. For categories, a Lucide icon appears instead, and for brands, the brand name as text.

| Area | Paths |
|---|---|
| Hero (≈1600×900, subject on the right) | `hero-model.png`, `hero-electronics.png`, `hero-home.png` |
| Categories (SVG icons, ~48px) | `category-fashion.svg`, `category-electronics.svg`, `category-home-living.svg`, `category-beauty.svg`, `category-sports.svg`, `category-toys.svg`, `category-books.svg`, `category-groceries.svg` |
| Products (square studio shots, product centred; shown edge to edge at 4:3 on cards) | `product-sony-headphones.png`, `product-nike-air-force-1.png`, `product-apple-watch-series-9.png`, `product-dior-sauvage.png`, `product-tactical-backpack.png`, `product-philips-air-fryer.png`, `product-smart-watch.png`, `product-running-shoes.png`, `product-noise-cancelling-headphones.png`, `product-skincare-set.png`, `product-linen-blazer.png`, `product-table-lamp.png`, `product-building-blocks.png`, `product-teddy-bear.png`, `product-atomic-habits.png`, `product-midnight-library.png`, `product-coffee-beans.png`, `product-olive-oil.png` |
| Promo banners | `banner-headphones-green.png`, `banner-home-living.png` |
| Reviewer avatars (square) | `avatar-sarah.jpg`, `avatar-james.jpg`, `avatar-emily.jpg`, `avatar-daniel.jpg`, `avatar-priya.jpg`, `avatar-marco.jpg` |
| Brand logos | `brand-nike.svg`, `brand-adidas.svg`, `brand-samsung.svg`, `brand-apple.svg`, `brand-puma.svg`, `brand-levis.svg` |
| Favicon | `favicon.svg` |

To add or rename products, edit the `PRODUCTS`, `CATEGORIES`, `HERO_SLIDES`, `REVIEWS` and `BRANDS` arrays at the top of the `<script>`.

## Features

- Hero carousel: autoplay, dots, arrows and swipe. Floating product cards open quick view.
- Live search: the product grid filters as you type, with a suggestion dropdown. Press `/` to focus search.
- Category, tag and search filtering, with sorting and "Load more".
- Quick-view modal (click a product image or title): description, size and colour selectors, quantity, related items.
- Cart drawer, opened by the cart icon or any Add to Cart button: quantity controls, remove, free-shipping progress bar, coupons (`SAVE10`, `WELCOME5`, `FREESHIP`) and tax.
- Wishlist drawer with "Move to cart".
- Demo checkout with form validation. It creates an order number you can use in **Track Order**.
- Account modal with Sign In / Register tabs, plus a profile panel with order history.
- Newsletter forms with email validation, a daily deal countdown and toasts.
- Cart, wishlist, user and orders are saved in `localStorage`.

The checkout and sign-in are front-end demos only. Connect them to a real backend and payment provider before going live.
