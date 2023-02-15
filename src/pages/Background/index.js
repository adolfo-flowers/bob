console.log('This is the background page.');
console.log('Put the background scripts here.');
chrome.action.onClicked.addListener(function (tab) {
  chrome.tabs.create({
    url: chrome.runtime.getURL('newtab.html'),
    active: true,
  });
});
