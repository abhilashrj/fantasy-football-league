var Begin = new Date();
var Start = Begin.getTime();
//code to attach trackevent code block for document downloads/external links/mailto links  
$(document).ready(function () {
    // Creating custom :external selector
    $.expr[':'].external = function (obj) {
        try {
            return !obj.href.match(/^javascript/) && (obj.hostname != location.hostname);
        } catch (e) {
            console.warn('unable to create custom :external selector in ga_extensions.js');
        }
    };

    // Add 'external' CSS class to all external links
    $('a:external').addClass('external');
    $('a.external').bind('click', function () {
        var obcat = this.href.match(/^mailto\:/);
        var targeturl = this.href;
        var End = new Date();
        var Stop = End.getTime();
        var timeElapse = Math.round((Stop - Start) / 1000);
        if (obcat) {
            targeturl = targeturl.replace('mailto:', '');
            _gaq.push(['_trackEvent', 'Mailto', targeturl, document.location.href, timeElapse, true]);
        } else {
        	_gaq.push(['_trackEvent', 'Outbound', targeturl, document.location.href, timeElapse, true]);
        }
    });
    
    // Check if logged in from Fantasy Box on PL.com homepage (adds ?t=1 to url)
    if (window.location.host.match(/^fantasy.premierleague.com$/) 
        && window.location.search.match(/t=1$/)) {
        var trackId = 0;
        if (typeof Base64 !== 'undefined') {
            try {
                userObject = $.parseJSON(Base64.decode($.cookie('pluser').substring(1, $.cookie('pluser').length-1)));
                trackId = userObject.user.id;
            } catch (e) {
                //console.warn('could not parse user cookie to track logged in state');
            }
        }
        _gaq.push(['_setCustomVar', 1, 'Authenticated', 'USER ID', trackId]);
        _gaq.push(['_trackEvent', 'authenticated', 'login state', 'loggedin']);
    }

    // Add tracking to ALL links
    $('a').bind('click', function () {
        var targetname = this.text;
        var targeturl = this.href;
        var isDoc = this.href.match(/\.(?:doc|eps|jpg|png|svg|xls|ppt|pdf|xls|zip|txt|vsd|vxd|js|css|rar|exe|wma|mov|avi|wmv|mp3)($|\&|\?)/);
        if (isDoc) {
            var End = new Date();
            var Stop = End.getTime();
            var timeElapse = Math.round((Stop - Start) / 1000);
            _gaq.push(['_trackEvent', 'Download', targetname, document.location.href, timeElapse, true]);
        }
    });
 
});