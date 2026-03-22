# deepdakshy.com — Final Site

## Pages
- `index.html`      → Landing: full-screen video + COMMERCIAL | ART split
- `commercial.html` → Showreel + video gallery with write-ups
- `art.html`        → Showreel + 2-column film grid + overlay system
- `admin/`          → Netlify CMS login (deepdakshy.com/admin)

---

## Step 1 — Deploy to Netlify

1. Go to **netlify.com** → sign up (free)
2. New site → "Import from Git" → connect GitHub → push this folder as a repo
   OR: "Deploy manually" → drag the `site/` folder
3. Your site is live at `something.netlify.app`
4. Site Settings → Domain → Add custom domain → `deepdakshy.com`
5. Update DNS at your Wix registrar (or wherever your domain lives)

---

## Step 2 — Enable Netlify CMS

1. In Netlify dashboard → **Identity** tab → Enable Identity
2. Identity → **Registration** → Set to "Invite only"
3. Identity → **Services** → Enable **Git Gateway**
4. Identity → **Invite users** → invite your own email
5. Go to `deepdakshy.com/admin` → accept invite → set password
6. You now have a CMS login

From that point, adding a film or commercial project is just filling in a form.

---

## Step 3 — Add Your Content

### Landing video loop
Replace the `landing-video-bg` div in `index.html` with:
```html
<video class="landing-video" autoplay muted loop playsinline>
  <source src="images/loop.mp4" type="video/mp4">
</video>
```
Put `loop.mp4` in the `images/` folder. Aim for under 15MB, 1920×1080, H.264.

### Showreels
In `commercial.html` and `art.html`, find the `reel-ph` div and replace with:
```html
<iframe src="https://player.vimeo.com/video/YOUR_ID?title=0&byline=0&portrait=0&color=c8b89a"
  allow="autoplay; fullscreen" allowfullscreen></iframe>
```

### Landing split backgrounds (optional)
In `index.html`, inside each `.landing-half`, add after `landing-video-bg`:
```html
<div style="position:absolute;inset:0;background-image:url('images/commercial-bg.jpg');
  background-size:cover;background-position:center;filter:brightness(.25);z-index:1;
  transition:filter .7s;"></div>
```

### Film cards
In `art.html`, each `.film-card` has data attributes that drive the overlay.
Fill these in for your real films:

```html
data-title="Your Film Title"
data-type="Short Film · 14 min"
data-year="2022"
data-role="Director · Cinematographer"
data-festival="Festival Name, City"
data-director="Deep Dakshy"
data-dp="Deep Dakshy"
data-runtime="14 min"
data-camera="Sony FX3"
data-vimeo="123456789"          ← just the Vimeo video ID number
data-cover="images/film-hero.jpg"
data-images="images/film-1.jpg,images/film-2.jpg,images/film-3.jpg"
data-writeup="First paragraph. || Second paragraph. || Third paragraph."
```

To **add a new film**: copy any `.film-card` div and paste it in the grid.

### Commercial cards
In `commercial.html`, update each card's `onclick` to use your real Vimeo ID:
```html
onclick="openCommercialVideo('123456789'); return false;"
```
And replace the thumbnail placeholder with:
```html
<img src="images/project-thumb.jpg" alt="Project name">
```

---

## de3p.art

Buy it at **namecheap.com** (≈€2/yr).

Then in Namecheap DNS, add a URL redirect:
`de3p.art` → `https://www.deepdakshy.com/art.html`

That's it. Anyone going to de3p.art lands on your art page.

---

## Adding Content via CMS (after setup)

Go to `deepdakshy.com/admin` → log in.

**Adding a film:**
- Films & Art → New Film
- Fill in the form: title, year, role, write-up paragraphs, upload images
- Hit Publish → site updates in ~60 seconds

**Adding a commercial project:**
- Commercial Work → New Project
- Fill in client, title, description, upload thumbnail
- Hit Publish

Note: The CMS stores content as data files. For the CMS content to appear on the live pages automatically, you'll need to either:
A) Use a static site generator like **Eleventy** or **Hugo** (I can set this up for you — it's one extra step)
B) Or simply edit the HTML directly for now — the CMS is still useful for managing your images

The simplest path right now: **edit the HTML cards directly**, use the CMS just for image uploads and as a content reference. When you want full auto-publishing, let me know and I'll wire up Eleventy in an hour.
