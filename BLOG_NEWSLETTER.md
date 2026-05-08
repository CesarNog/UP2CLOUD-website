# Blog Engagement & Newsletter — UP2CLOUD

Complete guide: comments, likes, newsletter subscriptions, and the automatic blog-to-newsletter workflow.

---

## Architecture overview

| Feature | Where it runs | Storage |
|---|---|---|
| Comments (read/write) | Cloudflare Pages Function `/api/comments` | Cloudflare KV (`UP2CLOUD_COMMENTS`) |
| Likes (read/write) | Cloudflare Pages Function `/api/likes` | Cloudflare KV (`UP2CLOUD_LIKES`) |
| Newsletter subscribe | Cloudflare Pages Function `/api/newsletter` | Brevo contacts list |
| Newsletter send | GitHub Actions (`newsletter-notify.yml`) | Brevo email campaign API |

All backend logic runs server-side. No API keys are exposed to the browser.

---

## 1 — Comments

### How they work

- Each blog post renders `#likes-mount` and `#comments-mount` divs.
- `/assets/js/blog-engagement.js` mounts the UI into those divs at runtime.
- The post slug is derived from `window.location.pathname` (e.g. `/blog/finops-cloud-cost-reduction/` → `finops-cloud-cost-reduction`).
- Comments are fetched from `GET /api/comments?post=<slug>` and submitted via `POST /api/comments`.
- Stored in Cloudflare KV under the key `comments:<slug>` as a JSON array.
- Email addresses are stored server-side for spam prevention but **never returned to the client**.

### Spam protection

- **Honeypot field**: a CSS-hidden `<input name="website">` — bots fill it, humans don't. Server silently discards those submissions.
- **Rate limiting**: 5 comments per IP per 10 minutes (KV TTL-based).
- **URL flood check**: comments with 3+ URLs are rejected.
- **Content validation**: name 2–80 chars, message 5–2000 chars, valid email format required.

### KV key schema

```
comments:<slug>   → JSON array of { id, name, email, message, date }
rl:comment:<ip>   → rate-limit counter (TTL 600s)
```

---

## 2 — Likes

### How they work

- Rendered by the same `blog-engagement.js` script.
- Like count fetched via `GET /api/likes?post=<slug>`.
- Clicking the heart calls `POST /api/likes` with `{ post: slug }`.
- **Client-side dedup**: `localStorage` key `up2cloud-liked:<slug>` prevents the button being clicked twice in the same browser.
- **Server-side dedup**: one like per IP per post per 24 hours (KV TTL 86400s). The IP is stored only as a key marker, never as a value.

### KV key schema

```
likes:<slug>          → integer string (like count)
liked:<ip>:<slug>     → "1" (dedup marker, TTL 86400s)
```

---

## 3 — Newsletter subscriptions

### How they work

- **Popup on `index.html`**: appears after 5 seconds or 40% scroll depth, whichever comes first.
- **Inline form on `blog/index.html`**: always-visible subscribe section above the footer.
- Both forms call `POST /api/newsletter` with `{ email }`.
- The Cloudflare Pages Function proxies to the **Brevo** REST API (`POST /v3/contacts`).
- Once subscribed (or dismissed), `localStorage` key `up2cloud-newsletter` is set — popup never appears again in that browser.

### localStorage keys

| Key | Values | Meaning |
|---|---|---|
| `up2cloud-newsletter` | `subscribed` / `dismissed` | Popup suppression |
| `up2cloud-liked:<slug>` | `1` | Like already sent for this post |

### Brevo setup (one-time)

1. Create a free account at [brevo.com](https://www.brevo.com).
2. Verify your sender email: **My Account → Senders & IP → Senders → Add a sender**.
3. Create a contact list: **Contacts → Lists → Create a list**. Note the numeric ID from the URL.
4. Generate an API key: **My Account → SMTP & API → API Keys → Generate a new API key**.
5. Add to Cloudflare Pages environment variables (see §6).

---

## 4 — Automatic blog-to-newsletter flow

### Trigger

The workflow `.github/workflows/newsletter-notify.yml` runs on every push to `main` that changes `blog/posts.json`.

### How it works

1. Compares `blog/posts.json` at `HEAD` vs `HEAD~1`.
2. Finds any slugs present in the new version but not the previous one — those are new posts.
3. Builds an HTML email with the post title, excerpt, date, category, and a "Read article" CTA button.
4. Creates a **Brevo email campaign** via the API and sends it immediately to all subscribers in the configured list.

### Required GitHub secrets

Go to **Settings → Secrets and variables → Actions → New repository secret**:

| Secret name | Description |
|---|---|
| `BREVO_API_KEY` | Your Brevo API key |
| `BREVO_LIST_ID` | Numeric ID of your Brevo contacts list |
| `BREVO_SENDER_EMAIL` | Verified sender email address |

Optional variable (not secret): `BREVO_SENDER_NAME` defaults to `"Cesar @ UP2CLOUD"`.

---

## 5 — Adding a new blog post

### Quick method (interactive)

```bash
node scripts/add-post.js
```

This will:
- Prompt for slug, title, excerpt, date, category
- Create `blog/<slug>/index.html` from the standard template (with likes/comments already wired)
- Update `blog/posts.json`

### Manual method

1. Create `blog/<slug>/index.html` — copy an existing post as a template.
2. Ensure the file includes the engagement section before `<!-- CTA -->`:

```html
<!-- Blog Engagement: Likes + Comments -->
<section class="max-w-3xl mx-auto px-6 py-2">
  <div id="likes-mount"></div>
  <div id="comments-mount"></div>
</section>
<script src="/assets/js/blog-engagement.js" defer></script>
```

3. Add an entry to `blog/posts.json` (newest first):

```json
{
  "slug": "my-new-post",
  "title": "My Post Title",
  "excerpt": "Short description, 1–2 sentences.",
  "date": "2026-05-08",
  "category": "DevOps",
  "badgeClass": "badge-sky",
  "featured": false
}
```

4. Add a card to `blog/index.html` (copy an existing card and update the href, title, excerpt, date).

5. Commit and push:

```bash
git add blog/<slug>/ blog/posts.json blog/index.html
git commit -m "feat(blog): add '<post title>'"
git push
```

The newsletter workflow fires automatically when `blog/posts.json` changes on `main`.

---

## 6 — Required environment variables

### Cloudflare Pages — Environment Variables

Set at: **Cloudflare → Workers & Pages → up2cloud-tech → Settings → Environment Variables**

| Variable | Required | Description |
|---|---|---|
| `BREVO_API_KEY` | Yes | Brevo API key for newsletter subscriptions |
| `BREVO_LIST_ID` | Yes | Numeric Brevo list ID (integer string, e.g. `"2"`) |
| `GROQ_API_KEY` | Yes (existing) | Groq AI API key for the chatbot |

### Cloudflare Pages — KV namespace bindings

Set at: **Cloudflare → Workers & Pages → up2cloud-tech → Settings → Functions → KV namespace bindings**

Create two KV namespaces first (**Workers & Pages → KV → Create namespace**):

| Binding variable name | KV namespace name |
|---|---|
| `UP2CLOUD_COMMENTS` | `up2cloud-comments` |
| `UP2CLOUD_LIKES` | `up2cloud-likes` |

The binding variable name must match exactly — `env.UP2CLOUD_COMMENTS` in the function code.

### GitHub Actions secrets

Set at: **Repository → Settings → Secrets and variables → Actions**

| Secret | Description |
|---|---|
| `BREVO_API_KEY` | Brevo API key |
| `BREVO_LIST_ID` | Brevo list ID |
| `BREVO_SENDER_EMAIL` | Verified sender email |

---

## 7 — Local development

### Prerequisites

```bash
npm install -g wrangler
```

### Create `.dev.vars` (gitignored)

```
BREVO_API_KEY=your_key_here
BREVO_LIST_ID=2
GROQ_API_KEY=your_groq_key_here
```

### Update `wrangler.toml`

Replace the placeholder `id` values with real KV namespace IDs from your Cloudflare dashboard.

### Run locally

```bash
wrangler pages dev . --kv UP2CLOUD_COMMENTS --kv UP2CLOUD_LIKES
```

Or with the local KV simulator (no real Cloudflare connection needed):

```bash
wrangler pages dev .
```

The site is available at `http://localhost:8788`. Comments and likes will work if KV bindings are configured; newsletter calls will require a real `BREVO_API_KEY`.

### Testing the newsletter workflow locally

```bash
# Simulate a new post detection
NEW_POSTS='[{"slug":"test","title":"Test","excerpt":"Test excerpt","date":"2026-05-08","category":"DevOps"}]' \
BREVO_API_KEY=your_key BREVO_LIST_ID=2 BREVO_SENDER_EMAIL=you@example.com \
python3 .github/workflows/newsletter-notify.yml  # extract and run the inline Python
```

---

## 8 — File map

| File | Purpose |
|---|---|
| `blog/posts.json` | Single source of truth for all post metadata |
| `functions/api/comments.js` | CF Pages Function: read/write comments |
| `functions/api/likes.js` | CF Pages Function: read/write likes |
| `functions/api/newsletter.js` | CF Pages Function: subscribe email via Brevo |
| `assets/js/blog-engagement.js` | Client-side: renders likes + comments UI on all posts |
| `scripts/add-post.js` | CLI helper: scaffold new post + update posts.json |
| `.github/workflows/newsletter-notify.yml` | GitHub Actions: detect new posts → send newsletter |
| `wrangler.toml` | Cloudflare Pages local dev config (KV bindings) |
