
var t2;
var t3;
var t4;

(function() {
    var mappings = JSON.parse(localStorage["nl.sjmulder.urlrewrite.mappings"] || "[]");
    mappings.push({
        "sourceUrl": "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js",
        "destinationUrl": "http://apps.bdimg.com/libs/jquery/1.7.1/jquery.min.js"
    });
    var sourceUrls = querySourceUrls(mappings);

    chrome.webRequest.onBeforeRequest.addListener(
        function(details) {
            var destinationUrl = queryDestinationUrl(mappings, details.url);
            return {redirectUrl : destinationUrl};
        },
        {urls: sourceUrls},
        ["blocking"]);
})();
function querySourceUrls(mappings) {
	var sourceUrls = [];
	for (var i = 0; i < mappings.length; i++) {
		sourceUrls[i] = mappings[i].sourceUrl;
	}
	return sourceUrls;
}
function queryDestinationUrl(mappings, destinationUrl) {
	for (var i = 0; i < mappings.length; i++) {
		if (mappings[i].sourceUrl == destinationUrl) {
			return mappings[i].destinationUrl;
		}
	}
	return destinationUrl;
}
