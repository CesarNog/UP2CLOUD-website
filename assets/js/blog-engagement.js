/**
 * Blog engagement: likes + comments
 * Mounts into #likes-mount and #comments-mount elements.
 * Post slug is derived from window.location.pathname.
 *
 * Skips silently on non-up2cloud.tech domains (e.g. up2cloud.github.io)
 * so GitHub Pages mirror is unaffected.
 */
(function () {
  'use strict';

  // Only run on the primary domain — CF Pages Functions don't exist on github.io
  const IS_PRIMARY = location.hostname === 'up2cloud.tech' ||
    location.hostname === 'up2cloud-tech.pages.dev' ||
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1';

  if (!IS_PRIMARY) return;

  // Derive post slug from URL: /blog/my-post-slug/ → my-post-slug
  const pathParts = location.pathname.replace(/\/+$/, '').split('/');
  const POST_SLUG = pathParts[pathParts.length - 1] || 'unknown';

  const API = '/api';

  // ── Shared helpers ──────────────────────────────────────────────────────

  function el(tag, props, ...children) {
    const node = document.createElement(tag);
    Object.entries(props || {}).forEach(([k, v]) => {
      if (k === 'cls') { node.className = v; }
      else if (k === 'style') { node.style.cssText = v; }
      else if (k.startsWith('on')) { node.addEventListener(k.slice(2), v); }
      else { node.setAttribute(k, v); }
    });
    children.flat().forEach(c => {
      if (c == null) return;
      node.append(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function safe(str) {
    const d = document.createElement('span');
    d.textContent = str;
    return d.innerHTML;
  }

  // ── Likes ───────────────────────────────────────────────────────────────

  async function initLikes(mount) {
    const LS_KEY = `up2cloud-liked:${POST_SLUG}`;
    let liked = localStorage.getItem(LS_KEY) === '1';

    const countEl = el('span', { cls: 'likes-count' }, '…');
    const heartSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const btn = el('button', {
      cls: `likes-btn${liked ? ' liked' : ''}`,
      'aria-label': 'Like this post',
      'aria-pressed': liked ? 'true' : 'false',
      type: 'button',
    });
    btn.innerHTML = heartSVG;
    btn.append(countEl);

    mount.append(
      el('div', { cls: 'likes-wrap' },
        el('span', { cls: 'likes-label' }, 'Found this useful?'),
        btn
      )
    );

    // Load count
    try {
      const r = await fetch(`${API}/likes?post=${encodeURIComponent(POST_SLUG)}`);
      const d = await r.json();
      countEl.textContent = d.count ?? 0;
    } catch {
      countEl.textContent = '—';
    }

    btn.addEventListener('click', async () => {
      if (liked) return;
      liked = true;
      btn.classList.add('liked');
      btn.setAttribute('aria-pressed', 'true');
      btn.disabled = true;
      localStorage.setItem(LS_KEY, '1');

      // Optimistic increment
      const current = parseInt(countEl.textContent, 10) || 0;
      countEl.textContent = current + 1;

      try {
        const r = await fetch(`${API}/likes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post: POST_SLUG }),
        });
        const d = await r.json();
        if (typeof d.count === 'number') countEl.textContent = d.count;
      } catch {
        // optimistic value stays
      }
    });
  }

  // ── Comments ────────────────────────────────────────────────────────────

  function timeAgo(iso) {
    const ms = Date.now() - new Date(iso).getTime();
    const min = Math.floor(ms / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function initials(name) {
    return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');
  }

  function renderComment({ name, message, date }) {
    const avatar = el('div', { cls: 'comment-avatar', 'aria-hidden': 'true' }, initials(name));
    const header = el('div', { cls: 'comment-header' },
      el('strong', { cls: 'comment-name' }, name),
      el('time', { cls: 'comment-time', datetime: date }, timeAgo(date))
    );
    // Use textContent assignment inside a div to safely render message
    const body = el('div', { cls: 'comment-body' });
    body.textContent = message;
    return el('article', { cls: 'comment-item', role: 'article' }, avatar, el('div', { cls: 'comment-content' }, header, body));
  }

  async function loadComments(listEl, countEl) {
    try {
      const r = await fetch(`${API}/comments?post=${encodeURIComponent(POST_SLUG)}`);
      const d = await r.json();
      const comments = d.comments || [];

      const plural = comments.length === 1 ? '1 comment' : `${comments.length} comments`;
      countEl.textContent = plural;
      listEl.innerHTML = '';

      if (comments.length === 0) {
        listEl.append(el('p', { cls: 'comments-empty' }, 'Be the first to leave a comment below.'));
      } else {
        comments.forEach(c => listEl.append(renderComment(c)));
      }
    } catch {
      listEl.append(el('p', { cls: 'comments-empty' }, 'Could not load comments.'));
    }
  }

  async function initComments(mount) {
    const countEl = el('span', { cls: 'comments-count' }, '');
    const heading = el('h3', { cls: 'comments-heading' },
      el('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', 'stroke-width': '2', 'aria-hidden': 'true',
      }),
      ' ',
      countEl,
    );
    // Set SVG path imperatively (avoids innerHTML)
    const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svgPath.setAttribute('d', 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z');
    svgPath.setAttribute('stroke-linecap', 'round');
    svgPath.setAttribute('stroke-linejoin', 'round');
    heading.querySelector('svg').appendChild(svgPath);

    const listEl = el('div', { cls: 'comments-list', role: 'list', 'aria-live': 'polite' });

    // ── Form ──
    const nameInput = el('input', {
      type: 'text', name: 'name', id: 'comment-name',
      placeholder: 'Your name *', required: 'true',
      maxlength: '80', autocomplete: 'name',
      cls: 'comment-input',
      'aria-label': 'Your name',
    });
    const emailInput = el('input', {
      type: 'email', name: 'email', id: 'comment-email',
      placeholder: 'Email (private, not shown) *', required: 'true',
      maxlength: '200', autocomplete: 'email',
      cls: 'comment-input',
      'aria-label': 'Email address (not shown publicly)',
    });
    const msgInput = el('textarea', {
      name: 'message', id: 'comment-message',
      placeholder: 'Share your thoughts… *', required: 'true',
      rows: '4', maxlength: '2000',
      cls: 'comment-input comment-textarea',
      'aria-label': 'Your comment',
    });
    // Honeypot — CSS-hidden, bots fill it
    const honeypot = el('input', {
      type: 'text', name: 'website', tabindex: '-1',
      autocomplete: 'off', 'aria-hidden': 'true',
      style: 'position:absolute;left:-9999px;opacity:0;height:0;width:0',
    });
    const submitBtn = el('button', {
      type: 'submit', cls: 'comment-submit',
      'aria-label': 'Post comment',
    }, 'Post Comment');
    const statusEl = el('p', { cls: 'comment-status', role: 'status', 'aria-live': 'assertive' });

    const form = el('form', {
      cls: 'comment-form', novalidate: 'true',
      'aria-label': 'Leave a comment',
    },
      el('h4', { cls: 'comment-form-title' }, 'Leave a comment'),
      el('div', { cls: 'comment-form-row' }, nameInput, emailInput),
      msgInput,
      honeypot,
      el('p', { cls: 'comment-privacy' },
        'Your email is used for spam prevention only and is never displayed publicly.'
      ),
      el('div', { cls: 'comment-form-footer' }, submitBtn, statusEl),
    );

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const message = msgInput.value.trim();

      if (!name || !email || !message) {
        statusEl.textContent = 'Please fill in all required fields.';
        statusEl.className = 'comment-status error';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Posting…';
      statusEl.textContent = '';
      statusEl.className = 'comment-status';

      try {
        const r = await fetch(`${API}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            post: POST_SLUG, name, email, message,
            website: honeypot.value, // will be '' for humans
          }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Unknown error');

        form.reset();
        statusEl.textContent = '✓ Comment submitted! It will appear shortly.';
        statusEl.className = 'comment-status success';
        await loadComments(listEl, countEl);
      } catch (err) {
        statusEl.textContent = err.message || 'Failed to post comment. Please try again.';
        statusEl.className = 'comment-status error';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post Comment';
      }
    });

    mount.append(
      el('section', {
        cls: 'comments-section',
        'aria-label': 'Comments',
      },
        heading,
        listEl,
        form,
      )
    );

    await loadComments(listEl, countEl);
  }

  // ── Newsletter inline subscribe (shared function) ──────────────────────
  // Exported to window for reuse by popup and inline forms
  window.UP2CLOUD_subscribeNewsletter = async function (email, statusEl, btn) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      statusEl.textContent = 'Please enter a valid email address.';
      statusEl.className = 'nl-status error';
      return false;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Subscribing…'; }
    statusEl.textContent = '';

    try {
      const r = await fetch(`${API}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Subscription failed');

      localStorage.setItem('up2cloud-newsletter', 'subscribed');
      statusEl.textContent = d.alreadySubscribed
        ? '✓ You\'re already subscribed!'
        : '✓ You\'re in! Check your inbox for a confirmation.';
      statusEl.className = 'nl-status success';
      return true;
    } catch (err) {
      statusEl.textContent = err.message || 'Something went wrong. Please try again.';
      statusEl.className = 'nl-status error';
      if (btn) { btn.disabled = false; btn.textContent = 'Subscribe'; }
      return false;
    }
  };

  // ── Mount ──────────────────────────────────────────────────────────────

  function injectStyles() {
    const css = `
/* ─── Likes ─────────────────────────────────────────────────────── */
.likes-wrap{display:flex;align-items:center;gap:.875rem;padding:1.25rem 0;margin:2rem 0;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08)}
.likes-label{color:rgba(255,255,255,.5);font-size:.875rem;font-family:'DM Sans',sans-serif}
.likes-btn{display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.65);padding:.55rem 1.1rem;border-radius:999px;cursor:pointer;font-size:.875rem;font-family:'Space Grotesk',sans-serif;font-weight:600;transition:background .2s,color .2s,border-color .2s,transform .15s;line-height:1}
.likes-btn:hover:not(:disabled){background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.3);color:#FCA5A5;transform:scale(1.04)}
.likes-btn.liked{background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.4);color:#F87171;cursor:default}
.likes-btn:disabled{cursor:default}
.likes-btn svg{transition:fill .2s}
.likes-btn.liked svg{fill:#F87171;stroke:#F87171}
.likes-count{font-variant-numeric:tabular-nums;min-width:1.5ch;text-align:center}
@keyframes likesPop{0%{transform:scale(1)}50%{transform:scale(1.35)}100%{transform:scale(1)}}
.likes-btn.liked{animation:likesPop .3s ease}

/* ─── Comments section ──────────────────────────────────────────── */
.comments-section{margin:3rem 0;padding:2rem 0;border-top:1px solid rgba(255,255,255,.08)}
.comments-heading{display:flex;align-items:center;gap:.6rem;font-family:'Space Grotesk',sans-serif;font-size:1.25rem;font-weight:700;color:#fff;margin-bottom:1.75rem}
.comments-count{color:rgba(255,255,255,.55);font-size:.875rem;font-weight:500;margin-left:.25rem}
.comments-list{display:flex;flex-direction:column;gap:1.25rem;margin-bottom:2.5rem}
.comments-empty{color:rgba(255,255,255,.4);font-size:.9rem;font-style:italic;margin:0}

/* comment item */
.comment-item{display:flex;gap:1rem;padding:1.25rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px}
.comment-avatar{flex-shrink:0;width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#0369A1,#7C3AED);display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:.8rem;color:#fff}
.comment-content{flex:1;min-width:0}
.comment-header{display:flex;align-items:baseline;gap:.75rem;flex-wrap:wrap;margin-bottom:.5rem}
.comment-name{font-family:'Space Grotesk',sans-serif;font-weight:600;color:#fff;font-size:.9rem}
.comment-time{color:rgba(255,255,255,.35);font-size:.75rem}
.comment-body{color:rgba(255,255,255,.72);font-size:.9rem;line-height:1.7;white-space:pre-wrap;word-break:break-word}

/* form */
.comment-form{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:1.75rem}
.comment-form-title{font-family:'Space Grotesk',sans-serif;font-size:1rem;font-weight:700;color:#fff;margin:0 0 1.25rem}
.comment-form-row{display:grid;grid-template-columns:1fr 1fr;gap:.875rem;margin-bottom:.875rem}
@media(max-width:540px){.comment-form-row{grid-template-columns:1fr}}
.comment-input{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:.7rem 1rem;color:#fff;font-family:'DM Sans',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s,box-shadow .2s;display:block}
.comment-input::placeholder{color:rgba(255,255,255,.35)}
.comment-input:focus{border-color:rgba(14,165,233,.5);box-shadow:0 0 0 3px rgba(14,165,233,.1)}
.comment-textarea{resize:vertical;min-height:110px;margin-bottom:.875rem;font-family:'DM Sans',sans-serif}
.comment-privacy{color:rgba(255,255,255,.35);font-size:.75rem;margin:0 0 1.25rem;line-height:1.5}
.comment-form-footer{display:flex;align-items:center;gap:1rem;flex-wrap:wrap}
.comment-submit{background:linear-gradient(135deg,#0369A1,#0EA5E9);color:#fff;border:none;border-radius:10px;padding:.75rem 1.75rem;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:.9rem;cursor:pointer;transition:opacity .2s,transform .15s}
.comment-submit:hover:not(:disabled){opacity:.9;transform:translateY(-1px)}
.comment-submit:disabled{opacity:.6;cursor:not-allowed}
.comment-status{font-size:.82rem;margin:0;flex:1}
.comment-status.success{color:#4ADE80}
.comment-status.error{color:#F87171}

/* ─── Newsletter status (shared) ────────────────────────────────── */
.nl-status{font-size:.82rem;margin-top:.5rem;min-height:1.2em}
.nl-status.success{color:#4ADE80}
.nl-status.error{color:#F87171}
`;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function mount() {
    injectStyles();
    const likesMnt = document.getElementById('likes-mount');
    const commentsMnt = document.getElementById('comments-mount');
    if (likesMnt) initLikes(likesMnt);
    if (commentsMnt) initComments(commentsMnt);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
