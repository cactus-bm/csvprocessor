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
