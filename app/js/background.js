chrome.storage.local.set({nextPort: 9876});

chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('index.html', {bounds: {width: 700, height: 550}});
});
