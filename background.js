function standardiseUrl(inputUrl) {
    // Parse the input URL or prepend 'http://' if no protocol is present
    if (!inputUrl.includes('://')) {
        inputUrl = 'https://' + inputUrl;
    }

    let url;

    try {
        url = new URL(inputUrl);
    } catch (e) {
        // If the URL is not valid, return null or handle as needed
        console.error("Invalid URL");
        return null;
    }

    // Extracting protocol and checking if hostname contains a subdomain or 'www'
    let protocol = url.protocol; // Keep the original protocol
    let hostname = url.hostname;

    // Check if the hostname is 'www.' or has a subdomain like 'app.'
    if (!hostname.startsWith('www.') && !hostname.includes('.')) {
        hostname = 'www.' + hostname; // prepend 'www.' only if it's a simple domain
    }

    // Standardizing the URL to the desired format
    const standardizedUrl = `${protocol}//${hostname}`;

    return standardizedUrl;
}

function encodeDelayTime(delayTime) {
    let string = delayTime.toString();
    // Reverse the string and then encode it to Base64
    let reversed = string.split("").reverse().join("");
    return btoa(reversed);
}

function checkExtensionPage(siteInput) {
    return siteInput.trim().includes("chrome://extensions") ||
        siteInput.trim().startsWith("chrome-extension://") ||
        siteInput.trim().startsWith("moz-extension://");
}

// Load stored settings
function loadDelayedSites() {
    return browser.storage.sync.get(['delayedSites'])
        .then(result => result.delayedSites || {});
}

function loadTimedSites() {
    return browser.storage.sync.get(['unBlockedSites'])
        .then(result => result.unBlockedSites|| {});
}



// Function to handle the delay logic
function handleDelay(tabId, url, delayTime) {

    loadTimedSites().then(timeLeft => {

        if(url == null){
            console.log("no url passed in??")
            return
        }
        console.log(timeLeft)
        console.log(url)

        var endTime;

        if (checkExtensionPage(url)){
            console.log("timeleft extension val: ", timeLeft[(url)])
            console.log(url)
            endTime = timeLeft[url]
        }
        else{
            console.log("timeleft val: ", timeLeft[standardiseUrl(url)])
            endTime = timeLeft[standardiseUrl(url)];
        }

        console.log(endTime)
        if (endTime == null || endTime < new Date().getTime()) {
            // Log the redirection action
            console.log("redirecting tab to countdown timer");

            // Redirect the current tab to the countdown timer
            browser.tabs.update(tabId, { url: `countdown.html?time=${encodeDelayTime(delayTime)}&site=${url}` });

        }else{
            console.log("still have some unlock time :)")
            console.log(endTime)
        }
    });

}

// Listen for tab updates
function checkCurrentTab() {
    checkSite();
}



setInterval(checkCurrentTab, 500);





browser.browserAction.onClicked.addListener(function() {
// Your logic to execute when the extension icon is clicked
// For example, opening a new tab or a popup:
    browser.tabs.create({'url': browser.extension.getURL('options.html')}, function(tab) {
    // Tab opened.
    });
});

function checkSite() {
    browser.windows.getCurrent((currentWindow) => {
        if (currentWindow.focused) { // Only check if the window is focused
            browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length === 0) return;

                const tab = tabs[0]; // Get the currently active tab

                var standardizedUrl = "";

                if (checkExtensionPage(tab.url)) {
                    standardizedUrl = tab.url;
                    if(!standardizedUrl.includes("options.html")){
                        return
                    }
                } else {
                    standardizedUrl = standardiseUrl(tab.url);
                }

                console.log("Checking Current Tab:", standardizedUrl);

                loadDelayedSites().then(delayedSites => {
                    if (delayedSites && delayedSites[standardizedUrl]) {
                        console.log("This is a delayed site:", standardizedUrl);
                        const delayTime = delayedSites[standardizedUrl][0];
                        if (delayTime) {
                            handleDelay(tab.id, tab.url, delayTime);
                        }
                    }
                });
            });
        }
    });
}
  