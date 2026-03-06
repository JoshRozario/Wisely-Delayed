# Wisely Delayed

Firefox extension that reduces wasted time on distracting sites by using the power of friction.

Instead of blocking sites outright, Wisely Delayed forces a countdown before you can access them, giving you a moment to reconsider.

## Features

- Configurable delay per site (seconds) and unlock duration (minutes)
- Wildcard support (`*.youtube.com` blocks all subdomains)
- Self-lock the settings page to prevent impulsive changes
- Custom motivational message on the countdown screen
- Redirect button to a productive site of your choice
- Import/export settings for backup and restore
- Countdown pauses when you leave the tab

## Install

[Get it on Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/wisely-delayed/)

## Build

Requires Node.js 18+.

```
npm install
npm run build
```

This generates `dist/tailwind.css` from `input.css`. All other files are plain JS/HTML.
