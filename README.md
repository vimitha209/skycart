# Skycart storefront

A static, responsive storefront (desktop, tablet and mobile). No build step and no server code are needed:
upload this folder as-is to any static host.

## What's inside

```
index.html              the page shell and all page templates
assets/css/styles.css   layout, responsive breakpoints (640px, 900px, 1200px)
assets/js/app.js        catalog, cart, checkout, search and page navigation
assets/images/          product photos, category illustrations, banner, favicon
```

## Pages (hash URLs, so they work on any host without redirect rules)

| URL | Page |
|---|---|
| `#/` | Home |
| `#/categories` | All categories |
| `#/category/<id>` e.g. `#/category/electricals` | Category listing with filters and sort |
| `#/product/<id>` e.g. `#/product/electricals-wires-cables-1` | Product details |
| `#/search` | Search |
| `#/cart`, `#/checkout` | Cart and checkout |
| `#/orders`, `#/notifications`, `#/account` | Account area |

## Deploy

- **Netlify:** drag this folder onto app.netlify.com/drop.
- **Vercel:** `npx vercel` inside this folder (framework preset: Other).
- **GitHub Pages:** push the folder contents to a repo and enable Pages on the main branch.
- **Any web server / cPanel:** upload the contents into `public_html` (or your web root).

To preview locally: `python3 -m http.server` in this folder, then open http://localhost:8000.
(Opening index.html directly by double-click also works.)

## Editing

- Products, categories, prices and images: the `buildCatalog()` section near the top of `assets/js/app.js`.
- Text and layout: `index.html` (inside `<template id="app-template">`).
- Colours and breakpoints: `assets/css/styles.css`.

## Notes

- Cart, orders and checkout are front-end only. They reset on page reload and no payment is taken;
  connect a backend or payment gateway before going live.
- Product names and prices are sample data.
- Sign in and Help show a "coming soon" message.
