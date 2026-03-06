function isWildcard(input) {
    return typeof input === "string" && input.startsWith("*.");
}

function standardiseUrl(inputUrl) {
  if (!inputUrl) return null;

  // Guard against internal/special pages which should not be normalized
  const raw = String(inputUrl).trim().toLowerCase();
  if (
    raw.startsWith("about:") ||
    raw.startsWith("moz-extension:") ||
    raw.startsWith("chrome://") ||
    raw.startsWith("chrome-extension://")
  ) {
    return null;
  }

  // Wildcards pass through unchanged (lowercased)
  if (isWildcard(inputUrl)) return inputUrl.toLowerCase();

  // Ensure protocol (default to https)
  if (!inputUrl.includes("://")) inputUrl = "https://" + inputUrl;

  let parsed;
  try {
    parsed = new URL(inputUrl);
  } catch {
    console.error("Invalid URL:", inputUrl);
    return null;
  }

  let hostname = parsed.hostname.toLowerCase();

  // Don't touch IPs or localhost
  const isIP = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
               hostname === "localhost" ||
               hostname.includes(":");

  // Add "www." for apex domains (messenger.com, messenger.com.au, etc.)
  // but NOT for subdomains (chat.messenger.com) and NOT for IP/localhost.
  if (!isIP && !hostname.startsWith("www.")) {
    const parts = hostname.split(".");
    const secondLast = parts[parts.length - 2];
    const pseudoPublicSuffix = new Set(["com", "net", "org", "gov", "edu", "co"]);

    const isApex =
      parts.length === 2 ||                                  // messenger.com
      (parts.length === 3 && pseudoPublicSuffix.has(secondLast)); // messenger.com.au / messenger.co.uk

    if (isApex) {
      hostname = "www." + hostname;
    }
  }

  // Drop protocol → http/https agnostic
  return hostname;
}

function checkExtensionPage(siteInput) {
    return siteInput.trim().includes("chrome://extensions") ||
        siteInput.trim().startsWith("chrome-extension://") ||
        siteInput.trim().startsWith("moz-extension://");
}

function matchesSite(tabUrl, storedSite) {
  try {
    const parsed = new URL(tabUrl);

    if (isWildcard(storedSite)) {
      const domain = storedSite.slice(2).toLowerCase();
      const host = parsed.hostname.toLowerCase();
      // Match apex (domain) or any true subdomain (dot boundary)
      return host === domain || host.endsWith('.' + domain);
    }

    const s = String(storedSite || '').trim().toLowerCase();

    // Handle extension/internal patterns stored as raw strings
    if (s.startsWith('moz-extension://') || s.startsWith('chrome-extension://')) {
      const scheme = s.startsWith('moz-extension://') ? 'moz-extension://' : 'chrome-extension://';
      const after = s.slice(scheme.length); // may be empty, host+path, or just path

      // If only the scheme is provided, match any extension page
      if (!after) return tabUrl.toLowerCase().startsWith(scheme);

      // Try strict prefix first (covers cases where full UUID was entered)
      if (tabUrl.toLowerCase().startsWith(s)) return true;

      // If user provided only a path like moz-extension://options.html, match on pathname suffix
      try {
        const pathSuffix = after.startsWith('/') ? after : '/' + after;
        return new URL(tabUrl).pathname.toLowerCase().endsWith(pathSuffix.toLowerCase());
      } catch {
        return false;
      }
    }
    if (s.startsWith('chrome://')) {
      return tabUrl.toLowerCase().startsWith(s);
    }

    // Default: compare normalized host-only key
    return standardiseUrl(tabUrl) === s;
  } catch {
    return false;
  }
}


