let isPaused = false; // Flag to track if the timer is paused

window.addEventListener("blur", function () {
    isPaused = true;
});

window.addEventListener("focus", function () {
    isPaused = false;
});

function checkExtensionPage(siteInput) {
    return siteInput.trim().includes("chrome://extensions") ||
        siteInput.trim().startsWith("chrome-extension://") ||
        siteInput.trim().startsWith("moz-extension://");
}


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
function decodeDelayTime(encodedString) {
    // Decode from Base64 and then reverse the string back
    let decoded = atob(encodedString);
    return decoded.split("").reverse().join("");
}

// Function to get the value of a query parameter from the URL
function getQueryParam(parameter) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameter);
}

function updateCountdown() {
    const currentTime = new Date().getTime();

    if (document.hidden || isPaused) {
        console.log("adding more")
        delayEnd += 1000
    }

    // Calculate the countdown time remaining in seconds
    const timeRemainingInSeconds = Math.max(0, Math.floor((delayEnd - currentTime) / 1000));

    // Update the countdown display
    document.getElementById("seconds").textContent = String(timeRemainingInSeconds).padStart(2, '0');

    // Stop the interval if time is up
    if (timeRemainingInSeconds <= 0) {
        clearInterval(intervalID);


        browser.storage.sync.get(['unBlockedSites', 'delayedSites'], function (result) {
            if (browser.runtime.lastError) {
                console.error('Error fetching data from storage.sync:', browser.runtime.lastError);
                return;
            }

            const existingUnblockedSites = result.unBlockedSites || {}; // Initialize as an empty object if it doesn't exist

            const existingDelayedSites = result.delayedSites


            if (checkExtensionPage(targetSite)) {
                console.log("THIS SHOULD DO IT")
                
                let unblockValue = existingDelayedSites[targetSite][1]

                existingUnblockedSites[targetSite] = new Date().getTime() + unblockValue *  60 * 1000; // Add the new site and unblock time to the object

                

            } else {

                let unblockValue = existingDelayedSites[standardiseUrl(targetSite)][1]

                existingUnblockedSites[standardiseUrl(targetSite)] = new Date().getTime() + unblockValue * 60 * 1000; // Add the new site and unblock time to the object

            }

            // Update the data in storage.sync
            browser.storage.sync.set({ unBlockedSites: existingUnblockedSites }, function () {
                if (browser.runtime.lastError) {
                    console.error('Error updating data in storage.sync:', browser.runtime.lastError);
                    return;
                }
                console.log('Data updated successfully:', existingUnblockedSites);
            });
        });

        window.location.href = targetSite; // Redirect to the target site
    }
}

//target site for end of countdown
const targetSite = getQueryParam('site')



// Parsing the delay from the query parameter and converting it to milliseconds
var delayMilliseconds = parseInt(decodeDelayTime(getQueryParam('time')), 10) * 1000;

// Calculate the end time of the delay
var delayEnd = new Date().getTime() + delayMilliseconds;

// Set an interval to update the countdown every second
let intervalID = setInterval(updateCountdown, 950);

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
document.addEventListener('DOMContentLoaded', loadAndSetRedirect)
// Initial update
updateCountdown();


