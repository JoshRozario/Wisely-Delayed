# Wisely Delayed - Build Instructions

## Requirements

- Node.js v18 or later (https://nodejs.org)
- npm (included with Node.js)

## Build Steps

1. Install dependencies:
   ```
   npm install
   ```

2. Build the CSS:
   ```
   npm run build
   ```

This generates `dist/tailwind.css` from `input.css` using the configuration in `tailwind.config.js`.

The remaining files (`manifest.json`, `background.js`, `utils.js`, `countdown.js`, `countdown.html`, `options.html`, `options.js`) are plain JavaScript/HTML and require no build step.
