# Premium Sports Commerce UI System

## 1. Full Design System Specification
- Design language: Apple Card restraint, modern sports lifestyle imagery, editorial whitespace, premium dashboard clarity.
- Core feel: soft elevated cards, calm neutral canvas, controlled accent usage, backend-driven flexibility.
- System principle: every major block is a reusable card primitive with consistent padding, radius, shadow, and metadata hierarchy.

## 2. Color Token System
- `bg.base`: `#F7F7F6`
- `bg.soft`: `#F5F5F3`
- `bg.warm`: `#EFEFEA`
- `surface.default`: `rgba(255,255,255,0.82)`
- `surface.strong`: `rgba(255,255,255,0.96)`
- `text.primary`: `#131416`
- `text.secondary`: `#6E747B`
- `text.tertiary`: `#43484E`
- `accent.lime`: `#A9DC63`
- `accent.forest`: `#234D3B`
- `accent.orange`: `#FF8D49`
- `accent.blue`: `#4B7CFF`
- `accent.black`: `#1D1F21`

## 3. Typography Scale
- Hero display: `clamp(2.8rem, 4vw + 1rem, 5.7rem)`, weight `700`, tracking `-0.05em`
- Section title: `clamp(2rem, 2vw + 1.2rem, 3.35rem)`, weight `700`
- Body copy: `1.02rem`, line-height `1.8`
- Metadata: `0.74rem`, uppercase, tracking `0.16em`, weight `700`
- Preferred stack: `Inter`, `SF Pro Display`, system sans

## 4. Spacing Scale
- Base unit: `4px`
- Small spacing: `8, 12, 16`
- Mid spacing: `20, 24, 28, 32`
- Large spacing: `40, 48, 56, 64`
- Section gutters: `24px mobile`, `32px tablet`, `40px desktop`
- Hero section vertical rhythm: `20-32px` between headline, copy, CTA, support cards

## 5. Grid Architecture
- Desktop: `12 columns`
- Tablet: `8 columns`
- Mobile: `4 columns`
- Page shell width: `1280px max`
- Composition rule: alternate dense card sections with open breathing bands
- Primary homepage pattern: hero split, asymmetrical category grid, mixed product grid, recommendation blocks, membership section, social proof, premium footer

## 6. Card Component System
- Hero card: `34px` outer radius, `28px` inner media radius, floating chips, split content layout
- Product card: `30-34px` radius, image bleed, metadata top, price + action row bottom
- Category card: wide split card with icon/image preview, longer descriptive copy
- Recommendation card: soft compact product storytelling
- Membership card: accent-tinted surface with controlled gradient
- Review / social proof card: quote-first layout with minimal chrome

## 7. Homepage Layout Blueprint
- Immersive hero using dynamic featured product/category image
- Editorial category browser with preview rail
- Trending dynamic product showcase
- Recommendation block
- Membership / offer section
- Social proof and footer transition section

## 8. Product Listing Page Layout
- Filters inside a single elevated search card
- Product grid uses medium-density premium cards
- Metadata hierarchy: category/brand, title, short supporting line, price, actions
- All product cards adapt to dynamic content lengths through flexible vertical stack

## 9. Product Detail Page Aesthetic
- Large image panel with rounded media container
- Right-side product story block
- Clear pricing hierarchy and discount treatment
- Secondary detail cards for rating, stock, brand
- Long description and specs inside supporting soft containers

## 10. Animation System
- Hover lift: `translateY(-2px to -5px)`
- Shadow escalation on hover
- Image zoom: `scale(1.03)`
- Timing: `150ms to 220ms`
- Easing: soft standard ease
- Motion principle: subtle, premium, non-gaming

## 11. Responsive Rules
- Desktop: asymmetrical editorial layouts
- Tablet: controlled two-column collapse
- Mobile: stacked single-column card flow
- Maintain hierarchy by preserving image prominence and CTA priority

## 12. Tailwind Design Tokens
- Utility classes abstracted in `src/index.css`
- Core custom classes:
  - `.premium-card`
  - `.premium-panel`
  - `.primary-cta`
  - `.accent-cta`
  - `.ghost-cta`
  - `.soft-pill`
  - `.section-kicker`
  - `.display-title`
  - `.section-title`
  - `.body-copy`
  - `.card-metadata`

## 13. Component Hierarchy Map
- `App`
- `Navbar`
- `Home`
- `HeroBanner`
- `Categories`
- `FeaturedProducts`
- `Recommendations`
- `MembershipSection`
- `StoriesSection`
- `Products`
- `Search`
- `ProductCard`
- `ProductDetails`
- `CartItem`
- `Wishlist`
- `PaymentForm`
- `About`
- `Contact`
- `Footer`

## 14. Modern Sports Premium UI Implementation Plan
- Phase 1: design tokens, shell, navigation, footer, core card primitives
- Phase 2: homepage editorial layout using backend-fed products and categories
- Phase 3: product listing and detail standardization
- Phase 4: cart, wishlist, checkout consistency
- Phase 5: auth/profile/admin harmonization
- Phase 6: optional motion refinement with Framer Motion and further API-driven modules like trainers, campaigns, brands, and reviews
