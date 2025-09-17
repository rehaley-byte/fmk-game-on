# FMK — Netlify quick deploy

Two ways:

## 1) Netlify Drop (no functions, fastest)
- Drag the **public/** folder to https://app.netlify.com/drop
- ⚠️ This will **not** fetch live headlines because it needs the function.
- (You can hardcode a NewsAPI key in `public/app.js`, but that exposes the key — not recommended.)

## 2) Netlify Site with Function (recommended)
1. Create a new site from this folder (connect Git or drag-and-drop the **entire** folder).
2. In **Site settings → Environment variables**, add:
   - `NEWS_API_KEY` = your NewsAPI key
3. Deploy. Visit your site and click **New headline**.

### File map
- `public/index.html`, `public/styles.css`, `public/app.js` — frontend
- `netlify/functions/headlines.js` — serverless function calling NewsAPI
- `netlify.toml` — config telling Netlify where to serve and the function path
- The function is available at both `/netlify/functions/headlines` and (via redirect) `/api/headlines`.

Enjoy!
