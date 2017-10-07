let selector;
let currentElm;
let badgeNumber = 0;
let resetBadge = false;
let scrapeStatus = false;
let scrapedInfo = {};
let productProps = {};
let port = null;
let contentTabId = null;

chrome.webNavigation.onCommitted.addListener((details) => {
  let types = ['link', 'reload', 'typed'];
  types.forEach((type) => {
    if (details.transitionType === type) {
      refreshStorage();
    }
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  contentTabId = sender.tab.id;
});

function setPort(callback) {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    port = chrome.tabs.connect(contentTabId, {name: 'contentscript'});
    callback(port);
  });
}

function endScrape() {
  setPort((port) => {
    if (port) { port.postMessage({status: 'endScrape'}); }
  });  
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo && changeInfo.status === 'complete') {
    badgeNumber = 0;
    chrome.browserAction.setBadgeText({ text: badgeNumber.toString(), tabId: tab.id });
    setTimeout(updateBadgeNumber,1000);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'gotElm') {
    currentElm = message.elm;
    selector = message.msg;
    createPopup();
  }
});

chrome.webRequest.onCompleted.addListener((details) => {
  notifyIfError(details); 
  setViewFileUrl(details);
  setAppFileUrl(details);
  setPreCaptureUrl(details);
  setPixelFileUrl(details);
},{urls: ['http://*/*','https://*/*']},['responseHeaders']);

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let key in changes) {
    let storageChange = changes[key];
    storageChange.oldValue = storageChange.newValue;
  }
});

function refreshStorage () {
  chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
    if (typeof tabs[0] === 'undefined') {
      return;
    }
    ['usi_view ', 'usi_monitor ', 'usi_pixel ', 'usi_tag '].forEach(item => {
      chrome.storage.local.get(item + tabs[0].id, items => {
        chrome.storage.local.remove(item + tabs[0].id);
      });
    });
  });
}

function updateBadgeNumber() {
  chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
    chrome.storage.local.get(null, (items) => {
      if (typeof tabs[0] === 'undefined') {
        return;
      }
      ['usi_view ', 'usi_monitor ', 'usi_tag ', 'usi_pixel '].forEach(item => {
        if (items[item + tabs[0].id] !== undefined) {
          badgeNumber += 1;
          chrome.browserAction.setBadgeText({ text: badgeNumber.toString(), tabId: tabs[0].id });          
        }
      });
    });
  });
}

function notifyIfError(details) {
  let upsellit = 'upsellit.com';
  let re = /\b(err.jsp|error.jsp)\b/g;
  let errorFiles = !!details.url.match(re);

  if (!upsellit || !errorFiles) {
    return;
  }
  chrome.notifications.create('usi_notification', {
    type: 'basic',
    title: 'Error',
    iconUrl: 'upselliticon.png',
    message: 'An error occurred. Notify campaign dev & provide a screenshot.'
  }, function() {
    setTimeout(function() {
      chrome.notifications.clear('usi_notification', function(){});
    }, 3000);
  });
}

function setViewFileUrl(details) {
  let pair = {};
  if (details.url.indexOf('view.jsp?') !== -1) {  
    pair["usi_view " + details.tabId] = { 'usi_view': details.url };
    chrome.storage.local.set(pair);
  }
}

function setAppFileUrl(details) {
  let pair = {};
  if (appFileExists(details)) {   
    pair["usi_tag " + details.tabId] = { 'usi_tag': details.url };
    chrome.storage.local.set(pair);
  }
}

function appFileExists(details) {
  let appFileUrls = [
    '/launch/', '/active/', '/custom/'
  ];
  let upsellit = details.url.indexOf('upsellit.com') !== -1;
  let re = /\b(upsellitcom|blank\.jsp|pixel\.jsp|hound|pv2\.js)\b/g;
  let otherFiles = !!details.url.match(re);
  let appFileExists = appFileUrls.filter((url) => { 
    return details.url.indexOf(url) !== -1; 
  }).length > 0;
  return upsellit && appFileExists && !otherFiles;
}

function setPreCaptureUrl(details) {
  let pair = {};

  if (details.url.indexOf('monitor.jsp?') !== -1) {   
    pair['usi_monitor ' + details.tabId] = { 'usi_monitor': details.url };
    chrome.storage.local.set(pair);
  }
}

function setPixelFileUrl(details) {
  let pair = {};
  let url = details.url;
  let pixel = url.indexOf('upsellit.com') !== -1 && url.indexOf('_pixel.jsp') !== -1;

  if (pixel) {
    pair['usi_pixel ' + details.tabId] = { 'usi_pixel': details.url };
    chrome.storage.local.set(pair);
  }
}

function createPopup() {
  chrome.tabs.create({
    url: chrome.extension.getURL('dialog.html'),
    active: false
  }, function(tab) {
    chrome.windows.create({
      tabId: tab.id,
      type: 'popup',
      focused: true,
      width: 350,
      height: 150
    });
  });
}

function portEstablished() {
  return contentTabId !== null;
}

function setProductProperty(prop) {
  productProps[prop] = prop;
}

function getProductProperties() {
  return productProps;
}

function resetProductProperties() {
  productProps = {};
}

function updateScrapeProgress(selector) {
  scrapedInfo[currentElm] = selector;
}

function resetScrapeProgress() {
  scrapedInfo = {};
}

function getScrapedInfo() {
  return scrapedInfo;
}

function getSelector() {
  return selector;
}

function getScrapeStatus() {
  return scrapeStatus;
}

function setScrapeStatus(status) {
  scrapeStatus = status;
}