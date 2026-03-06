let isPaused = false;
let pauseStartTime = null;
let totalPausedDuration = 0;

window.addEventListener("blur", () => {
    if (!isPaused) {
        isPaused = true;
        pauseStartTime = Date.now();
    }
});

window.addEventListener("focus", () => {
    if (isPaused) {
        const pauseEnd = Date.now();
        totalPausedDuration += (pauseEnd - pauseStartTime);
        isPaused = false;
        pauseStartTime = null;
    }
});

function updateCountdown() {
    const now = Date.now();

    // Adjust paused time dynamically if still paused
    const pausedDuration = totalPausedDuration + (isPaused ? (now - pauseStartTime) : 0);
    const adjustedNow = now - pausedDuration;

    const secsLeft = Math.ceil((delayEnd - adjustedNow) / 1000);
    document.getElementById("seconds").textContent = String(Math.max(0, secsLeft)).padStart(2, '0');

    if (secsLeft <= 0) {
        clearInterval(intervalID);

        browser.storage.sync.get(['unBlockedSites', 'delayedSites'], result => {
            if (browser.runtime.lastError) {
                console.error('storage error:', browser.runtime.lastError);
                window.location.href = targetSite;
                return;
            }

            const unblocked = result.unBlockedSites || {};
            const delayed = result.delayedSites || {};

            const key = matchedKey || (checkExtensionPage(targetSite) ? targetSite : standardiseUrl(targetSite));
            const normalized = checkExtensionPage(targetSite) ? targetSite : standardiseUrl(targetSite);
            const plan = delayed[key] || delayed[normalized] || delayed[targetSite];

            const unblockMinutes = plan ? plan[1] : 0;
            const until = Date.now() + (unblockMinutes * 60 * 1000);

            if (key) {
                unblocked[key] = until;
            }

            browser.storage.sync.set({ unBlockedSites: unblocked }, () => {
                if (browser.runtime.lastError) console.error('set error:', browser.runtime.lastError);
                window.location.href = targetSite;
            });
        });
    }
}


let targetSite, matchedKey, delayEnd, intervalID;

browser.storage.sync.get(['pendingDelay'], result => {
    const pending = result.pendingDelay;
    if (!pending) return;

    targetSite = pending.site;
    matchedKey = pending.key;
    delayEnd = Date.now() + (pending.delay * 1000);

    browser.storage.sync.remove('pendingDelay');

    intervalID = setInterval(updateCountdown, 1000);
    updateCountdown();
});

// Load the saved message and display it
function loadAndDisplayMessage() {
    const messageElement = document.getElementById('message');

    // Fetch the saved message from storage.sync
    browser.storage.sync.get(['selfMessage'], function (result) {
        if (browser.runtime.lastError) {
            console.error('Error fetching message from storage.sync:', browser.runtime.lastError);
            messageElement.textContent = '---';
            return;
        }

        // Display the message if it exists
        messageElement.textContent = result.selfMessage || 'Would the person i want to be, do this?';
    });
}

function loadAndSetRedirect() {

    // Fetch the saved website from storage.sync
    browser.storage.sync.get(['wisdomSite'], function (result) {
        if (browser.runtime.lastError) {
            console.error('Error fetching message from storage.sync:', browser.runtime.lastError);
            document.getElementById('wisdom-site').addEventListener('click', function () {
                window.location.href = "https://www.google.com/";
            });
            return;
        }

        // Event listener for the button
        document.getElementById('wisdom-site').addEventListener('click', function () {
            window.location.href = result.wisdomSite || "https://www.google.com/";
        });

    });
}


// Call the function to load and display the message when the document is loaded
document.addEventListener('DOMContentLoaded', loadAndDisplayMessage);
// Call the function to load and set the button redirect
document.addEventListener('DOMContentLoaded', loadAndSetRedirect);


