// Add a submit event listener to the form
// Attach an event listener to the form's submit event

document.getElementById('settings-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Get the input values from the form
    const siteInput = document.getElementById('site');
    const delayInput = document.getElementById('delay');
    const unblockInput = document.getElementById('unblockTime');

    var siteValue = ""

    if (checkExtensionPage(siteInput.value))
    {
        siteValue = siteInput.value.trim()
    }
    else{
        siteValue = standardiseUrl(siteInput.value.trim());
        if (!isValidURL(siteValue) && !isWildcard(siteValue)) {
            alert('Please enter a valid URL');
            return
        }
    }
    const delayValue = parseInt(delayInput.value, 10);
    const unblockValue = parseInt(unblockInput.value, 10);

    // Validate the input (you can add more validation as` needed)


    if(isNaN(delayValue) || delayValue < 5){
        alert('Please enter a valid delay');
        return;
    }

    if(isNaN(unblockValue) || unblockValue < 1){
        alert('Please enter a valid unblock time');
        return;
    }

    // Fetch the current data from storage.sync
    browser.storage.sync.get(['delayedSites'], function(result) {
        if (browser.runtime.lastError) {
            console.error('Error fetching data from storage.sync:', browser.runtime.lastError);
            return;
        }
    
        // Modify the data (add a new delayed site)
        const existingDelayedSites = result.delayedSites || {}; // Initialize as an empty object if it doesn't exist
        
        existingDelayedSites[siteValue] = [delayValue,unblockValue]; // Add the new site and delay to the object
    
        // Update the data in storage.sync
        browser.storage.sync.set({ delayedSites: existingDelayedSites }, function() {
            if (browser.runtime.lastError) {
                console.error('Error updating data in storage.sync:', browser.runtime.lastError);
                return;
            }
            console.log('Data updated successfully:', existingDelayedSites);
            displayDelayedSites();  // Refresh the list of delayed sites
        });
    });

    // Reset the form
    this.reset();
});


// Function to validate a URL
function isValidURL(url) {
  try {
    new URL(url.includes("://") ? url : "https://" + url);
    return true;
  } catch {
    return false;
  }
}
// Function to display the current delayed sites
function displayDelayedSites() {
    browser.storage.sync.get(['delayedSites'], function(result) {
        const delayedSites = result.delayedSites || {};
        const listContainer = document.getElementById('delayed-sites-list');
        listContainer.innerHTML = ''; // Clear existing list

        Object.keys(delayedSites).forEach(site => {
            const siteItem = document.createElement('div');
            siteItem.className = 'flex items-center justify-between p-3 border-b border-gray-700';
            siteItem.innerHTML = `
                <span class="text-pacific-cyan"><span class="font-bold">${site}</span> - Delay: <span class="text-white">${delayedSites[site][0]}s</span>, Unblock Time: <span class="text-white">${delayedSites[site][1]}m</span></span>
                <div>
                    <button class="edit-btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline mr-2" data-site="${site}">Edit</button>
                    <button class="delete-btn bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline" data-site="${site}">Delete</button>
                </div>
            `;
            listContainer.appendChild(siteItem);
        });
    });
}

// Function to display the current Unblocked sites
// Function to display the current Unblocked sites
function displayUnBlockedSites() {
    browser.storage.sync.get(['unBlockedSites'], function(result) {
        const unBlockedSites = result.unBlockedSites || {};
        const listContainer = document.getElementById('unblocked-sites-list');
        listContainer.innerHTML = ''; // Clear existing list

        Object.keys(unBlockedSites).forEach(site => {
            let secondsLeft = Math.floor((unBlockedSites[site] - new Date().getTime()) / 1000);

            let timeLeftText = secondsLeft >= 0 ? `${secondsLeft} seconds` : "It ain't unblocked";

            const siteItem = document.createElement('div');
            siteItem.className = 'flex items-center justify-between p-3 border-b border-gray-700';
            siteItem.innerHTML = `
                <span class="text-pacific-cyan"><span class="font-bold">${site}</span> - Time Left Unblocked: <span class="text-white">${timeLeftText}</span></span>
            `;
            listContainer.appendChild(siteItem);
        });
    });
}



// Event delegation for edit and delete buttons
document.getElementById('delayed-sites-list').addEventListener('click', function(event) {
    const site = event.target.getAttribute('data-site');
    if (event.target.classList.contains('edit-btn')) {
        editDelayedSite(site);
    } else if (event.target.classList.contains('delete-btn')) {
        deleteDelayedSite(site);
    }
});


// Function to edit a delayed site
function editDelayedSite(site) {
    // Fetch site details and populate the form for editing
    browser.storage.sync.get(['delayedSites'], function(result) {
        const delayedSites = result.delayedSites || {};
        if (delayedSites[site]) {
            document.getElementById('site').value = site;
            document.getElementById('delay').value = delayedSites[site][0];
            document.getElementById('unblockTime').value = delayedSites[site][1];
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        }
    });
}

// Function to delete a delayed site
function deleteDelayedSite(site) {
    browser.storage.sync.get(['delayedSites'], function(result) {
        const delayedSites = result.delayedSites || {};
        delete delayedSites[site]; // Remove the site

        // Update the data in storage.sync
        browser.storage.sync.set({ delayedSites: delayedSites }, function() {
            displayDelayedSites(); // Refresh the list
        });
    });
}

function saveMessage() {
    const messageInput = document.getElementById('self-message');
    const message = messageInput.value.trim(); // Remove leading/trailing spaces

    // Save the message to storage.sync
    browser.storage.sync.set({ selfMessage: message }, function() {
        if (browser.runtime.lastError) {
            console.error('Error updating message in storage.sync:', browser.runtime.lastError);
            return;
        }
        console.log('Message updated successfully:', message);
    });
}

function saveSite() {
    const siteInput = document.getElementById('wisdom-site');
    const raw = siteInput.value.trim(); // Remove leading/trailing spaces
    const site = raw ? (raw.includes('://') ? raw : 'https://' + raw) : '';

    // Save the message to storage.sync
    browser.storage.sync.set({ wisdomSite: site }, function() {
        if (browser.runtime.lastError) {
            console.error('Error updating message in storage.sync:', browser.runtime.lastError);
            return;
        }
        console.log('Message updated successfully:', site);
    });
}

function loadSavedMessage() {
    const messageInput = document.getElementById('self-message');

    // Fetch the current message from storage.sync
    browser.storage.sync.get(['selfMessage'], function(result) {
        if (browser.runtime.lastError) {
            console.error('Error fetching message from storage.sync:', browser.runtime.lastError);
            return;
        }

        // If a message is saved, set it as the input's value
        console.log(result.selfMessage)
        if (result.selfMessage) {
            messageInput.value = result.selfMessage;
        }
    });
}

function loadSavedSite() {
    const siteInput = document.getElementById('wisdom-site');

    // Fetch the current message from storage.sync
    browser.storage.sync.get(['wisdomSite'], function(result) {
        if (browser.runtime.lastError) {
            console.error('Error fetching message from storage.sync:', browser.runtime.lastError);
            return;
        }

        // If a message is saved, set it as the input's value
        console.log(result.wisdomSite)
        if (result.wisdomSite) {
            siteInput.value = result.wisdomSite;
        }
    });
}


// Call displayDelayedSites on page load
document.addEventListener('DOMContentLoaded', displayDelayedSites);
document.addEventListener('DOMContentLoaded', displayUnBlockedSites);
document.getElementById('self-message-form').addEventListener('submit', function(e) {
    e.preventDefault();
    saveMessage();
});
document.getElementById('wisdom-site-form').addEventListener('submit', function(e) {
    e.preventDefault();
    saveSite();
});
document.addEventListener('DOMContentLoaded', loadSavedMessage);
document.addEventListener('DOMContentLoaded', loadSavedSite);

setInterval(displayUnBlockedSites, 1000);
