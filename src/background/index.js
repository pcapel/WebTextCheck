function openOptions() {
  browser.runtime.openOptionsPage();
}

browser.browserAction.onClicked.addListener(openOptions);
