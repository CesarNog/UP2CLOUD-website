# SEO & Crawling Configuration

## `robots.txt` — Search Engine Crawler Rules

**Location:** `/robots.txt`  
**Purpose:** Instructs search engines (Google, Bing, DuckDuckGo) which pages to crawl

- ✅ Allows all public pages by default
- ❌ Blocks admin, node_modules, .env files
- ✅ Links to `sitemap.xml` for discovery
- ✅ Crawl-delay: 1 second (respectful crawling)

## `sitemap.xml` — URL Index

**Location:** `/sitemap.xml`  
**Purpose:** Provides search engines a structured list of all pages

**Includes:**
- Homepage (priority 1.0, weekly updates)
- `/about/` (priority 0.8, monthly updates)
- `/privacy/` (priority 0.5, quarterly updates)

**Submit to:**
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters/)
- [Yandex Webmaster](https://webmaster.yandex.com/)

## Meta Tags for SEO

All pages include:
- ✅ `<meta charset="UTF-8">` — Encoding
- ✅ `<meta name="viewport">` — Mobile-responsive
- ✅ `<meta name="description">` — Search snippet (155 chars)
- ✅ `<meta name="robots" content="index, follow">` — Crawl directive
- ✅ `<meta property="og:*">` — Open Graph (social shares)
- ✅ `<meta name="twitter:card">` — Twitter cards
- ⚠️ **TODO:** Add `og:image` (high-res hero image URL)
- ⚠️ **TODO:** Add canonical URLs to about/ and privacy/

## Structured Data (Schema.org)

**Next phase improvements:**
- [ ] Add `Organization` schema (name, logo, contact, social profiles)
- [ ] Add `LocalBusiness` schema (address, phone, hours)
- [ ] Add `Service` schema for each service offering
- [ ] Add `Person` schema for Cesar's profile (about page)

**Example:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "UP2CLOUD",
  "url": "https://up2cloud.github.io",
  "logo": "https://up2cloud.github.io/assets/logo.svg",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "hello@up2cloud.io",
    "contactType": "Sales"
  },
  "sameAs": [
    "https://www.linkedin.com/in/cesarnog/",
    "https://github.com/UP2CLOUD"
  ]
}
```

## Performance & Core Web Vitals

Google prioritizes fast, mobile-friendly sites. Phase 2 includes:
- [ ] Critical CSS extraction (reduce render-blocking)
- [ ] Lazy-load images (Intersection Observer)
- [ ] Defer non-critical JavaScript
- [ ] Image optimization (WebP fallbacks)
- [ ] Minify HTML/CSS/JS

Test with: [PageSpeed Insights](https://pagespeed.web.dev/)

## Monitoring

- **Google Search Console:** Track indexing, clicks, impressions
- **Bing Webmaster:** Track crawl errors, site health
- **Lighthouse CI:** Automated performance/SEO audits on every PR

---

**Last Updated:** May 6, 2026
