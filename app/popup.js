// Upsellit Chrome Extension Tool
// Author: @Kevin Elberger
(function() {
    let pixelData;
    let campaignImgs;
    let campaignData;
    let firstUrl = false;
    let imagesAdded = false;
    let formOpen = false;
    let testScriptAppended = false;
    let addScrape = getElm('.add-scrape')[0];
    let cardWrapper = getElm('.col-right')[0];
    let scrapeInfo = getElm('.scrape-info')[0];
    let scraperBtn = getElm('.scraper-btn')[0];
    let generatedCode = getElm('.scrape-code')[0];
    let rebuilderBtn = getElm('.rebuilder-btn')[0];
    let finishScrape = getElm('.finish-scrape')[0];
    let cancelScrape = getElm('.cancel-scrape')[0];
    let returnScrape = getElm('.return-scrape')[0];
    let testFilters = getElm('#unit-test-filters')[0];
    let campaignDetails = getElm('.campaign-details')[0];
    let addProductForm = getElm('#add-product-form')[0];
    let bkpg = chrome.extension.getBackgroundPage();
    let scrapingEnabled = bkpg.getScrapeStatus();
  
    scrapeInfo.onclick = sendScrapeInfo;
    addScrape.addEventListener('click', showScrapeForm);
    scraperBtn.addEventListener('click', enableScraper);
    returnScrape.addEventListener('click', hideCodeInfo);
    cardWrapper.addEventListener('click', showCardDetail);
    testFilters.addEventListener('click', filterUnitTests);
    addProductForm.addEventListener('submit', addPropertyCard);
    finishScrape.addEventListener('click', generateScrapeCode);
    cancelScrape.addEventListener('click', () => { 
      if (bkpg.portEstablished()) bkpg.endScrape();
      displayCardInfo();
      disableScraping();
      hideScrapeForm();
      bkpg.resetProductProperties();
      resizeWindow(350, 250);
      removeAddedProductProperties();
    });
  
    if (scrapingEnabled) {
      displayScrapeInfo();
      updateScrapeCheckmarks(bkpg.getScrapedInfo());
    }
  
    function enableScraper() {
      if (scrapingEnabled) return;
      displayScrapeInfo();
      bkpg.setScrapeStatus(true);
    }
  
    function displayScrapeInfo() {
      hideLoadingBar();
      updateNavBar(true);
      getAddedProductProperties();
      cardWrapper.classList.add('hidden');
      scrapeInfo.classList.remove('hidden');
    }
  
    function displayCardInfo() {
      showLoadingBar();
      updateNavBar(false);
      resizeWindow(350, 250);
      scrapeInfo.classList.add('hidden');
      cardWrapper.classList.remove('hidden');
    }
  
    function hideCodeInfo() {
      showLoadingBar();
      resizeWindow(350, 250);
      bkpg.resetProductProperties();
      removeAddedProductProperties();
      generatedCode.classList.add('hidden');
      cardWrapper.classList.remove('hidden');
    }
  
    function displayCodeInfo() {
      hideLoadingBar();
      updateNavBar(false);
      resizeWindow(500, 800);
      scrapeInfo.classList.add('hidden');
      generatedCode.classList.remove('hidden');
    }
  
    function updateNavBar(toggleButtons) {
      let nav = getElm('#navbar p')[0];
      let addBtn = getElm('.add-scrape')[0];
      if (toggleButtons) {
        nav.style.width = '60%';
        nav.style.paddingLeft = '20%';
        addBtn.classList.remove('hidden');
      } else {
        nav.style.width = '80%';
        nav.style.paddingLeft = '10%';
        addBtn.classList.add('hidden');
      }
    }
  
    function showScrapeForm() {
      let scrapeForm = getElm('.add-scrape-form')[0];
      let input = getElm('#add-product-attribute')[0];
      let height = getWindowHeight() + 68;
  
      if (formOpen) return;
  
      formOpen = true;
      resizeWindow(height);
      scrapeForm.classList.remove('hidden');
      setTimeout(() => {
        scrapeForm.style.top = '0';
        input.focus();
      }, 100);
    }
  
    function getWindowHeight() {
      let height = document.body.style.height;
      return (!!height && Number(height.replace('px', ''))) || 350;
    }
  
    function hideScrapeForm() {
      let scrapeForm = getElm('.add-scrape-form')[0];
      let input = getElm('#add-product-attribute')[0];
      resizeWindow(getWindowHeight() - 68);
      formOpen = false;
      input.value = '';
      scrapeForm.style.top = '-65px';
      scrapeForm.classList.add('hidden');
    }
  
    function resizeWindow(height, width = 250) {
      let wrap = getElm('#widthWrap')[0];
      let col = getElm('.col-right')[0];
      wrap.style.height = `${height}px`;
      col.style.height = `${height}px`;
      document.body.style.height = `${height}px`;
      document.body.style.width = `${width}px`;
    }
  
    function getAddedProductProperties() {
      let props = bkpg.getProductProperties();
  
      if (Object.keys(props).length < 1) return;
  
      Object.keys(props).forEach((prop) => {
        addPropertyCard(undefined, prop);
        let height = getWindowHeight() + 68;
        resizeWindow(height);
      });
    }
  
    function addPropertyCard(e, storedProp) {
      let input = getElm('#add-product-attribute')[0];
      let value = storedProp || input.value;
  
      if (e !== undefined) e.preventDefault();
  
      hideScrapeForm();
      makePropertyCard(value);
      bkpg.setProductProperty(value);
    }
  
    function removeAddedProductProperties() {
      let wrapper = getElm('.scrape-info')[0];
      let children = getElm('.scrape-info')[0].children;
      Array.prototype.slice.call(children).forEach((child) => {
        if (child.className.indexOf('dynamic') !== -1) wrapper.removeChild(child);
      });
    }
  
    function makePropertyCard(name) {
      let newHeight = getWindowHeight() + 68;
      let div = document.createElement('div');
      let scrapeWrapper = getElm('.scrape-info')[0];
      let btnRow = getElm('.button-row')[0];
      let outerSpan = document.createElement('span');
      let innerSpan = document.createElement('span');
      let anchor = document.createElement('a');
      let icon = document.createElement('i');
      anchor.href = '#';
      icon.textContent = 'done';
      div.className = `product-${name.toLowerCase()} dynamic`;
      icon.className = 'material-icons';
      innerSpan.className = 'mdl-chip__text';
      anchor.className = 'mdl-chip__action hidden';
      outerSpan.className = 'mdl-chip mdl-chip--contact';
      innerSpan.textContent = name;
      anchor.appendChild(icon);
      outerSpan.appendChild(anchor);
      outerSpan.appendChild(innerSpan);
      div.appendChild(outerSpan);
      resizeWindow(newHeight);
      scrapeWrapper.insertBefore(div, btnRow);
    }
  
    function sendScrapeInfo(e) {
      let name = e.target.classList[0];
      let parent = e.target.parentNode.classList[0];
      let grandparent = e.target.parentNode.parentNode.classList[0];
      let scrapeElms = getScrapeClassNames();
      scrapeElms.forEach((elm) => {
        let correctElm = name === elm || parent === elm || grandparent === elm;
        if (correctElm) {
          chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {type: 'startScrape', name: elm});
          });
        }
      });
    }
  
    function updateScrapeCheckmarks(info) {
      let scrapeElms = getScrapeClassNames();
   
      if (!info) return;
   
      Object.keys(info).forEach((key) => {
        let currentElm = getElm(`.${key}`)[0];
        getElm('.mdl-chip__action', currentElm)[0].classList.remove('hidden');
      });
    }
  
    function getScrapeClassNames() {
      let productElms = [];
      let scrapeWrapper = getElm('.scrape-info')[0];
      Array.prototype.slice.call(scrapeWrapper.childNodes).forEach(function(node) {
        if (node.classList === undefined) return;
  
        let otherElms = node.classList[0] === 'button-row' || node.classList[0] === 'add-scrape-form';
        if (!otherElms) {
          productElms.push(node.classList[0].toLowerCase());
        }
      });
      return productElms;
    }
  
    function hideScrapeCheckmarks() {
      let scrapeElms = getScrapeClassNames();
      scrapeElms.forEach((elm) => {
        let currentElm = getElm(`.${elm}`)[0];
        getElm('.mdl-chip__action', currentElm)[0].classList.add('hidden');
      });
    }
  
    function generateScrapeCode() {
      if (Object.keys(bkpg.getScrapedInfo()).length < 4) return;
      appendScrapeCode(bkpg.getScrapedInfo());
      displayCodeInfo();
      disableScraping();
    }
  
    function appendScrapeCode(cartInfo) {
      if (getElm('.textarea')[0].children.length > 0) return;
  
      let firstHalf = 
  `usi_app.scrape_cart = function() {
    var product;
    var productArray = [];
    var cartRows = usi_app.get_elm('${cartInfo['cart-row']}');
    try {
      cartRows.forEach(function(item) {
        product = {};
        product.name = usi_app.get_elm('${cartInfo['product-name']}', item)[0].textContent.trim();
        product.image = usi_app.get_elm('${cartInfo['product-image']} img', item)[0].src;
        product.price = usi_app.get_elm('${cartInfo['product-price']}', item)[0].innerHTML.trim().substr(1);
  `;
  
      let lastHalf =
  `      productArray.push(product);
      });
    } catch(e) {}
    return productArray;
  };`;
      let dynamicCode = getDynamicPropertyCode(cartInfo);
      getElm('.textarea')[0].innerHTML = '';
      let jsTextArea = CodeMirror(getElm('.textarea')[0], {
        value: `${firstHalf}${dynamicCode}${lastHalf}`,
        mode: "javascript"
      });
    }
  
    function getDynamicPropertyCode(cartInfo) {
      let result = '';
      let regex = /\b(cart-row|product-name|product-image|product-price)\b/g;
      Object.keys(cartInfo).forEach((key) => {
        if (!key.match(regex)) {
          result += '      product.' + key.replace('product-','') + 
          ' = usi_app.get_elm(' + `'${cartInfo[key]}'` + ', item)[0].innerHTML;' +'\n';
        }
      });
      return result;
    }
  
    function disableScraping() {
      hideScrapeCheckmarks();
      bkpg.resetScrapeProgress();
      bkpg.setScrapeStatus(false);
      scrapingEnabled = bkpg.getScrapeStatus();
    }
  
    function showCardDetail(event) {
      let name = event.target.className;
      let parent = event.target.parentNode.className;
      let isView = /\b(card view|card view expand)\b/g;
      let isTest = /\b(card test|card test expand)\b/g;
      let isPixel = /\b(card pixel|card pixel expand)\b/g;
      let view = !!name.match(isView);
      let test = !!name.match(isTest);
      let pixel = !!name.match(isPixel);
      let viewButton = name.indexOf('button') !== -1 && !!parent.match(isView);
      let testButton = name.indexOf('button') !== -1 && !!parent.match(isTest);
      let pixelButton = name.indexOf('button') !== -1 && !!parent.match(isPixel);
  
      if (view || viewButton) {
        toggleCard('view');
      } else if (test || testButton) {
        toggleCard('test');
      } else if (pixel || pixelButton) {
        toggleCard('pixel');
      }
    }
  
    function toggleCard(name) {
      let toggleCard = getElm(`.${name}`)[0];
      let details = getElm(`.${name}-details`)[0];
  
      if (toggleCard.classList.contains('expand')) {
        collapseCard(toggleCard, details);
        displayOtherCards(name);
      } else {
        expandCard(name, details);
      }
    }
  
    function collapseCard(card, cardDetails) {
      let btn = getElm('.button', card)[0];
      btn.classList.remove('expand');
      card.classList.remove('expand');
      cardDetails.classList.add('hidden');
      cardWrapper.style.background = '#F6F6F6';
    }
  
    function displayOtherCards(name) {
      ['tag', 'view', 'monitor', 'pixel', 'test'].forEach((card) => {
        let elm = getElm(`.${card}`)[0];
        if (!!elm && elm.classList.contains(name)) { return; }
        if (elm.style.display === 'none') { elm.style.display = 'block'; };
      });
    }
  
    function expandCard(name, cardDetails) {
      let toggleCard = getElm(`.${name}`)[0];
      ['tag', 'view', 'monitor', 'pixel', 'test'].forEach((card) => {
        let elm = getElm(`.${card}`)[0];
        if (!!elm) {
          elm.classList.contains(name) ? expandElement(elm) : hideElement(elm);
        }
      });
      if (toggleCard.classList.contains('view')) { addViewCardData(); }
      if (toggleCard.classList.contains('pixel')) { addPixelCardData(); }
      cardDetails.classList.remove('hidden');
      cardWrapper.style.background = '#458dfc';
    }
  
    function addViewCardData() {
      let siteUrl = 'https://www2.upsellit.com/admin/control/edit/site.jsp?siteID=';
      let images = getElm('.images')[0];
      let siteId = getElm('.site-id')[0];
      let coupon = getElm('.coupon')[0];
      let link = getElm('.tooltiptext')[0];
      let assocEmail = getElm('.assoc-email')[0];
  
      if (campaignData === undefined) return;
  
      if (!imagesAdded) {
        addImageUrls();
      }
      coupon.innerHTML = campaignData.coupon || 'none';
      link.innerHTML = campaignData.deep_link || 'none';
      siteId.innerHTML = `<a href="${siteUrl}${campaignData.site_id}" target="_blank"/>${campaignData.site_id}</a>`;
      assocEmail.innerHTML = `<a href="${siteUrl}${campaignData.email_id}" target="_blank"/>${campaignData.email_id}</a>`;
    }
  
    function addPixelCardData() {
      let id = getElm('.order-id')[0];
      let amt = getElm('.order-amt')[0];
  
      if (pixelData === undefined) return;
  
      id.innerHTML = pixelData.orderID;
      amt.innerHTML = pixelData.orderAmt;
    }
  
    function addImageUrls() {
      let names = ['part1', 'part2', 'background'];
      let images = getElm('.images')[0];
  
      imagesAdded = true;
  
      [campaignImgs.p1, campaignImgs.p2, campaignImgs.background].forEach((image, index) => {
        if (!!image) {
          images.innerHTML += `${createImageLink(image, names[index])} `;
        }
      });
    }
  
    function createImageLink(href, text) {
      return `<a href="https://upsellit.turbobytes.net${href}" target="_blank"/>${text}</a>`;
    }
  
    function hideElement(elm) {
      elm.style.display = 'none';
      elm.classList.contains('expand') ? '' : elm.classList.remove('expand');
    }
  
    function expandElement(elm) {
      elm.classList.add('expand');
      getElm('.button', elm)[0].classList.add('expand');
    }
  
    function hideLoadingBar() {
      let bar = getElm('#progressLoader')[0];
      bar.style.display = 'none';
    }
  
    function showLoadingBar() {
      let bar = getElm('#progressLoader')[0];
      bar.style.display = 'block';
    }
  
  
    function filterUnitTests() {
      let radios = document.getElementsByName('filter');
      [].forEach.call(radios, (radio) => {
        radio.checked ? toggleUnitTests(radio.id, 'block') : toggleUnitTests(radio.id, 'none');
      });
    }
  
    function toggleUnitTests(moduleName, displayValue) {
      let moduleNames = getElm('.module-name');
      if (moduleName === 'qunit-filter-input') { return; }
      [].forEach.call(moduleNames, (modName) => {
        if (modName.innerHTML.indexOf(moduleName) !== -1) {
          modName.parentNode.parentNode.style.display = displayValue;
        }
      });
    }
  
    function showCard(card, url) {
      let testUrl;
      let monitorUrl;
      let monitorHTML;
      let tag = getElm('.tag')[0];
      let view = getElm('.view')[0];
      let pixel = getElm('.pixel')[0];
      let monitor = getElm('.monitor')[0];
  
      if (url.indexOf('monitor.jsp') !== -1) {
        monitorUrl = url.substr(url.indexOf('siteID=')+7);
        monitorHTML = '<i class="material-icons circle">local_post_office</i> Monitor Found - ' + monitorUrl;
      }
  
      switch (card) {
        case 'usi_view':
          view.classList.remove('hidden');
          break;
  
        case 'usi_monitor':
          monitor.innerHTML = monitorHTML;
          monitor.classList.remove('hidden');
          break;
  
        case 'usi_pixel':
          pixel.classList.remove('hidden');
          break;
  
        default:
          tag.classList.remove('hidden');
          if (url.indexOf('https') === -1) {
            url.replace('http', 'https');
          }
          appendUnitTestScript(url);
          break;
      }
    }
  
    function appendUnitTestScript(url) {
      let testSrc = url.replace('.jsp', '_test.js').replace('/active/', '/tests/').replace('/launch/', '/tests/');
      if (testScriptAppended || firstUrl) {
        return;
      }
      firstUrl = true;
      loadScript(url);
      setTimeout(() => {
        loadScript(testSrc);
        setTimeout(() => {
          testScriptAppended = true;
        }, 1000);
      }, 1000);
    }
  
    function loadScript(url) {
      let script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.onerror = (() => { window.failedLoad = true; });
      document.head.appendChild(script);
    }
  
    function getLocalStorageTags() {
      let tags = ['usi_tag ', 'usi_view ', 'usi_monitor ', 'usi_test ', 'usi_pixel '];
      chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
        chrome.storage.local.get(null, function(items) {
          tags.forEach(function(item) {
            let specificTag = items[item + tabs[0].id];
            if (specificTag !== undefined) {
              parseRequestHeaders(specificTag); 
            }
          });
        });
      });
    }
  
    function parseRequestHeaders(data) {
      ['usi_view', 'usi_monitor', 'usi_tag', 'usi_pixel'].forEach(item => {
        if (data[item] !== undefined && data[item] !== '') {
          showCard(item, data[item]);
        }
      });
    }
  
    function createNotification(message) {
      let div = document.createElement('div');
      let text = document.createTextNode(message);
  
      div.appendChild(text);
      div.classList.add('card', 'toast');
      cardWrapper.appendChild(div);
      setTimeout(() => {
        div.style.bottom = '-50px';
        setTimeout(() => {
          div.parentNode.removeChild(div);
        }, 100);
      },2000);
    }
  
    function displayElement(selector) {
      let scrapeInfo = getElm('.scrape-info')[0];
      cardWrapper.style.left = '100%';
      scrapeInfo.classList.remove('hidden');
    }
  
    function getElm(selector, elm) {
      if (!elm) { elm = document; }
          return Array.prototype.slice.call(elm.querySelectorAll(selector));
    }
  
    var showTestCard = setInterval(() => {
      let testCard = getElm('.test')[0];
      if (testScriptAppended && typeof failedLoad === 'undefined') {
        testCard.classList.remove('hidden');
        clearInterval(showTestCard);
      }
    }, 1000);
  
    var getDataInterval = setInterval(() => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'getData'}, (data) => {
          if (data !== '' && data !== null) {
            hideLoadingBar();
            campaignData = data;
            clearInterval(getDataInterval);
          }
        });
      });
    }, 500);
  
    var getImageInterval = setInterval(function() {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'getImages'}, (data) => {
          if (data !== '' && data !== null) {
            campaignImgs = data;
            clearInterval(getImageInterval);
          }
        });
      });
    }, 500);
  
    var getPixelInterval = setInterval(function() {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'getPixel'}, (data) => {
            pixelData = data;
            clearInterval(getPixelInterval);
        });
      }); 
    }, 500);
  
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'usiDebug') {
        createNotification(message.msg);
      }
    });
  
    setInterval(getLocalStorageTags, 500);
  }());