chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "open_settings") {
        if (chrome.action && chrome.action.openPopup) {
            chrome.action.openPopup().catch(() => {
                chrome.runtime.openOptionsPage();
            });
        } else {
            chrome.runtime.openOptionsPage();
        }
    }
});