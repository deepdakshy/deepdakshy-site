# deepdakshy.com

Static site on GitHub Pages. Content for Commercials, Art & Films and the showreels comes from Sanity (project `h42w314b`, dataset `production`).

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Gateway: eye-loop video, name, two doors, short about, footer |
| `commercial.html` | Showreel, Selected work (16:9), Social & vertical (9:16). Each grid shows 4 and has *Show more* |
| `art.html` | Showreel and film grid. Clicking a film opens a player with details and stills |
| `about.html` | Portrait, numbers, experience, education, tools, languages, CV download |
| `cv.html` | Redirects to `about.html` so old links keep working |

Shared styles live in `css/site.css` (mobile first, desktop from 900px). All Sanity loading, cards, *Show more* and the video player are in `js/site.js`.

## Editing content in Sanity

**Commercial** documents
- `title`, `client`, `type`, `year`, `role`: shown on the card and in the player.
- `format`: set to `vertical` to put a piece in *Social & vertical*. Anything else goes to *Selected work*.
- `thumbnail`: the card image. Use a clean frame with no text on it. Without one, the YouTube thumbnail is used.
- `youtubeId` or `vimeoId`: what plays when the card is clicked.
- `stats` (list of short strings) appear as small tags in the player; `writeup` or `description` appear as text.
- `order`: lower numbers come first. The first 4 of each section are what visitors see before *Show more*, so put the best work at the top.

**Film** documents
- `title`, `type`, `role`, `year`, `runtime`, `director`, `dp`, `camera`: shown in the player.
- `festival`: short text such as `34 Festivals`, shown as a red tag on the card.
- `cover`: card image. `stills`: extra images shown under the player.
- `writeup`: list of paragraphs.
- `order`: lower numbers first.

**Settings** document
- `commercialShowreelYoutube` / `commercialShowreelVimeo`: Commercials showreel. If empty, the showreel block is hidden.
- `artShowreelYoutube` / `artShowreelVimeo`: Art & Films showreel. If empty, the showreel block is hidden.
- `heroVideoUrl`: optional `https://` link to an .mp4 that replaces `images/loop.mp4` on the homepage.
- `email`: replaces the email address on every page.

## Static assets

- `images/loop.mp4`: homepage video. `images/hero-poster.jpg` shows while it loads.
- `images/candid.webp`: portrait used on Home and About.
- `images/og-image.jpg`: link-preview image when the site is shared.
- `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-512.png`: the DD mark.
- `DeepDakshy_CV.pdf`: the CV download on the About page.
