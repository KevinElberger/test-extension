let lastElm;
let usiSession = '';
let usiImages = '';
let usiPixel = '';
let usiData = '';
let usiMsg = '';
let scrapeElmType = null;
let port = chrome.runtime.connect({ name: 'contentscript' });

chrome.runtime.sendMessage({ text: 'setID' });

chrome.runtime.onConnect.addListener(function(port) {
	let removeEvent = document.body.removeEventListener;
	if (port.name === 'contentscript') {
		port.onMessage.addListener(function (msg) {
			if (msg.status === 'endScrape') {
				removeEvent('click', getElementSelector);
				removeEvent('mouseover', highlightElement);
				removeEvent('contextmenu', getElementSelector);
			}
		});
	}
});

function injectScript(filePath, tag) {
	let node = document.getElementsByTagName(tag)[0];
	let script = document.createElement('script');
	script.setAttribute('type', 'text/javascript');
	script.setAttribute('src', filePath);
	node.appendChild(script);
}

function highlightElement(e) {
	let elm = e.target;

	if (lastElm !== elm) {
		if (!!lastElm) {
			lastElm.style.backgroundColor = '';
		}
		lastElm = elm;
		elm.style.backgroundColor = '#fcfdbc';
	}
}

function getElementSelector(e) {
	e.preventDefault();
	let elm = e.target;
	let id = `#${elm.id}`;
	let name = `.${elm.classList.value.replace(' ', '.')}`;
	let parentClass = `.${elm.parentNode.classList.value.replace(' ', '.')}`;
	let selector = !!elm.id ? id : !!elm.className ? name : `${parentClass} ${elm.nodeName.toLowerCase()}`;
	chrome.runtime.sendMessage({type: 'gotElm', msg: selector, elm: scrapeElmType});
	return false;
}

window.onload = injectScript(chrome.extension.getURL('usi_script.js'), 'body');

document.addEventListener('usiEvent', function(e) {
	usiData = e.detail;
});
document.addEventListener('usiImages', function(e) {
	usiImages = e.detail;
});
document.addEventListener('usiSession', function(e) {
	usiSession = e.detail;
});
document.addEventListener('usiPixel', function(e) {
	usiPixel = e.detail;
});

document.addEventListener('usiDebug', function(e) {
	chrome.runtime.sendMessage({type: 'usiDebug', msg: e.detail.msg});
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	let addEvent = document.body.addEventListener;

	switch(message.type) {
		case 'startScrape':
			scrapeElmType = message.name;
			addEvent('mouseover', highlightElement, false);
			addEvent('click', getElementSelector, false);
			addEvent('mouseout', (e) => { 
				lastElm.style.backgroundColor = '';
			}, false);
			addEvent('contextmenu', getElementSelector, false);
			break;

		case 'getData':
			sendResponse(usiData);
			break;

		case 'getImages':
			sendResponse(usiImages);
			break;

		case 'getSession':
			sendResponse(usiSession);
			break;

		case 'getPixel':
			sendResponse(usiPixel);
			break;

		default:
			break;
	}
});