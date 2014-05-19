function focusOrCreateTab(url) {
	chrome.windows.getAll({"populate":true}, function(windows) {
		var existing_tab = null;
		for (var i in windows) {
			var tabs = windows[i].tabs;
			for (var j in tabs) {
				var tab = tabs[j];
				if (tab.url == url) {
					existing_tab = tab;
					break;
				}
			}
		}
		if (existing_tab) {
			chrome.tabs.update(existing_tab.id, {"selected":true});
		} else {
			var curTabId;
			chrome.tabs.create({"url":url, "selected":true}, function (tab) {
				curTabId = tab.id;
			});
			chrome.windows.getCurrent( function(win) {
				chrome.tabs.getAllInWindow(win.id, function(tabs) {
					for ( var i=0; i < tabs.length; i++) {
						if (tabs[i].id != curTabId) {
							chrome.tabs.remove(tabs[i].id)
						}
					}
				});
			});
		}
	});
}
function initApp (tab) {
	var app_url = chrome.extension.getURL("app.html");
	focusOrCreateTab(app_url);
};

chrome.browserAction.onClicked.addListener(initApp);