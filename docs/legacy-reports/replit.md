# Átria Veículos - Car Dealership Website

## Overview
Átria Veículos is a modern car dealership website built to enhance the online presence of Átria Veículos. The project provides a comprehensive solution for customers to browse inventory, simulate financing, and sell their cars, with the goal of increasing sales and market reach. It includes vehicle listings, dealer information, contact forms, and interactive features for browsing and filtering vehicles.

## User Preferences
Preferred communication style: Simple, everyday language.
Package installation: Always ask user to install packages directly via shell when packager tool fails. User prefers direct installation requests over alternative solutions.

## System Architecture

### Frontend Architecture
The application is a Single-Page Application (SPA) built with React.js and Vite, utilizing a component-based architecture. Styling is handled with CSS, focusing on responsive design. Key design elements include a dual header system, a clean and professional aesthetic with a blue theme and orange-yellow accents, and a focus on intuitive user experience. Mobile navigation features a fixed bottom menu with a full-screen side panel.

### Technical Implementations
- **Navigation**: Uses React Router for seamless navigation.
- **Vehicle Display**: Offers comprehensive vehicle listings with dynamic filtering, sorting, and search capabilities, localized for the Brazilian market.
- **Interactive Components**: Includes a 3-step financing calculator with lead capture and animations (Framer Motion), an advanced vehicle filter sidebar, and integrated lead capture forms.
- **Admin Panel**: Provides an administration interface for inventory management, custom tags, and leads. It features AI integration for vehicle data correction and commercial description generation, and robust photo gallery management. Vehicle import includes intelligent duplicate detection and automatic synchronization with external spreadsheets.
- **Performance Optimization**: Implements an advanced Critical CSS Strategy for First Contentful Paint (FCP) optimization, font preloading, asynchronous non-critical CSS loading, and preconnect optimization for critical CDNs. Comprehensive Content Security Policy (CSP) headers are implemented. Font optimization reduces blocking, and JavaScript bundle optimization is achieved through lazy loading of major components and Firebase SDK, YouTube embed optimization, and vendor chunk optimization. Resource deferral includes async/defer scripts, conditional CSS loading, universal `loading="lazy"` for images, and an intelligent resource deferrer system.
- **Cloudinary Integration**: Complete migration to Cloudinary for image and video asset management, providing optimized format selection (WebP/AVIF), quality optimization, responsive sizing, and CDN acceleration.
- **Brand Logo Normalization**: Centralized registry and component for consistent 100x100px logo display, with intelligent fallback and synonym mapping for major automotive brands.
- **Click-to-Call Lead Capture System**: Comprehensive call-to-action system with lead capture modal, GA4/Meta Pixel tracking, and backend API integration.
- **Technical SEO Implementation**: Comprehensive SEO system for vehicle detail pages and static pages with Local SEO for Campinas-SP. Features canonical URLs, complete meta tags optimization, OpenGraph/Twitter Cards, JSON-LD Vehicle schema, BreadcrumbList structured data, and local SEO text. Includes automated sitemap.xml and robots.txt generation, 301 redirects, and environment-based SEO configuration.
- **Lazy Loading Implementation**: Applied to various components for improved LCP/FCP performance.
- **URL Structure**: Clean shortId-based URLs (e.g., `/carros/marca/modelo/ano-shortId`) for improved SEO and user experience, with backward compatibility for legacy links.
- **Technical Specifications**: Displays comprehensive vehicle technical details.
- **AI Content Management**: Automatically detects and flags vehicles with AI-generated content.

### UI/UX Decisions
- **Color Scheme**: Uses Átria blue (`#1A75FF`) and dark sections (`#1a2332`), with orange-yellow gradients for calls to action.
- **Typography**: Consistent use of DM Sans font.
- **Imagery**: Utilizes high-quality, optimized images.
- **Responsive Design**: Mobile-first approach with optimized layouts and redesigned filter interfaces for mobile.
- **Animations**: Leverages Framer Motion for smooth transitions and micro-interactions.

### Feature Specifications
- Homepage with video background, statistics, and sections for featured vehicles, financing, and testimonials.
- Dynamic vehicle inventory page with advanced filtering and search.
- Individual vehicle detail pages with specifications and contact forms.
- "Sell Your Car" page with lead capture.
- Blog section.
- Admin portal for content management.
- Comprehensive Financing Page offering direct links, a financing calculator, and full Credere embed integration.

## External Dependencies

- **Frontend Framework**: React, React DOM, React Router.
- **Build Tool**: Vite.
- **Styling Libraries**: Bootstrap, customized CSS.
- **Icon Libraries**: Font Awesome, Flaticon, LucideIcon.
- **UI Components**: Slick Carousel, rc-slider.
- **Animation**: Framer Motion.
- **Backend/Database**: Firebase (Firestore for vehicle data, leads, blog posts, testimonials, custom tags).
- **AI Integration**: OpenAI API (for vehicle data correction, equipment suggestions, commercial description generation).
- **CRM Integration**: Autopop360 CRM (for lead forwarding).
- **Financing Plugin**: Credere (for financing simulation).
- **Hosting-related**: Netlify, Replit Autoscale.

- # Regras do Projeto (Site Átria)
- Editar código diretamente. Nada de plano extenso.
- Comandos: dev (npm run dev), build (npm run build), preview (npm run preview).
- Porta 5000, host 0.0.0.0. Não mudar sem pedido.
- Não criar backend/Express. Repo é front (Vite + React Router).
- Commits pequenos e claros (feat|fix|chore).
