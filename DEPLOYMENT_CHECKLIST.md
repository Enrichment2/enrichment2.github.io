# Deployment Checklist

## ✅ Completed Steps
- [x] Convert site to Eleventy
- [x] Set up Decap CMS
- [x] Add RSS feed generation
- [x] Commit and push to GitHub

## 🚀 Cloudflare Pages Setup

### 1. Configure Build Settings
Go to Cloudflare Dashboard → Workers & Pages → Your Project

**Required Settings:**
```
Build command: npm run build
Build output directory: _site
Root directory: / (leave as root)
```

**Optional but recommended:**
- Add environment variable: `NODE_VERSION` = `18`

### 2. Verify Deployment
After Cloudflare builds, check:
- [ ] Homepage loads at enrichmetwo.win
- [ ] Posts display correctly
- [ ] Terminal design looks good
- [ ] RSS feed available at /feed.xml
- [ ] /admin page loads (authentication won't work yet)

## 🔐 Set Up Decap CMS Authentication

Follow these steps to enable posting from your phone:

### Step 1: Create GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name**: The Enrichment Hub CMS
   - **Homepage URL**: https://enrichmetwo.win
   - **Authorization callback URL**: https://api.netlify.com/auth/done
4. Register and save your **Client ID** and **Client Secret**

### Step 2: Set Up Netlify Auth (Free)
Even though you're on Cloudflare, you need Netlify just for authentication:

1. Create account at https://app.netlify.com/signup
2. **Import your GitHub repo**:
   - New site from Git
   - Select: Enrichment2/theenrichmenthub
   - Build command: (leave empty or use `npm run build`)
   - Publish directory: `_site`
3. After deploy, go to **Site settings** → **Access control** → **OAuth**
4. Click **Install provider** → Select **GitHub**
5. Enter your Client ID and Client Secret from Step 1
6. Save

### Step 3: Update CMS Configuration
1. Copy your Netlify site URL (e.g., `https://enrichmenthub.netlify.app`)
2. Edit `admin/config.yml` and uncomment/update the base_url line:
   ```yaml
   backend:
     name: github
     repo: Enrichment2/theenrichmenthub
     branch: main
     base_url: https://YOUR-NETLIFY-SITE.netlify.app
   ```
3. Commit and push:
   ```bash
   git add admin/config.yml
   git commit -m "Configure OAuth for Decap CMS"
   git push
   ```

### Step 4: Test Mobile Posting
1. On your phone, visit https://enrichmetwo.win/admin
2. Click "Login with GitHub"
3. Authorize the app
4. You should now see the CMS dashboard!
5. Try creating a test post

## 📱 Using Decap CMS

### From Your Phone:
1. Visit enrichmetwo.win/admin
2. Log in with GitHub
3. Tap "Posts" → "New Post"
4. Write your post
5. Tap "Publish"
6. Changes are committed to GitHub and auto-deploy!

### From Your Computer:
Same process at enrichmetwo.win/admin

## 🐛 Troubleshooting

### Build fails on Cloudflare
- Check build logs in Cloudflare Pages dashboard
- Ensure build command is exactly: `npm run build`
- Ensure output directory is: `_site`

### CMS won't authenticate
- Verify GitHub OAuth app callback URL is: https://api.netlify.com/auth/done
- Check that OAuth app is configured in Netlify
- Ensure base_url in config.yml points to your Netlify site (not Cloudflare)

### Posts don't show after publishing via CMS
- Check GitHub repo for new commit
- Wait 1-2 minutes for Cloudflare to rebuild
- Check Cloudflare Pages deployment logs

## 📞 Need Help?
If you get stuck on any step, let me know which step number and I'll help you through it!
