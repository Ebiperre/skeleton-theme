# HypeHeat Theme — Feature Overview

A premium neon-noir Shopify theme built for drop-focused luxury streetwear brands.

---

## Storefront Pages

| Page | Status | Highlights |
|------|--------|------------|
| Homepage | ✅ Complete | Hero banner, category grid, marquee scroller, split product features, featured collection grid, community CTA, lookbook image |
| Product Page (PDP) | ✅ Complete | Image gallery with mobile swipe, variant option buttons, quantity stepper, collapsible accordion (description/shipping/returns), trust badges, dynamic checkout |
| Collection Page | ✅ Complete | Product grid with pagination, Quick Add buttons |
| Cart Page | ✅ Complete | Line items with images, quantity controls, shipping progress bar, checkout + continue shopping |
| Cart Drawer | ✅ Complete | Slide-out AJAX cart, quantity +/-, shipping progress bar, reservation countdown timer |
| Search | ✅ Complete | Search form with paginated product results |
| Blog | ✅ Complete | Article listing with metadata and excerpts |
| Article | ✅ Complete | Full post with comments section |
| All Collections | ✅ Complete | Collection grid with featured images |
| Generic Pages | ✅ Complete | Styled content pages (About, Contact, FAQ, etc.) with full rich text support |
| 404 Page | ✅ Complete | Branded error page with accent "404" and CTA |
| Password / Coming Soon | ✅ Complete | Centered fullscreen layout, customizable heading + subtext |
| Gift Card | ✅ Complete | Branded dark card with copy-to-clipboard code, Apple Wallet support |

---

## Customer Account Pages

| Page | Status |
|------|--------|
| Login | ✅ Complete — email/password with inline password recovery |
| Register | ✅ Complete — first name, last name, email, password |
| Account Dashboard | ✅ Complete — order history table, account details, default address |
| Order Detail | ✅ Complete — line items with images, totals breakdown, shipping/billing addresses, tracking links |
| Addresses | ✅ Complete — add/edit/delete, default toggle, country/province selectors |
| Activate Account | ✅ Complete |
| Reset Password | ✅ Complete |

---

## Navigation & Layout

- **Sidebar Navigation** — fixed 280px left panel on desktop, full-screen overlay on mobile
- **Mobile Header** — hamburger menu, search icon, account icon, cart icon with badge
- **Announcement Bar** — configurable text + link with optional drop countdown timer
- **Footer** — brand block, 2 navigation columns, newsletter signup with email input, social icons (Instagram, TikTok, X, Discord), payment icons

---

## FOMO & Conversion Features

| Feature | Description |
|---------|-------------|
| Drop Countdown Timer | Configurable target date in announcement bar — displays days/hours/minutes/seconds, switches to custom "live" text at zero |
| Low Stock Indicator | "Only X left in stock" on PDP when inventory is below a configurable threshold, updates per variant |
| Sticky Add-to-Cart Bar | Slides up on mobile when the main ATC button scrolls out of view, syncs with selected variant and price |
| Cart Reservation Timer | 15-minute countdown in the cart drawer — creates checkout urgency, persists across open/close |
| Exit-Intent Popup | Fires when cursor leaves the viewport (desktop), shows a discount code with click-to-copy — configurable code via theme settings |
| Live Viewer Count | Simulated real-time viewer count displayed in the sidebar |
| Cart Activity Counter | "X people have this in their cart" displayed on the product page |
| Recently Purchased Toast | Popup notification showing real products from the store for social proof |
| Newsletter Popup | Email capture modal with marquee background — 7-day suppression after dismiss |

---

## Design System

- **470+ CSS variables** — comprehensive design token system
- **Dark theme** with neon red accent (#ff3131)
- **Custom font support** via Shopify font picker
- **Configurable settings:**
  - Accent color, background color, text color
  - Max page width (narrow / wide)
  - Page margin
  - Input corner radius
  - Free shipping threshold

---

## Technical

- **Zero dependencies** — vanilla JavaScript with native Fetch API
- **AJAX add-to-cart** with slide-out cart drawer
- **Progressive enhancement** — all links work without JavaScript
- **Responsive / mobile-first** design
- **Preloader** with fade-out animation
- **Font preconnect + preloading** for performance
- **Critical CSS split** for fast first paint
- **Shopify Online Store 2.0** — JSON templates, section-based architecture

---

## Merchant Configuration (Shopify Admin)

These items are configured by the merchant in the Shopify theme editor — no code changes required:

- Upload category images for each collection
- Set category links to actual collections
- Set community CTA link (e.g. Discord invite URL)
- Upload lookbook lifestyle image
- Configure discount code for exit-intent popup
- Set up navigation menus (main menu, footer menus)
- Set countdown timer target date for drops
- Configure social media URLs (Instagram, TikTok, X, Discord)

---

*Built with HypeHeat v1.0.0*
