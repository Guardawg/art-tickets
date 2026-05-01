# Art Dept Tickets — PWA

Tech support ticket triage app for TxState Art Department IT.  
Installable on iPhone via Safari → Add to Home Screen.

---

## Deploy to GitHub Pages (free hosting, ~5 minutes)

### Step 1 — Create a GitHub account
Go to https://github.com and sign up if you don't have one.

### Step 2 — Create a new repository
1. Click the **+** icon (top right) → **New repository**
2. Name it: `art-tickets`
3. Set to **Public**
4. Click **Create repository**

### Step 3 — Upload the files
1. On your new repo page, click **uploading an existing file**
2. Drag and drop ALL 5 files at once:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `icon-192.png`
   - `icon-512.png`
3. Click **Commit changes**

### Step 4 — Enable GitHub Pages
1. Go to **Settings** tab in your repo
2. Scroll to **Pages** in the left sidebar
3. Under **Source**, select **Deploy from a branch**
4. Select branch: **main**, folder: **/ (root)**
5. Click **Save**

After ~1 minute your app will be live at:
**https://YOUR-USERNAME.github.io/art-tickets/**

---

## Install on iPhone

1. Open Safari on your iPhone
2. Go to your GitHub Pages URL above
3. Tap the **Share** button (box with arrow pointing up)
4. Scroll down and tap **Add to Home Screen**
5. Tap **Add**

The app icon will appear on your home screen and launch full-screen like a native app.

---

## Features
- ✦ AI triage — paste an email, auto-extracts priority, category, requester
- Filters: Open / Resolved / High priority / Hardware / Software / Network / Account / Printer
- Sort by newest, priority, or open-first
- Tap checkbox to resolve tickets
- Works offline after first load
- Data saved locally on your device
