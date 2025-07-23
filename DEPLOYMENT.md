# CSV Convertor - Deployment Guide

This guide covers deploying the CSV Convertor application to GitHub Pages with the custom domain csvconvertor.com.

## 🚀 Quick Deployment

### Prerequisites

- GitHub repository set up
- Domain `csvconvertor.com` purchased and ready to configure
- Node.js 18+ installed locally

### Automated Deployment (Recommended)

The project is configured with GitHub Actions for automatic deployment:

1. **Push to main branch** - The deployment will trigger automatically
2. **GitHub Actions will:**
   - Install dependencies
   - Build the React application
   - Deploy to GitHub Pages
   - Set up the custom domain

### Manual Deployment

If you prefer to deploy manually:

```bash
cd site
npm install
npm run deploy
```

## 🌐 Domain Configuration

### GitHub Pages Setup

1. Go to your GitHub repository settings
2. Navigate to "Pages" section
3. Set source to "Deploy from a branch"
4. Select "gh-pages" branch
5. Custom domain should automatically be set to `csvconvertor.com`

### DNS Configuration

Configure your domain registrar with these DNS records:

**For Apex Domain (csvconvertor.com):**

```
Type: A
Name: @
Value: 185.199.108.153
```

```
Type: A
Name: @
Value: 185.199.109.153
```

```
Type: A
Name: @
Value: 185.199.110.153
```

```
Type: A
Name: @
Value: 185.199.111.153
```

**For WWW Subdomain (optional):**

```
Type: CNAME
Name: www
Value: csvconvertor.com
```

## 📁 Project Structure

```
site/
├── public/
│   ├── CNAME                 # Custom domain configuration
│   ├── index.html           # Updated with SEO meta tags
│   └── manifest.json        # PWA configuration
├── src/
│   ├── components/          # React components
│   ├── context/            # State management
│   ├── services/           # CSV processing logic
│   └── utils/              # Utility functions
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions deployment
└── package.json            # Updated with deployment scripts
```

## 🔧 Configuration Files

### package.json

- `homepage`: Set to `https://csvconvertor.com`
- `deploy` script: Uses gh-pages for deployment
- `predeploy` script: Builds the project before deployment

### CNAME

- Contains `csvconvertor.com` for custom domain

### GitHub Actions Workflow

- Triggers on push to main branch
- Builds and deploys automatically
- Sets custom domain

## 🚦 Deployment Status

After deployment, verify:

1. **GitHub Pages**: Check repository settings → Pages
2. **Domain**: Visit https://csvconvertor.com
3. **SSL**: Ensure HTTPS is working
4. **Functionality**: Test CSV upload and processing

## 🛠 Troubleshooting

### Common Issues

**Domain not working:**

- Check DNS propagation (can take up to 48 hours)
- Verify CNAME file exists in repository
- Ensure GitHub Pages is enabled

**Build failures:**

- Check GitHub Actions logs
- Verify all dependencies are installed
- Ensure no TypeScript errors

**404 Errors:**

- Check that homepage in package.json matches domain
- Verify build folder contains index.html

### Manual Verification

Test the build locally:

```bash
cd site
npm run build
npx serve -s build
```

## 📊 Performance

The deployed application includes:

- ✅ Optimized React build
- ✅ Code splitting
- ✅ Compressed assets
- ✅ PWA capabilities
- ✅ SEO optimization

## 🔄 Updates

To update the deployed application:

1. Make changes to the code
2. Commit and push to main branch
3. GitHub Actions will automatically redeploy

For manual updates:

```bash
npm run deploy
```

## 📞 Support

If you encounter issues:

1. Check GitHub Actions logs
2. Verify DNS settings
3. Test build locally
4. Check GitHub Pages status

## 🎨 Favicon Generation

The project includes automated favicon generation from the SVG source.

### Generated Files

The favicon system includes:

- **favicon.svg** - Scalable vector version (primary)
- **favicon.ico** - Multi-size ICO file (16, 24, 32, 64px)
- **favicon-16x16.png** - Browser tab favicon
- **favicon-24x24.png** - Browser favicon
- **favicon-32x32.png** - Standard browser favicon
- **favicon-64x64.png** - High-res browser favicon
- **apple-touch-icon.png** - iOS home screen (180x180)
- **logo192.png** - PWA icon
- **logo512.png** - PWA high-res icon

### Regenerating Favicons

To update favicons after modifying the SVG:

```bash
# Generate all PNG sizes from SVG
npm run generate-favicons

# Generate favicon.ico from PNG files
npm run generate-ico

# Generate everything at once
npm run generate-all-icons
```

### Manual Generation

If you prefer manual generation, open `public/favicon-generator.html` in your browser to download individual sizes.

### Browser Support

- **Modern browsers**: Use SVG favicon for crisp display
- **Older browsers**: Fall back to ICO format
- **iOS devices**: Use apple-touch-icon.png
- **PWA installations**: Use logo192.png and logo512.png
- **High-DPI displays**: Automatically select appropriate resolution
