# Átria Veículos - Deployment Guide

## Deployment Configuration

### Current Setup
- **Build Command**: `npm run build`
- **Preview Command**: `npm run preview`
- **Serve Command**: `npx serve -s dist -l 4173`

### Package.json Scripts
The following scripts are configured:
- `dev`: `vite` (development server)
- `build`: `vite build` (production build)
- `preview`: `vite preview` (preview build)

### Deployment Process

#### Option 1: Using Replit Deploy Button
1. Click the "Deploy" button in Replit interface
2. Replit will automatically:
   - Run `npm run build`
   - Serve the `dist/` folder
   - Deploy to `.replit.app` domain

#### Option 2: Manual Preview
```bash
npm run build
npm run preview -- --port 4173 --host 0.0.0.0
```

#### Option 3: Using Serve
```bash
npm run build
npx serve -s dist -l 4173 --host 0.0.0.0
```

### Build Output
- **Location**: `dist/` folder
- **Size**: ~24MB total
- **Main chunk**: 787KB (optimized)
- **Chunks**: 10 separate files for optimal loading

### Dependencies
- All packaging issues resolved
- jQuery added for slick-carousel compatibility
- Yarn configured to ignore engines
- Cache cleaning implemented

### Status
✅ Build working perfectly
✅ All dependencies installed
✅ Optimization complete
✅ Ready for deployment