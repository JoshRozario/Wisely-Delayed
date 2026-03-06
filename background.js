function isSkippable(url) {
  if (!url) return true;

  // Always skip internal browser pages
  if (url.startsWith("about:") || url.startsWith("chrome://")) return true;

  // For extension pages, only skip our own countdown page.
  if (url.startsWith("moz-extension:") || url.startsWith("chrome-extension://")) {
    try {
      const u = new URL(url);
      const path = (u.pathname || "").toLowerCase();
      if (path.endsWith("/countdown.html") || path === "/countdown.html") return true;
    } catch (_) { /* ignore parse issues */ }
    return false; // allow other extension pages (e.g., options) to be processed
  }

  return false;
}


// Load stored settings
function loadDelayedSites() {
  return browser.storage.sync.get(['delayedSites'])
    .then(result => result.delayedSites || {});
}

function loadTimedSites() {
  return browser.storage.sync.get(['unBlockedSites'])
    .then(result => result.unBlockedSites || {});
}

// Function to handle the delay logic
function handleDelay(tabId, url, delayTime, matchedKey) {
  loadTimedSites().then(timeLeft => {
    if (!url) return;
    console.log("checking url:", url)
    // Use the matched key for timing if available; otherwise fall back to standardized/ext forms
    let timingKey = matchedKey;
    if (!timingKey) {
      const normalized = standardiseUrl(url);
      timingKey = checkExtensionPage(url) ? url : normalized;
    }

    if (!timingKey) return; // nothing to check

    const endTime = timeLeft[timingKey];

    if (endTime == null || endTime < Date.now()) {
      browser.storage.sync.set({ pendingDelay: { site: url, delay: delayTime, key: timingKey } }, () => {
        browser.tabs.update(tabId, { url: browser.extension.getURL('countdown.html') });
      });
    } else {
      // still unlocked
    }
  });
}

// Listen for tab updates
function checkCurrentTab() {
  checkSite();
}

setInterval(checkCurrentTab, 500);

browser.browserAction.onClicked.addListener(function () {
  browser.tabs.create({ 'url': browser.extension.getURL('options.html') }, function (tab) {
    // Tab opened.
  });
});

function checkSite() {
  browser.windows.getCurrent(win => {
    if (!win.focused) return;

    browser.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (!tabs.length) return;

      const tab = tabs[0];
      const tabUrl = tab.url;
      if (!tabUrl || isSkippable(tabUrl)) return;

      console.log("checking url:", tab.url);

      loadDelayedSites().then(delayedSites => {
        for (const storedSite of Object.keys(delayedSites || {})) {
          console.log("checking delayed:", storedSite, tabUrl);

          if (matchesSite(tabUrl, storedSite)) {
            const delayTime = delayedSites[storedSite][0];
            if (delayTime) {
              handleDelay(tab.id, tab.url, delayTime, storedSite);
            }
            break;
          }
        }
      });
    });
  });
}
