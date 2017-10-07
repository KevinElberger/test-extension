(function() {
	document.addEventListener('DOMContentLoaded', function() {
		let selector = document.getElementById('selector');
		let submit = document.getElementById('submit');

		submit.focus();

		chrome.runtime.getBackgroundPage(function(bgWindow) {
			selector.value = bgWindow.getSelector();
		});

		document.getElementById('cancel').addEventListener('click', () => {
			window.close();
		});

		document.forms[0].onsubmit = function(e) {
			e.preventDefault();
			chrome.runtime.getBackgroundPage(function(bgWindow) {
				bgWindow.updateScrapeProgress(selector.value);
				bgWindow.endScrape();
				window.close();
			});
		};
	});
})();