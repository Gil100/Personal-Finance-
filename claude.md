# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Common Development Tasks
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages

### Testing
- No test framework currently configured (package.json shows "no test specified")
- Use browser testing and manual testing for now

## Architecture Overview

### High-Level Structure
This is an Israeli Personal Finance Dashboard built as a Progressive Web App (PWA) using vanilla JavaScript, with comprehensive Hebrew/RTL support and Israeli-specific financial features.

### Core Architecture Patterns

**Component System**: Custom component library with Hebrew-first design
- All components in `src/components/` are class-based with render methods
- Components support Hebrew text and RTL layouts natively
- Global component registry through `ComponentUtils` in `src/components/index.js`

**Data Management**: Unified DataAPI with Israeli financial features
- Central data layer in `src/data/index.js` exports `DataAPI` and `DataManager` 
- Modular data services: storage, validation, encryption, analytics, migration
- Built-in support for Israeli banks, categories, and currency formatting

**Israeli Localization**: Deep Hebrew and Israeli market integration
- Hebrew financial terms dictionary (`src/utils/hebrew-financial-terms.js`)
- Israeli formatting utilities (`src/utils/israeli-formatting.js`)
- Israeli salary calculator with tax calculations (`src/utils/israeli-salary-calculator.js`)
- Israeli financial tips and guidance (`src/utils/israeli-financial-tips.js`)

### Key Architectural Decisions

**Module Loading**: Dynamic script loading system in `main.js`
- Components loaded asynchronously on app initialization
- Order-dependent loading through `loadComponentLibrary()` function
- Error handling for missing dependencies

**Theme System**: Comprehensive dark/light mode with Hebrew support
- CSS custom properties for theme variables
- Theme state persisted in localStorage
- RTL-aware theme switching

**Data Schema**: Israeli-centric data models
- Default categories tailored for Israeli users
- Israeli bank integration ready (`ISRAELI_BANKS` constant)
- Shekel (�) as primary currency with Hebrew formatting

## Development Guidelines

### Component Development
- All components must support Hebrew text and RTL layout
- Use `HebrewToasts` for user notifications (not generic alerts)
- Follow the established pattern: constructor, render method, event handlers
- Components should integrate with the global `ComponentUtils` demo system

### Data Operations
- Always use `DataAPI` or `DataManager` for data operations
- Validate data using `DataAPI.validation` methods before saving
- Use Hebrew error messages from validation system
- Consider encryption requirements for sensitive financial data

### Israeli Localization Requirements
- Use Hebrew financial terminology from `src/utils/hebrew-financial-terms.js`
- Format currency using Israeli formatting utilities (� symbol, Hebrew numbers)
- Implement RTL-aware layouts for all new UI components
- Test with Hebrew text input and display

### File Organization
- Components: `src/components/` - UI components with Hebrew support
- Data Layer: `src/data/` - Storage, validation, models, analytics
- Utils: `src/utils/` - Israeli-specific utilities and formatters
- Styles: `src/styles/main.css` - RTL-first CSS with theme support

## Israeli-Specific Features

### Financial Data
- Built-in Israeli bank integration (`ISRAELI_BANKS` in schema)
- Israeli salary calculator with tax brackets and deductions
- Default expense categories tailored for Israeli users
- Hebrew financial terminology and success messages

### Formatting and Display
- Hebrew number formatting with proper RTL text direction
- Israeli phone number formatting (XXX-XXX-XXXX)
- Israeli ID number validation with checksum
- Tax year formatting following Israeli calendar

### User Experience
- Hebrew-first interface with RTL navigation
- Israeli financial tips and guidance system
- Cultural-appropriate color schemes and design patterns
- Hebrew UX writing and error messages

## PWA Configuration

### Service Worker
- Configured in `public/sw.js` for offline functionality
- Registered in `main.js` with GitHub Pages compatibility
- Handles caching of Hebrew fonts and assets

### Manifest
- PWA manifest in `public/manifest.json`
- Hebrew app name and description
- Israeli-themed icons and colors

## Deployment
- GitHub Pages deployment via `npm run deploy`
- Production base path configured for GitHub Pages subdirectory
- Assets and fonts optimized for Hebrew text rendering