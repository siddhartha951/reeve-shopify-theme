# Reevë Electrolytes — Shopify Theme

Custom Shopify Online Store 2.0 theme for **Reevë**, the Aniwell electrolyte drink-mix brand. Built on Shopify's **Horizon 4.1.4** theme, with custom Reeve and Blint section sets for landing pages, product pages, bundles, and social proof.

## Structure

| Folder | Contents |
|---|---|
| `layout/` | `theme.liquid` (main shell) and `password.liquid` |
| `templates/` | JSON templates, including flavor-specific product templates (`product.reeve-electrolyte`, `product.flavor-reeve-electrolyte`, `product.citrus-lemonade`, `product.cotton-candy`) and FAQ/contact pages |
| `sections/` | Horizon core sections plus custom `reeve-*` and `blint-*` sections |
| `blocks/` | Theme blocks used inside sections |
| `snippets/` | Reusable Liquid partials (incl. `blint-*` and `reeve-*` helpers) |
| `assets/` | CSS, JavaScript (Horizon web components, GSAP + ScrollTrigger), and SVG icons |
| `config/` | `settings_schema.json` and `settings_data.json` (theme settings) |
| `locales/` | Translation files |

## Custom sections

**Reeve:** Hero, Hydration Hero, Hydrate Hero, Marquee, Features Grid, Media Feature (bubbles), Ingredients, Science, Compare, Trust Markers, Why We Exist, When to Reach, Reviews Carousel, FAQ, FAQ Pills, Custom Product.

**Blint:** Product, Product Custom, Product AB, Product Showcase, Bundle Builder, Compare, Cost Compare, Ingredients, Timeline, Showcase, FAQ, Reviews, Video Reviews, Judge.me Reviews.

## Development

Requires the [Shopify CLI](https://shopify.dev/docs/api/shopify-cli).

```bash
# Preview locally against your store
shopify theme dev --store <your-store>.myshopify.com

# Pull the latest theme settings/customizer changes from the store
shopify theme pull --store <your-store>.myshopify.com

# Push to an unpublished theme for review
shopify theme push --unpublished --store <your-store>.myshopify.com

# Lint Liquid
shopify theme check
```

## Credits

Based on [Horizon](https://themes.shopify.com/) by Shopify. Custom sections by Aniwell.
