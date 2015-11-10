/* Author: ISM Fantasy Games Ltd
*/

var ISMMP = function($) {
    // While I search for a better way this to organise JS code ISMMP contains
    // functions which are used in the main ISM module but also require
    // monkey patching on other js files
    var elementListDisplayHeader = function(elType, elHeader, priceTitle,
                                            statTitle, statAbbr) {
        return(
            '<tr><th colspan="3"><a href="#' + elType +
            '" class="ismPositionLink">' + elHeader + '</a></th><th>' +
            priceTitle + '</th><th>' + '<abbr title="' + statTitle + '">' +
            statAbbr + '</abbr></th></tr>'
        );
    };

    var elementListDisplayRow = function(iconHtml, elId, nameWrapped, teamName,
                                         price, stat) {
        return(
            '<tr><td>' + iconHtml + '</td><td>' + ' <a href="#' + elId +
            '" class="ismAddElement">' + nameWrapped + '</a></td><td>' +
            teamName + '</td><td>' + price + '</td><td>' + stat + '</td></tr>'
        );
    };

    return {
        elementListDisplayHeader: elementListDisplayHeader,
        elementListDisplayRow: elementListDisplayRow
    };

}(jQuery);

var ISM = function($) {
    // Private variables
    var ismNode = document.getElementById('ism');
    var $ismNode = $(ismNode);
    var pageData = $('#ismJson').metadata({type: 'elem', name: 'script'});
    var tips = [];
    var squadValid = false;

    // Utility to look for extra options to add to dialog
    var extendDialogOptions = function($dialog, dialogOptions) {
        if ($dialog.data('zindex')) {
            dialogOptions.zIndex = $dialog.data('zindex');
        }
        if ($dialog.data('width')) {
            dialogOptions.width = $dialog.data('width');
        }
        if ($dialog.data('title')) {
            dialogOptions.title = $dialog.data('title');
        }
        return dialogOptions;
    };

    /*  We need a way to add this to all jquery ui objects rather than
        globally so not to  alter customer markup */
    // This is bad - I have removed it and we'll have it fix it
    //$('body').addClass('ism');

    // Set active tab class map. For My Team confirm button position
    var tabClassMap = {
        'ismGraphicalTab': 'ismGraphicalActive',
        'ismDataTab': 'ismDataActive'
    };

    var allClasses = '';
    for (var tab_id in tabClassMap) {
        if (tabClassMap.hasOwnProperty(tab_id)) {
            allClasses += (tabClassMap[tab_id] + ' ');
        }
    }

    var setActiveTab = function(event, ui) {
        if( tabClassMap[ui.tab.id] ) {
            var $parent = event.data.parent;
            $parent.removeClass(allClasses);
            $parent.addClass(tabClassMap[ui.tab.id]);
        }
    };

    $ismNode
        .on(
            'tabsselect',
            '.ismJsActiveTabs',
            { parent: $('#ismTeamForm') },
            setActiveTab
        )
    ;

    $('.ismTabs, .ismDialog .ismDialogContent').not('.ismLeagueDetail').tabs();

    var $tabs = $('.ismTabs');
    // Show the tabs now to prevent plain text flash on tab load
    $tabs.find('.ismTabsList').removeClass('ismHideContent');

    // we dont want to blanket bomb all selects on the site.
    // If you did want to target all of them, just uncomment this line.
    //$ismNode.find('select').addClass('ismSelectMenu');

    // set some defaults for the mega selects
    var theStyle = "dropdown";
    var theHandle = 27;
    var theWidth = 190;
    var theMenuWidth = 163;

    // loop through each select menu on the page
    $('select.ismSelectMenu').each(function() {
        // set the current select menu in the loop to variable
        var $this =$(this);
        /* set thisWidth to the value of the data-width attribute for the
            current select menu otherwise set it to the default (theWidth) */
        var thisWidth = $this.data('width') || theWidth;
        /* same as above but for menu width */
        var thisMenuWidth = $this.data('menu-width') || theMenuWidth;

        $this.selectmenu({
            width: thisWidth,
            handleWidth: theHandle,
            menuWidth: thisMenuWidth,
            style: theStyle
        });
    });

    $('.ismButton, .ism-js-btn, .ism-btn, .ismjs-button, .ism button, input:submit, input:reset, #ismReset', '.ism').button();
    $('a', '.buttons').click(function(event) { event.preventDefault(); });
    $( ".ismDateField" ).datepicker();

    // League admin accordian
    $("#ismAdministration").wijaccordion({
        header: 'h4',
        duration: 1000
    });

    // Fixtures drop downs
    $('.ismFixtureStatus a').click(function(event) {
        event.preventDefault();

       var infoBtn = $(this);
       var curRow = infoBtn.closest('tr');

       var statsRow = curRow.nextAll(".ismFixtureStats:first");
       var statsPane = statsRow.find('.ismFixtureOverview');

       if (infoBtn.hasClass('ismInfoClose')) {
           statsPane.slideUp('slow', function() {
               curRow.removeClass('ismStatsOpen');
               statsRow.removeClass('ismStatsRowOpen');
               curRow.nextUntil(".ismFixtureStats").removeClass('ismStatsOpen');
           });
           infoBtn.removeClass('ismInfoClose');
       }
       else {
           infoBtn.addClass("ismInfoClose");
           curRow.addClass('ismStatsOpen');
           statsRow.addClass('ismStatsRowOpen');
           curRow.nextUntil(".ismFixtureStats").addClass('ismStatsOpen');

           statsPane.slideDown('slow');
       }
    });

    // Fixture detail dialog
    $('.ismDetailLink').click( function(event) {
        event.preventDefault();
        var dialogTitle = $('.ismFixtureDetail h2').text();
        $('.ismFixtureDetail h2').hide();
        $('.ismFixtureDetail').dialog({
            modal: true,
            title: dialogTitle,
            width: 900,
            dialogClass: 'ism'
        });
    });

    // Tab help
    $('.ismHelpLink').unbind('click').bind('click', function(event) {
        var $helpDialog = $('.ismHelp');
        var $dialogTitleElement = $helpDialog.find('.ismHelpTitle');
        var dialogTitleText = $dialogTitleElement.text();
        $dialogTitleElement.hide();
        var dialogOptions = {
            title: dialogTitleText,
            width: 540,
            dialogClass: 'ism'
        };
        $helpDialog.dialog(extendDialogOptions($helpDialog, dialogOptions));
        event.preventDefault();
    });

    // show the next steps dialog on load to avoid FOUC
    var $nextSteps = $ismNode
        .find('#ismNextSteps')
        .addClass('hidden');

    // hide the heading because we're going to add it into the dialog header
    var nsHeading = $nextSteps
        .find('#ismNextStepsHeading')
        .addClass('hidden')
        .text();

    $nextSteps.dialog({
            dialogClass: 'ism',
            modal: true,
            title: nsHeading,
            width: 600,
            autoOpen: false,
            resizable: false
    });

    var nopopup = $nextSteps.data('nopopup');

    if (!nopopup || nopopup == 'True') {
        $nextSteps.removeClass('hidden');
        $nextSteps.dialog('open');
    }

    $('#ismNextStepsLink').unbind('click')
    .bind('click', function(event) {
        event.preventDefault();
        $nextSteps.removeClass('hidden');
        $nextSteps.dialog('open');
    });

    // already on My Team so just close the dialog
    $nextSteps
        .find('#ismPickTeamLink')
        .on('click', function(event) {
            event.preventDefault();
            $nextSteps.dialog('close');
        });

    // would be good to retire this in favour of toggleInfoBox
    // which is more generic
    var toggleStepDetail = function() {
        $(this)
            .closest('.ismEntryStep')
            .toggleClass('ismExpanded');
    };

    $nextSteps.on('click', '.ismStepHeading', toggleStepDetail);

    var toggleInfoBox = function() {
        $(this)
            .closest('#ism-info-box')
            .toggleClass('ism-expanded');
    };

    // info box
    $('#ism-info-box-h').on("click", toggleInfoBox);

    // Tooltip
    $('.ismTooltip, .ism-js-tooltip').wijtooltip();
    $('.wijmo-wijtooltip').wrap('<div class="ism">');
    $('body').on('click', '.ismTooltip, .ism-js-tooltip', function(e) {
        e.preventDefault();
    });

    // try and grab carousel start position
    var ismCarouselStartElement = $('#ismCarouselStartElement').attr('start');
    if (ismCarouselStartElement){

        // grab list index and add 1 as index() returns zero based but carousel required base 1
        var listItem = $('#ismCarousel #event_' + ismCarouselStartElement);
        ismCarouselStartElement = $('#ismCarousel .ismCarouselItem, #ismCarousel .ism-js-rn-item').index(listItem) + 1;

    }else{

        // we have nothing usable so just grab the first carousel item
        ismCarouselStartElement = 1;
    }

    // Round nav carousel
    $('#ismHide').removeClass('ismHide');
    $('#ismCarousel').jcarousel({
        wrap: 'circular',
        scroll: 1,
        start: ismCarouselStartElement
    });

    // dream team round nav carousel
    $('#ismDTRoundNav').jcarousel({
        wrap: 'circular',
        scroll: 1
    });

    // Here lies some code which should be usable for all carousels
    $ismNode.find('.ismJSCarousel').each(function() {
        var $carousel = $(this);
        var carOptions = {
            'wrap': $carousel.data('wrap') || 'circular',
            'scroll': $carousel.data('scroll') || 1,
            'start': $carousel.data('start') || 1
        };
        $carousel.jcarousel(carOptions);
    });

    // For drawing the kit
    var validShirtMask = function(mask) {
        if (mask.indexOf("/") === 0 ||
            mask.indexOf("http://cdn.ismfg.net/") === 0) {
          return true;
        }
        else {
            return false;
        }
    };
    var id_to_kit_bit_map = {
        'ismShirtColor': '#ismKitTheShirt, #ismKitShirtDetailMask',
        'ismSleevesColor': '#ismKitSleeves .ismColorSleeve',
        'ismShirtStripeColor': '#ismKitStripes .ismColorStripe',
        'ismShirtHoopColor': '#ismKitHoops .ismColorHoop',
        'ismShortsColor': '#ismKitTheShorts',
        'ismSocksColor': '#ismKitTheSocks',
        'ismSockHoopColor': '#ismSockHoops .ismColorHoop'
    };
    var blueprintString = $('#id_edit_entry_form-kit').val();
    var kitBlueprint;
    if (blueprintString) {
        try {
            kitBlueprint = JSON.parse(blueprintString);
        }
        catch (e) {
            kitBlueprint = undefined;
        }
        if (kitBlueprint) {
            // Now draw the kit
            for (var id in id_to_kit_bit_map) {
                kit_bit = id_to_kit_bit_map[id];
                if (id == 'ismShirtStripeColor' &&
                    kitBlueprint['ismShirtType'] != 'stripes') continue;
                if (id == 'ismShirtHoopColor' &&
                    kitBlueprint['ismShirtType'] != 'hoops') continue;
                if (id == 'ismSockHoopColor' &&
                    kitBlueprint['ismSockType'] != 'hoops') continue;
                $(kit_bit).css('background-color', ''+kitBlueprint[id]+'');
            }
            // Apply any mask
            if (kitBlueprint.ismShirtMask &&
                validShirtMask(kitBlueprint.ismShirtMask)) {
                $("#ismjs-kit-mask").attr("src", kitBlueprint.ismShirtMask);
            }
        }
    }

    // Pickup any Facebook share links

    if (typeof(FB) != 'undefined' && FB !== null) {
        $('.ismFacebookShare').click(function(obj) {

            share_title = $(this).data('name');
            description = $(this).data('description');
            caption = $(this).data('caption');
            picture = $(this).data('picture');

            // Request to be sent to the API ...
            var request = {
                method: 'feed',
                link: this.href,
                picture: picture,
                name: share_title,
                caption: caption,
                description: description
            };

            function callback(response) {
                if (response === null) {
                   // alert('Item not shared');
                }
            }

            // This sends request to the API
            FB.ui(request, callback);

            return false;
        });
    }

    // Grouping of stats
    var statsGroupChanger = function(event) {
        event.preventDefault();
        var $statTable = event.data.table;
        var $statHeaders = event.data.headers;
        var $statRows = $statTable.find('tr:gt(0)');

        // Loop through each stats category
        for (var i = 0; i < this.options.length; i++) {
            action = this.options[i].selected ? 'show' : 'hide';
            classToFind = this.options[i].value;
            // Loop through headers looking for matching class
            var headerCol = 0;
            $statHeaders.each(function(header_id) {
                headerCol += this.colSpan;
                var $th = $(this);
                // Found a stat category
                if ($th.hasClass(classToFind)) {
                    if (action === 'show') {
                        $th.show();
                    }
                    else {
                        $th.hide();
                    }
                    // Loop through rows
                    $statRows.each(function() {
                        var statCol = 0;
                        // Loop through cells
                        $(this).children().each(function() {
                            statCol += this.colSpan;
                            if (statCol === headerCol) {
                                if (action === 'show') {
                                    $(this).show();
                                }
                                else {
                                    $(this).hide();
                                }
                                return;
                            }
                        });
                    });
                    return;
                }
            });
        }
    };

    var makeStatsGrouper = function(select){
        var $select = $(select);

        var $statTable = $select.parents('.ismJsStatsGrouper').first().next();
        // First look for a sibling
        if (!$statTable.hasClass('ismJsStatsGrouped')) {
            var $statTable2 = $statTable.siblings('.ismJsStatsGrouped').first();
            if ($statTable2.length) {
                $statTable = $statTable2;
            }
            else {
                // Must be a child
                $statTable = $statTable.find('.ismJsStatsGrouped');
            }
        }
        var $statHeaders = $statTable.find('tr:eq(0) th');
        var data = {
            table: $statTable,
            headers: $statHeaders
        };
        $select.on('change', data, statsGroupChanger);
    };

    $('.ismJsStatsGrouper select').each(function() {
        makeStatsGrouper(this);
    });

    // Forms needing confirmation. The message is in data-confirm-message if
    // it begins with a # then we fetch it from the dom node
    var confirmSubmit = function(event) {
        var $this = $(event.target);
        var message = $this.data('confirm-message');
        var regexp = /#(\w+)/;
        var matches = regexp.exec(message);
        if (matches) {
            message = $('#'+matches[1]).text();
        }
        return ismConfirm($.trim(message));
    };
    $ismNode.find('.ismJsNeedConfirmation').on('submit', confirmSubmit);

    // Here starts the port of the old js ...

    // Object literal of actions for each page
    var actions = {
        '/squad-selection/' : function() {
            // If we have a noElements game (squads not released) return
            if (typeof(pageData.noElements) != 'undefined') return;
            squadInit();
            elementListInit();
        },
        '/my-team/' : function() {
            teamInit();
        },
        '/transfers/' : function() {
            squadInit();
            elementListInit();
        },
        '/rules/': function() {
            rulesInit();
        },
        '/my-leagues/': function() {
            myLeaguesInit();
        },
        '/my-profile/': function() {
            myProfileInit();
        }
    };

    // utility function used to open page help. We're defining it here so it
    // can be returned as part of the ISM object and unbound in other games
    // E.g. stop the help auto-opening on Squad Selection.
    var openHelp = function() {
        $('.ismHelpLink').trigger('click');
    };

    // Handle currency outputting
    var $currencyData = $('#ismCurrency');
    var currencyDivisor = $currencyData.data('divisor');
    var currencyDecimalPlaces = $currencyData.data('decimal-places');
    var currencySymbol = $currencyData.data('symbol');
    var currencyQuantityIdentifier = $currencyData.data('quantity-identifier');
    var currency = function(raw) {
        var currencyValue = raw / currencyDivisor;
        currencyValue = currencyValue.toFixed(currencyDecimalPlaces);

        if (currencyQuantityIdentifier) {
            return currencySymbol + currencyValue + currencyQuantityIdentifier;
        } else {
            return currencySymbol + currencyValue;
        }
    };
    // Stats ending with _cost are assumed to be currencies
    var currency_or_raw = function(raw, stat) {
        if (stat.substr(stat.length - 5) == '_cost' ||
            stat.substr(0, 5) == 'cost_') {
            return currency(raw);
        }
        else {
            return raw;
        }
    };

    // LEGACY DIALOG JS - used for old templates
    // Click dialog link to trigger the 'openDialog' custom event
    $ismNode.on('click', '.ismDialogLink', function(event) {
        event.preventDefault();
        $ismNode.trigger('showBasicDialog');
    });

    // Instantiate our basic dialog
    // Eventually this should be moved out of ism.js
    $ismNode.on('showBasicDialog', function() {
        // assign the dialog title to a variable so it can be customised
        var $dialogTitle = $('.ismBasicDialog h2');
        $dialogTitle.addClass('hidden');
        var dialogTitleText = $dialogTitle.text();
        $('.ismBasicDialog, .ism-js-dialog').dialog({
            title: dialogTitleText,
            width: 500,
            dialogClass: 'ism'
        });
    });
    // END LEGACY DIALOG JS

    // NEW DIALOG JS - use for all new templates
    var $dialog = $('.ism-js-dialog');

    // instantiate the dialog but don't open it until click event
    $dialog.dialog({
        addClass: 'ism',
        autoOpen: false,
        width: 500
    });

    // Wrap the dialog in an ism container because jQuery UI moved the markup
    $dialog
        .closest('.ui-dialog')
        .wrap('<div class="ism"></div>');

    // Trigger showDialog custom event when click event fires on link
    $ismNode.on('click', '.ism-js-dialog-link', function(event) {
        event.preventDefault();
        $ismNode.trigger('showDialog');
    });

    // open the dailog
    $ismNode.on('showDialog', function() {
        $dialog.dialog('open');
    });

    // Fixtures
    // Paginate using ajax
    $ismNode
        .find('.ismFixtureContainer').parent()
        .delegate('.ismPagination a', 'click', function(event) {
            event.preventDefault();
            $.ajax({
                url: this.href,
                dataType: 'html',
                context: this,
                success: function(data) {
                    $('#ismFixtureDetail').remove();
                    $(this).closest('.ismFixtureContainer').html(data);
                    $('#ismFixtureTable tr.ismFixture:even').addClass('ismEven');
                }
            });
        }
    );

    // Fixture module accordian
    // Row striping
    $('#ismFixtureTable tr.ismFixture:even').addClass('ismEven');

    $ismNode
        .find('.ismFixtureContainer').parent()
        .delegate('#ismFixtureTable tr.ismResult', 'click', function(event) {

            var showFixtureSummary = function($clickedRow) {
                $clickedRow.addClass('ismOpenFixture');
                var $clickedSummary = $clickedRow.next('tr.ismFixtureSummary');
                $clickedSummary
                    .find('.ismSummaryWrapper')
                    .slideDown('slow');
            };

            var hideFixtureSummary = function($clickedRow) {
                $clickedRow
                    .removeClass('ismOpenFixture')
                    .next('tr.ismFixtureSummary')
                    .find('.ismSummaryWrapper')
                    .slideUp('slow');
            };

            // if we don't have an open fixture yet
            if($('#ismFixtureTable').find('.ismOpenFixture').length === 0) {
                // just show the summary for the clicked fixture
                showFixtureSummary($(this));
            } else {
                // if the clicked fixture is the open fixture, hide it's summary
                if($(this).hasClass('ismOpenFixture')) {
                    hideFixtureSummary($(this));
                } else {
                    // Show the clicked fixture's summary
                    showFixtureSummary($(this));
                }
            }
        }
    );

    // Fixture stats dialog /////////////////////////////////////////
    var fixDialogOptions = {
        autoOpen: false,
        resizable: false,
        width: 750,
        height: 'auto',
        dialogClass: 'ism'
    };
    var $fixtureDialog = $('#ismFixtureStats');
    $fixtureDialog.dialog(extendDialogOptions($fixtureDialog,
        fixDialogOptions));

    $ismNode.delegate('.ismFixtureStatsLink', 'click', function(event) {
        event.preventDefault();
        var fixture_id = $(this).data('id');
        var fixtureUrl = '/fixture/' + fixture_id + '/';
        $fixtureDialog.find('div').load(fixtureUrl, function() {
            $fixtureDialog.find('.ismJsStatsGrouper select').each(function() {
                makeStatsGrouper(this);
            });
            $fixtureDialog.find('.ismJsStatsGrouper select').trigger('change');
            // Set title
            var $fixTitle = $('#ismFixtureDetailTitle');
            $fixtureDialog.dialog('option', 'title', $fixTitle.text());
            $fixTitle.hide();
            // Set home and away headings
            $fixtureDialog.find('.ismFixtureDetailTable').each(function() {
                var $this = $(this);
                var $caption = $this.find('caption');
                $this.find('th:first').text($caption.text());
                $caption.hide();
            });

            $fixtureDialog.dialog('open');
        });
    });

    // TextAreaLimit ///////////////////////////////////////////////
    $textLimit = $('.ismTextAreaLimit');
    if ($textLimit.length) {
            $textLimit.bind('keyup',function(event) {
            var remaining = 1000 - this.value.length;
            $('#ismCharactersRemaining').text(remaining);
        });
        $textLimit.trigger('keyup');
    }

    var showTip = function(tipId) {

        var $am = $('#ismJsAmTips');

        tip = tips[tipId];
        $am.find('.ism-speech p').html(tip.text);
        $am.find('.ismJsAmAction').off('click').on('click',
            tip.event_data, tip.handler).button('enable').removeClass('invisible');

        var nextTipHandler = function(event) {
            event.preventDefault();
            $(event.target).trigger('ismAmAction');
            showTip(event.data.nextTip);
        };
        var nextTip;
        if (tipId >= (tips.length - 1)) {
            nextTip = 0;
        }
        else {
            nextTip = tipId + 1;
        }
        if (tips.length > 1) {
            $am.find('.ismJsAmNext').off('click').on('click',
                {'nextTip': nextTip}, nextTipHandler).button('enable').removeClass('invisible');
        }
        else {
            $am.find('.ismJsAmNext').button('disable').addClass('invisible');
        }

    };

    // Set django CSRF value. Lifted straight from
    // https://docs.djangoproject.com/en/dev/ref/contrib/csrf/#ajax
    $ismNode.ajaxSend(function(event, xhr, settings) {
        function getCookie(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
        function sameOrigin(url) {
            // url could be relative or scheme relative or absolute
            var host = document.location.host; // host + port
            var protocol = document.location.protocol;
            var sr_origin = '//' + host;
            var origin = protocol + sr_origin;
            // Allow absolute or scheme relative URLs to same origin
            return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
                (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
                // or any other URL that isn't scheme relative or absolute i.e relative.
                !(/^(\/\/|http:|https:).*/.test(url));
        }
        function safeMethod(method) {
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        }
        if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        }
    });

    // Start of eiw functions. These are used by the element information
    // window (player popup)
    // eiwInit
    // eiwDraw
    // eiwImage

    var eiwInit = function() {

        // Delegate ismViewProfile clicks
        $ismNode.delegate('.ismViewProfile','click',function(event) {
            event.preventDefault();
            var regexp = /#(\d+)/;
            var matches = regexp.exec(this.href);

            var origtarget = this;
            var draw_callback = function(data) {
                eiwDraw(data, origtarget);
            };
            $.ajax({
                url: '/web/api/elements/' + matches[1] + '/',
                dataType: 'json',
                cache: false,
                success: draw_callback
            });
        });

        var $eiw = $('#ismEiw');
        var eiwOptions = {
            autoOpen: false,
            resizable: false,
            width: 750,
            dialogClass: 'ism'
        };
        $eiw.dialog(extendDialogOptions($eiw, eiwOptions));
        $eiw.find('.ismButton').button();

        // Watchlist button clicks
        $('#ismEiwWatchlist a').bind('click',function(event) {
            event.preventDefault();
            var url = this.href.replace('/0/','/'+$eiw.data('code')+'/');
            var action = this.id;
            $('#ismEiwWatchlist').find('.ismEiwWatchlistItem').hide();
            jqxhr = $.ajax({ url: url });
            jqxhr.success(function() {
                var wlShow = '';
                var wl = $eiw.data('wl');
                if (action == 'ismEiwWatchlistAdd') {
                    wl.push($eiw.data('id'));
                    wlShow = 'View';
                }
                else if (action == 'ismEiwWatchlistDel') {
                    wlShow = 'Add';
                    for (var i=0; i< wl.length; i++) {
                        if (wl[i] == $eiw.data('id')) {
                            wl.splice(i,1);
                            break;
                        }
                    }
                }
                $eiw.data('wl',wl);
                $('#ismEiwWatchlist'+wlShow).show();

               // If viewing WL reload
                if ($('#ismElementFilter').val() == 'watchlist') {
                    elementListGet();
                }
            });
        });

        // Take a copy of the watchlist as need to change
        $eiw.data('wl',pageData.watchlist);

        return $eiw;

    };


    var eiwDraw = function(data, origtarget) {
        var i, j;
        var title = data.first_name + ' ' + data.second_name + ' ' +
                    currency(data.now_cost);
        $eiw.dialog('option', 'title', title);

        // Trigger any reformatting listeners
        $eiw.trigger('ismEiwPlayerPrice');

        $('#ismEiwPosition').html(data.type_name);
        $('#ismEiwTeam').html(data.team_name);
        $('#ismEiwSelected').html(data.selected_by+'%');
        $('#ismEiwPrice').html(currency(data.now_cost));
        $('#ismEiwScore').html(data.total_points);
        $('#ismEiwThis').html(data.current_fixture);
        $('#ismEiwNext').html(data.next_fixture);
        $news = $('#ismEiwNews');
        if (data.news) {
            $news.html(data.news);
        } else {
            var noNews = $('#ismEiwNews').data('show-if-none');
            $news.html(noNews === undefined ? '' : noNews);
        }
        //$('#ismEiwNews').html(data.news);
        ISM.eiwImage(data,pageData);
        ISM.eiwExternalLinks(data);

        // Watchlist
        var wl = $eiw.data('wl');
        var wlSize = wl.length;
        var wlShow = 'Add';
        for (i=0; i<=wlSize; i++) {
            if (data.id == wl[i]) {
                wlShow = 'Del';
                break;
            }
        }
        $('#ismEiwWatchlist').find('.ismEiwWatchlistItem').hide();
        $('#ismEiwWatchlist'+wlShow).show();

        // Explain
        var explain = '';
        for (i=0; i<data.event_explain.length; i++) {
            explain += '<tr>';
            for (j=0; j<data.event_explain[i].length; j++) {
                explain += '<td>'+data.event_explain[i][j]+'</td>';
            }
            explain += '</tr>';
        }
        $('#ismEiwEventExplain tbody').html(explain);
        $('#ismEiwEventTotal').html(data.event_total);

        // History
        var past_summary = '';
        var future = '';
        for (i=0; i<data.fixture_history.summary.length; i++) {
            var fix_h = data.fixture_history.summary[i];
            future += '<tr><td>'+fix_h[0]+'</td><td>'+fix_h[1]+'</td><td>' +
                fix_h[2]+'</td></tr>';
        }
        if(future) {
            $('#ismEiwMatchesPastSummary tbody:eq(0)')
                .html(future).show();
            $('#ismEiwMatchesPastSummary tbody.ismJsShowIfNone').hide();
        } else {
            $('#ismEiwMatchesPastSummary tbody:eq(0)').hide();
            $('#ismEiwMatchesPastSummary tbody.ismJsShowIfNone').show();
        }

        var past_fixtures = '';
        var past_fixtures_totals = '';
        var totals = [];
        for (i=0; i<data.fixture_history.all.length; i++) {
            var statSize = data.fixture_history.all[i].length;
            past_fixtures += '<tr>';
            for (j=0; j<statSize; j++) {
                stat_value = statSize - 2;
                stat_transfers = statSize - 3;
                if (j == stat_value) {
                    past_fixtures +=
                        '<td>'+currency(data.fixture_history.all[i][j])+'</td>';
                }
                else {
                    // create the table cell
                    past_fixtures +=
                        '<td>'+data.fixture_history.all[i][j]+'</td>';
                }
                // First 3 cols are data, event and opponent
                var k = j - 3;
                if (k >= 0) {
                    if (typeof totals[k] === 'undefined') {
                        totals[k] = 0;
                    }
                    if (j == stat_value || j == stat_transfers) {
                        totals[k] = '';
                    }
                    else {
                        totals[k] += data.fixture_history.all[i][j];
                    }
                }
            }
            past_fixtures += '</tr>';
        }
        for (i = 0; i < totals.length; i++) {
            past_fixtures_totals += '<td>'+totals[i]+'</td>';
        }
        var past_seasons = '';
        for (i=data.season_history.length-1; i>=0; i--) {
            past_seasons += '<tr>';
            var seasonStatSize = data.season_history[i].length;
            for (j=0; j<seasonStatSize; j++) {
                if (j === 0)  {
                    past_seasons += '<td colspan="3">' +
                        data.season_history[i][j] + '</td>';
                }
                else if (j == (seasonStatSize-2)) {
                    // Blank row for transfers then value
                    past_seasons += '<td>&nbsp;</td>';
                    past_seasons += '<td>' +
                        currency(data.season_history[i][j])+'</td>';
                }
                else {
                    past_seasons += '<td>'+data.season_history[i][j]+'</td>';
                }
            }
            past_seasons += '</tr>';
        }

        var $pastBody = $('#ismEiwMatchesPast tbody.ismHistoryThisSeason');
        if (past_fixtures) {
            $pastBody.html(past_fixtures).show();
        }
        else {
            $pastBody.hide();
        }
        var $pastTotals = $('#ismEiwMatchesPast tbody.ismHistoryTotals');
        if (past_fixtures_totals) {
            var totals_row_header = $pastTotals.find('td.ismPointsTotal');
            totals_row_header.siblings().remove();
            totals_row_header.after(past_fixtures_totals);
            $pastTotals.show();
        }
        else {
            $pastTotals.hide();
        }
        var $pastSeasons = $('#ismEiwMatchesPast tbody.ismHistoryPastSeasons');
        if (past_seasons) {
            $pastSeasons.html(past_seasons).show();
        }
        else {
            $pastSeasons.hide();
        }

        // The bye text with translation
        var byetext = $eiw.data('byetext');
        if (!byetext) {
            byetext = '-';
        }

        // The bye text before translation as that's what appears in the JSON
        var srcbyetext = $eiw.data('srcbyetext');
        if (!srcbyetext) {
            srcbyetext = '-';
        }

        // Fixtures
        var fixture_summary = '';
        var fix;
        for (i=0; i<data.fixtures.summary.length; i++) {
            fix = data.fixtures.summary[i];
            if (fix[1] == srcbyetext) {
                fix[1] = byetext;
            }
            fixture_summary += '<tr><td>'+fix[0]+'</td><td>'+fix[1]+
            '</td><td>'+fix[2]+'</td></tr>';
        }
        if(fixture_summary) {
            $('#ismEiwMatchesFutureSummary tbody:eq(0)')
                .html(fixture_summary).show();
            $('#ismEiwMatchesFutureSummary tbody.ismJsShowIfNone').hide();
        } else {
            $('#ismEiwMatchesFutureSummary tbody:eq(0)').hide();
            $('#ismEiwMatchesFutureSummary tbody.ismJsShowIfNone').show();
        }

        future = '';
        for (i=0; i<data.fixtures.all.length; i++) {
            fix = data.fixtures.all[i];

            if (fix[2] == srcbyetext) {
                fix[2] = byetext;
            }

            future += '<tr><td>'+fix[0]+'</td><td>'+fix[1]+'</td><td>'+
            fix[2]+'</td></tr>';
        }
        $('#ismEiwMatchesFuture tbody').html(future);

        // UEFA links
        //$('#ismEiwUefaLinks a').attr('href',function() {
            //return this.href.replace(/player=(\d*)/,'player='+data.code);
        //});

        $eiw.data('id',data.id);
        $eiw.data('element_type_id',data.element_type);
        $eiw.data('code',data.code);
        $eiw.data('web_name', data.web_name);
        $eiw.find('.ismTabs').tabs("option", "selected", 0);
        $eiw.trigger('ismEiwDrawn', {'element_data':data, 'target':origtarget});
        $eiw.dialog('open');
        $eiw.find('.ismButton').blur();

    };

    var eiwImage = function(data,pageData) {

        var src = pageData.shirtDir + '/profile/shirt_' + data.team_id +
            '.' + pageData.shirtExt;

        var $img = $('<img/>')
            .attr({
                'src': src,
                'alt': data.team_name,
                'class': 'ismEiwImage'
            })
        ;

        $('#ismEiwImage').html($img);

    };

    // Some games have external links in the eiw - as default we don't return anything
    // this function is redeclared in local js files with proper href
    var eiwExternalLinks = function(data) {
        return;
    };
    var $eiw = eiwInit();

    // Now we have done the eiw we can handle the stats grouping selectors
    $ismNode.find('.ismJsStatsGrouper select').trigger('change');
    $eiw.bind('tabsshow', function(event, ui) {
        $(ui.panel).find('.ismJsStatsGrouper select').trigger('change');
    });


    // Start of elementList functions. These are used for manipulating
    // the element lists on squad-selection and transfers
    //   elementListInit
    //   elementListGet
    //   elementListDisplay

    var elementListInit = function() {

        $('#ismElementFilter').bind('change',function() {
            $('#ismMaxCost').val('');
            $('#ismElementDataTable').data('page',1);
            elementListGet();
        });

        $('#ismStatSort').bind('change',function() {
            $('#ismElementDataTable').data('page',1);
            elementListGet();
        });

        $('#ismMaxCost').bind('change',function() {
            $('#ismElementDataTable').data('page',1);
            elementListGet();
        });

        $('#ismElementDataTable').delegate('.ismAddElement','click',
        function(event) {
            var regexp = /#(\d+)/;
            var matches = regexp.exec(this.href);
            squadAddElement(matches[1]);
            event.preventDefault();
        });

        $('#ismElementDataTable').delegate('.ismPositionLink','click',
        function(event) {
            var regexp = /#(\d+)/;
            var matches = regexp.exec(this.href);
            var $elSel = $('#ismElementFilter');
            $elSel.val('et_'+matches[1]);
            if ($elSel.hasClass('ismSelectMenu')) {
                $elSel.selectmenu();
            }
            elementListGet();
            event.preventDefault();
        });

        // Pagination
        $('#ismElementDataTable').data('page',1);
        $("#ismElementPagination").wijpager({
            pageButtonCount: 3,
            mode: "numericFirstLast" ,
            pageIndexChanging: function(e, args) {
                $('#ismElementDataTable').data('page',args['newPageIndex']+1);
                elementListGet();
            }
        });

        // Add classes to view options
        $('#ismElementFilter option').each(function() {
            if (this.value.lastIndexOf('et_', 0) === 0) {
                $(this).addClass('ismOptionType');
            }
            else if (this.value.lastIndexOf('te_', 0) === 0) {
                $(this).addClass('ismOptionTeam');
            }
            else {
                $(this).addClass('ismOptionMisc');
            }
        });

        elementListGet();

    };

    var elementListGet = function() {

        var i;
        var elInfo = pageData.elInfo;
        var elStat = pageData.elStat;

        // Get values from drop downs
        var elementFilter = $('#ismElementFilter').val();
        var statSort = $('#ismStatSort').val();
        var maxCost = $('#ismMaxCost').val();

        // What out if, and what type of, filter we need to apply
        var filterType, filterValue;
        var watchlistMap = {};
        var showAll = false;

        var re = /^(et|te)_(\d+)$/;
        var matches = re.exec(elementFilter);
        if (matches && matches[1] == 'et') {
            filterType = 'type';
            filterValue = matches[2];
        }
        else if (matches && matches[1] == 'te') {
            filterType = 'team';
            filterValue = matches[2];
            showAll = true;
        }
        else if (elementFilter == 'watchlist') {
            filterType = 'watchlist';
            var wl = $eiw.data('wl');
            for (i=0; i< wl.length; i++) {
                watchlistMap[wl[i]] = 1;
            }
            showAll = true;
        }
        else if (elementFilter == 'dreamteam') {
            filterType = 'dreamteam';
            pageCount = 1;
            showAll = true;
        }
        else {
            filterType = 'all';
        }

        // Filter into tempElInfo
        var tempElInfo = [];
        var elSize = elInfo.length;
        for (i = 1; i < elSize; i++) {

            if (!elInfo[i]) continue;
            var el = elInfo[i];

            if (el[elStat['status']] == 'u') continue;

            if (maxCost && el[elStat['now_cost']] > maxCost) continue;

            if (filterType == 'type' &&
                    el[elStat['element_type_id']] != filterValue)
                continue;

            if (filterType == 'team' && el[elStat['team_id']] != filterValue)
                continue;

            if (filterType == 'watchlist' && !watchlistMap[i]) continue;

            if (filterType == 'dreamteam' && !el[elStat['in_dreamteam']])
                continue;

            tempElInfo.push(elInfo[i]);

        }

        // Sort based on statSort
        var sortCol = elStat[statSort];
        tempElInfo.sort(function(a,b) { return b[sortCol] - a[sortCol]; });

        // Show previous / next links as required
        if (showAll) {
            $("#ismElementPagination").hide();
            elementListDisplay(tempElInfo);
        }
        else {
            var page = $('#ismElementDataTable').data('page');
            var selectionPlayerLimit = pageData.selectionPlayerLimit;
            var pageOffset = (page - 1) * selectionPlayerLimit;
            $("#ismElementPagination").wijpager({
                pageCount: Math.ceil(tempElInfo.length / selectionPlayerLimit),
                pageIndex: page - 1
            }).show();
            // Display a splice of the Els
            elementListDisplay(
                tempElInfo.splice(pageOffset,selectionPlayerLimit));
        }

        // Handle price ranges - written in DOM as seems to be the best way
        // To manipulate select boxes
        var ismMaxCost = document.getElementById('ismMaxCost');
        var min, max;
        if (filterType == 'team') {
            min = pageData.minMax["te_"+filterValue].min;
            max = pageData.minMax["te_"+filterValue].max;
        }
        else if (filterType == 'type') {
            min = pageData.minMax["et_"+filterValue].min;
            max = pageData.minMax["et_"+filterValue].max;
        }
        else {
            min = pageData.minMax["all"].min;
            max = pageData.minMax["all"].max;
        }

        maxCostSelect = $('#ismMaxCost');
        if (min && max) {

            var thisOption = 1;
            ismMaxCost.options.length = thisOption;
            var current = max;
            while (current >= min) {
                var o = new Option();
                o.value = current;
                o.text = currency(current);
                if (maxCost == o.value) {o.selected = true;}
                ismMaxCost.options[thisOption++] = o;
                current -= pageData.selectionPriceGap;
            }
            if (maxCostSelect.hasClass('ismSelectMenu')) {
                maxCostSelect.selectmenu();
            }
            else {
                maxCostSelect.show();
            }
        }
        else {
            maxCostSelect.hide();
        }

    };

    var elementListDisplay = function(elInfo) {

        var i;
        var statSort = $('#ismStatSort').val();
        var elStat = pageData.elStat;
        var teamInfo = pageData.teamInfo;
        var typeInfo = pageData.typeInfo;

        // In case we are being asked to strip the currency sybmol or
        // quantity identifier
        var hideCurrencySymbol = pageData.elHideCurrencySymbol;
        var hideCurrencyQuantifier = pageData.elHideCurrencyQuantifier;
        var $currencyData = $('#ismCurrency');
        var currencySymbolRe = new RegExp("^" +
            $currencyData.data('symbol'));
        var currencyQuantifierRe = new RegExp(
            $currencyData.data('quantity_identifier') + '$');

        // What stat labels do we need
        var statTitle = $('#ismStatSort').find('option:selected').text();
        var statSplit = statTitle.split(" ");
        var statRe = /(\w)/;
        var statAbbr = '';
        for (i = 0; i < statSplit.length; i++) {
            var matches = statRe.exec(statSplit[i]);
            if (!matches) continue;
            statAbbr += matches[1].toUpperCase();
        }

        // Build seperate row fragments for each elementType
        var elTables = [];
        var elInfoSize = elInfo.length;
        var teamNameField = pageData.shortTeamNames ? 'short_name' : 'name';

        for (i = 0; i < elInfoSize; i++) {

            var el = elInfo[i];
            var elId = el[elStat['id']];
            var elType = el[elStat['element_type_id']];

            if (!elTables[elType]) {
                elTables[elType] = ISMMP.elementListDisplayHeader(elType,
                    typeInfo[elType]['plural_name'], pageData.txtPrice,
                    statTitle, statAbbr);
            }

            // Hide currency values if necessary
            var price = currency(el[elStat['now_cost']]);
            var stat = currency_or_raw(el[elStat[statSort]], statSort);
            if (hideCurrencySymbol) {
                if (typeof price === 'string') {
                    price = price.replace(currencySymbolRe, '');
                }
                if (typeof stat === 'string') {
                    stat = stat.replace(currencySymbolRe, '');
                }
            }
            if (hideCurrencyQuantifier) {
                if (typeof price === 'string') {
                    price = price.replace(currencyQuantifierRe, '');
                }
                if (typeof stat === 'string') {
                    stat = stat.replace(currencyQuantifierRe, '');
                }
            }
            elTables[el[elStat['element_type_id']]] +=
                ISMMP.elementListDisplayRow(iconInfo(elId), elId,
                    wrapText(el[elStat['web_name']],pageData.elementWrap),
                    teamInfo[el[elStat['team_id']]][teamNameField],
                    price, stat
                )
            ;

        }

        // Put fragments into one var and insert into DOM
        var elTable = '';
        for (i = 1; i <= pageData.numTypes; i++) {
            if (elTables[i]) elTable += elTables[i];
        }

        // GS changed the way this works for UEFA prototype

        $ismNode.trigger('elementListDisplayStart');

        $('#ismElementDataTable')
            .fadeOut('400', function() {
                $('#ismElementDataTable tbody').html(elTable);
            })
            .fadeIn('400');

        $ismNode.trigger('elementListDisplayFinish');

    };
    // End of elementList functions ////////////////////////////////////

    // Start of squad functions. These are used on pages where the
    // user is managing a squad - squad-selection and transfers
    //  squadInit
    //  squadAddElement
    //  squadOutElement
    //  squadDrawElement
    //  squadValidate
    //  squadAutocomplete
    //  squadFieldId
    //  squadPopulateTips

    var squadInit = function() {

        var i;
        $ismNode.delegate('.ismRemove','click',
        function(event) {
            var regexp = /#(\d+)/;
            var matches = regexp.exec(this.href);
            squadOutElement(matches[1]);
            event.preventDefault();
        });

        $ismNode.delegate('.ismStTypeHeader a','click',
        function(event) {
            var regexp = /et_(\d+)$/;
            var matches = regexp.exec(this.href);
            $('#ismElementFilter').val('et_'+matches[1]);
            elementListGet();
            event.preventDefault();
        });

        $('#ismAutocomplete, #ismEntrySteps li .ismAutocomplete, .ismJSautocomplete').bind('click',function(event) {
            squadAutocomplete();
            event.preventDefault();
            $(this).trigger('ismAutocomplete');
        });

        $('#ismReset').bind('click',function(event) {
            var i;
            if (pageData.mode == 'transfers') {
                for (i = 1; i <= pageData.squadSize; i++) {
                    $(squadFieldId(i,'element')).val(pageData.picks[i].elid);
                    squadDrawElement(i);
                }
            }
            else {
                for (i = 1; i <= pageData.squadSize; i++) {
                    $(squadFieldId(i,'element')).val(0);
                    squadDrawElement(i);
                }
            }
            squadValidate();
            event.preventDefault();
        });

        if (pageData.mode == 'transfers') {
            // Enable undo button or not
            if (pageData.transfersMade > 0 ) {
                $('#ismResetTransfers').button('enable');
            } else {
                $('#ismResetTransfers').button('disable').addClass('invisible');
            }

            var $undoTransfersDialog = $('.ismjs-undo-tf-dialog');

            $undoTransfersDialog.dialog({
                autoOpen: false,
                dialogClass: "ism",
                height: 350,
                width: 500
            });

            var showUndoTransfersDialog = function(event) {
                event.preventDefault();
                $undoTransfersDialog.dialog('open');
            };

            var closeUndoTransfersDialog = function(event) {
                event.preventDefault();
                $undoTransfersDialog.dialog('close');
            };

            $('.ismjs-undo-tf').on('click', showUndoTransfersDialog);
            $('.ismjs-undo-tf-cancel').on('click', closeUndoTransfersDialog);
        }

        var $submitButtons = $('#ismSubmit, .ismJSsubmit');
        $submitButtons.bind('click',function(event) {

            // if transfers then we need to do some pre submission processing
            if (pageData.mode == 'transfers') {

                // This will sort out the case where wildcard needs cancelling
                squadValidate();

                // loop through squad
                for (var i = 1; i <= pageData.squadSize; i++) {

                    // grab element
                    id = $(squadFieldId(i,'element')).val();

                    $pp = $(squadFieldId(i,'purchase_price'));
                    // if no transfers made then set the purchase price
                    // on untransferred elements to none
                    if (id == pageData.picks[i].elid) {
                        $pp.val('');
                    }
                    else {
                    // Otherwise the price of the new element
                        var el = pageData.elInfo[id];
                        $pp.val(el[pageData.elStat['now_cost']]);
                    }
                }
            }
        });

        for (i = 1; i <= pageData.squadSize; i++) {
            squadDrawElement(i);
        }

        $ismNode.delegate('.ismShirt, .ismJsShirt','click',
        function(event) {
            var matches;
            event.preventDefault();
            // trigger filterElements custom event for animations etc.
            $ismNode.trigger('filterElements');
            var rowClass = $(this).closest('.ismLine').attr('class');
            var elType;
            if (rowClass) {
                // Graphical view
                var rowRe = /ismPitchRow(\d+)/;
                matches = rowRe.exec(rowClass);
                if (matches) {
                    elType = matches[1];
                }
            }
            else {
                // Data view
                var rowId = $(this).closest('tr').attr('id');
                var regexp = /ismData(\d+)/;
                matches = regexp.exec(rowId);
                if (matches) {
                    var count = 1;
                    var numTypes = pageData.typeInfo.length - 1;
                    for (var i = 1; i <= numTypes; i++) {
                        count += pageData.maxTypes[i];
                        if (count > matches[1]) {
                            elType = i;
                            break;
                        }
                    }
                }
            }
            if (elType) {
                var $elSel = $('#ismElementFilter');
                $elSel.val("et_"+elType);
                $elSel.trigger('change');
                if ($elSel.hasClass('ismSelectMenu')) {
                    $elSel.selectmenu();
                }
            }
        });


        // Wildcard switch
        var wildcardHandler = function(event) {
            event.preventDefault();
            $(this).button('disable');
            _squadWildcardToggle();
            squadValidate();
        };
        $ismNode.find('.ismJsWcAction').on('click', wildcardHandler);

        $('.ismTacLink').click( function(event) {
            event.preventDefault();
            var dialogTitle = $('#ismTacDialog h3').text();
            $('#ismTacDialog h3').hide();
            $('#ismTacDialog').dialog({
                minWidth: 750,
                height: 450,
                title: dialogTitle,
                dialogClass: 'ism'
            });
            return false;
        });

        // Extra squad-selection validation
        if (pageData.mode == 'squad-selection') {
            var onlySpace = new RegExp(/^\s*$/);
            var validateName = function(event) {
                event.preventDefault();
                if(squadValid && !onlySpace.test(this.value)) {
                    $submitButtons.button('enable');
                }
                else {
                    $submitButtons.button('disable');
                }
            };
            $('#id_entry_form-name').bind('keyup', validateName);
            $('#id_entry_form-terms_agreed').bind('change', squadValidate);
        }

        squadValidate();

        // Open Help

        if (pageData.mode == 'squad-selection') {
            $(window).bind('load', openHelp);
        }
    };

    var squadAddElement = function(id) {

        var i;
        var elInfo = pageData.elInfo;
        var elStat = pageData.elStat;

        if (typeof elInfo[id] == 'undefined') return;
        var el = elInfo[id];
        if (el[elStat['status']] == 'u') return;

        var firstSpot; // First available spot for Element
        var alreadyChosen; // Boolean set if Element is already chosen
        var searchVal = pageData.mode == 'transfers' ? -1 : 0;

        // Where should we start and stop looking
        var elType = el[elStat['element_type_id']];
        var start = 1;
        var stop = 0;
        for (i = 1; i <= elType; i++) {
            if (i > 1) start += pageData.maxTypes[i - 1];
            stop += pageData.maxTypes[i];
        }

        for (i = start; i <= stop; i++) {
            var currentVal = $(squadFieldId(i,'element')).val();
            if (currentVal == searchVal && !firstSpot) {
                firstSpot = i;
            }
            else if (currentVal == id) {
                alreadyChosen = 1;
            }
        }

        if (alreadyChosen) {
            ismAlert(pageData.errAlreadyChosen.replace(/%%name%%/,
                el[elStat['web_name']]));
            return;
        }

        if (!firstSpot) {
            ismAlert(pageData.errAllSelected.replace(/%%position%%/,
                pageData.typeInfo[elType].plural_name));
            return;
        }

        // For transfer if we already have Element we should restore them in
        // that spot and set whoever is in their space to firstspot
        if (pageData.mode == 'transfers') {
            for (i = 1; i <= pageData.squadSize; i++) {
                if (pageData.picks[i].elid == id) {

                    // Who is in my way?
                    var inMyWay = $(squadFieldId(i,'element')).val();

                    // Reset
                    $(squadFieldId(i, 'element')).val(pageData.picks[i].elid);
                    squadDrawElement(i);

                    // If we have replaced a -1 version of same Element then
                    // replace with 0 - otherwise use inMyWay in the
                    // firstspot position
                    if (inMyWay == -1 && i == firstSpot) {
                        id = pageData.picks[i].elid;
                    }
                    else {
                        id = inMyWay;
                    }
                }
            }
        }

        $(squadFieldId(firstSpot,'element')).val(id);
        if (id) {
            $(squadFieldId(firstSpot,'purchase_price'))
                .val(el[elStat['now_cost']]);
        }

        squadDrawElement(firstSpot);

        squadValidate();
    };

    var squadOutElement = function(pos) {

        var newVal = 0;

        // newVal on transfers depends on the state of the row
        if (pageData.mode === 'transfers') {

            var $row = $('#ismData'+pos);
            if ($row.is('.ismDataRemoved')) { // Restore original
                newVal = pageData.picks[pos].elid;
            }
            else if ($row.is('.ismDataOriginal')) { // Make space
                // Don't allow player to be removed past limit without a wc
                if (pageData.transferType === 'limit' &&
                    _squadWildcardValue() !== 'True') {
                    var remaining = $('#ismTransfersRemaining').
                        data('remaining');
                    if (remaining <= 0) {
                        return;
                    }
                }
                newVal = -1;
            }
            else if ($row.is('.ismDataReplaced')) { // Make space
                newVal = -1;
            }
            else { // Should never happen
                alert('Unknown class ' + $row.attr('class'));
            }

        }

        $(squadFieldId(pos,'element')).val(newVal);
        squadDrawElement(pos);

        squadValidate();

    };

    var squadDrawElement = function(pos) {

        var $g = $('#ismGraphical'+pos);
        var $d = $('#ismData'+pos);
        var squadData = pageData.dataView;

        // The way we work out which id to draw is different for selection2
        // and transfers
        var id;
        if (pageData.mode == 'squad-selection') {
            id = $(squadFieldId(pos,'element')).val();
        }
        else if (pageData.mode == 'transfers') {
            var formId = $(squadFieldId(pos,'element')).val();
            if (formId == -1) {
                id = pageData.picks[pos].elid;
                $d.addClass('ismDataRemoved')
                    .removeClass('ismDataOriginal ismDataReplaced');
                $g.addClass('ismPitchElementRemoved')
                    .removeClass(
                    'ismPitchElementOriginal ismPitchElementReplaced');
            }
            else if (formId == pageData.picks[pos].elid) {
                id = pageData.picks[pos].elid;
                $d.addClass('ismDataOriginal')
                    .removeClass('ismDataRemoved ismDataReplaced');
                $g.addClass('ismPitchElementOriginal')
                    .removeClass(
                    'ismPitchElementRemoved ismPitchElementReplaced');
            }
            else {
                id = formId;
                $d.addClass('ismDataReplaced')
                    .removeClass('ismDataRemoved ismDataOriginal');
                $g.addClass('ismPitchElementReplaced')
                    .removeClass(
                    'ismPitchElementRemoved ismPitchElementOriginal');
            }
        }
        else {
            // Should never get here
            alert('Unknown mode ' + pageData.mode);
        }

        // Graphical view
        $g.find('.ismShirt').replaceWith(htmlFragment('sh:pitch',id,pos));
        $g.find('.ismRemove').replaceWith(htmlFragment('ic:out',id,pos));
        $g.find('.ismInfo').replaceWith(htmlFragment('ic:info',id,pos));
        $g.find('.ismDreamTeam').replaceWith(
            htmlFragment('ic:dreamteam',id,pos));
        $g.find('.ismPitchWebName').text(htmlFragment('el:web_name',id,pos));
        $g.find('.ismPitchStat').text(htmlFragment('el:'+pageData.pitchStat,
            id,pos));

        // Remove the Gdots (ask him) :-)
        if (id > 0) {
            $g.find('.ismElementDetail').show();
        }
        else {
            $g.find('.ismElementDetail').hide();
        }

        // Data view
        $d.find('td').each(function(i) {
            $(this).html(htmlFragment(squadData[i],id,pos));
        });

        // Fire event to enable games to make any changes
        var drawnEvent = $.Event('squadElementDrawn');
        drawnEvent.pos = pos;
        drawnEvent.elid = parseInt(id, 10);
        $ismNode.trigger(drawnEvent);

    };

    var squadValidate = function() {

        var i;
        var errors = [];
        var errorsTeam = []; // Teams we have too many players from

        var elInfo = pageData.elInfo;
        var elStat = pageData.elStat;

        var typeCount = [];
        var numTypes = pageData.typeInfo.length - 1;
        for (i = 1; i <= numTypes; i++) typeCount[i] = 0;

        var teamCount = [];
        var numTeams = pageData.teamInfo.length - 1;
        for (i = 1; i <= numTeams; i++) teamCount[i] = 0;

        var selectedNum = 0; // Number selected or number of transfers
        var proposedNum = 0; // Number in -1 state (transfers)
        var selectedMap = {};

        var spent = 0;
        var toSpend = pageData.toSpend;

        // We deal with a number of submit buttons
        // 1. PreSubmit buttons which mean that the picks are valid
        // 2. Submit button which may have extra validation (name etc.)
        // 3. Autocomplete buttons
        var $preSubmitButtons = $('.ismJSpreSubmit');
        var $submitButtons = $('#ismSubmit, .ismJSsubmit');
        var $autocompleteButtons = $('#ismAutocomplete, .ismJSautocomplete');

        // error dialog variables
        var rawErrorMsg = '';
        var warningMsg = '';
        var $panel = $('#ismPanel');

        for (i = 1; i <= pageData.squadSize; i++) {

            var id = parseInt($(squadFieldId(i,'element')).val(), 10);
            var alreadyHave = 0;

            // Special handling for transfers
            if (pageData.mode == 'transfers') {
                if (id == -1) { // Proposed to be replaced
                    proposedNum++;
                    toSpend += parseFloat(pageData.picks[i].sell);
                }else if (id == pageData.picks[i].elid) { // Original
                    alreadyHave = 1; // So we don't count as spent later
                }
                else { // Replaced
                    toSpend += parseFloat(pageData.picks[i].sell);
                }
            }

            if (id > 0) {

                var el = elInfo[id];

                // Selecting twice should be trapped but check anyway
                if (typeof selectedMap[id] == 'undefined') {
                    selectedMap[id] = 1;
                }
                else {
                    errors.push('elid ' + id + 'selected more than once');
                }

                if (el) {
                    if (!alreadyHave) {
                        spent += el[elStat['now_cost']];
                        selectedNum++;
                    }
                    typeCount[el[elStat['element_type_id']]]++;
                    teamCount[el[elStat['team_id']]]++;

                }
                else {
                    // Shouldn't be possible but check anyway
                    errors.push('Unknown elid ' + id);
                }

            }

        }

        var canAutocomplete = 0;

        // Are typeLimits met?
        for (i = 1; i <= numTypes; i++) {
            if (typeCount[i] != pageData.maxTypes[i]) {
                errors.push(pageData.errIncomplete);
                canAutocomplete = 1;
                break;
            }
        }

        // Add ET counter labels and data if there
        $('#ismTeamDisplayGraphical').find('.ismJsEtCounters')
            .each(function(i) {
                var $this = $(this);
                var $label = $this.find('.ismElementLabel');
                var $count = $this.find('.ismElementCount');
                $label.html(pageData.typeInfo[i+1].plural_name_short);
                $count.html(typeCount[i+1]+'/'+pageData.maxTypes[i+1]);
            });

        // Is teamLimit exceeded?
        for (i = 1; i <= numTeams; i++) {
            if (teamCount[i] > pageData.teamLimit) {
                errors.push(pageData.errTeam.replace(/%%team%%/,
                    pageData.teamInfo[i].name));
                errorsTeam.push(pageData.teamInfo[i].name);
                canAutocomplete = 0;
            }
        }


        // No transfers made
        if (pageData.mode == 'transfers' &&
            !selectedNum && !proposedNum) {
            //errors.push(pageData.errNone);
        }

        // Update bank value
        var bank = toSpend - spent;
        var $toSpend = $('#ismToSpend');
        var overBudget = bank * -1;
        var curOverBudget = currency(overBudget);


        $toSpend
            .data('rawToSpend',bank)
            .text(currency(bank));

        // Trigger any reformatting listeners
        $('#ismToSpend').trigger('ismToSpendUpdate');

        if (bank < 0) {
            $('#ismToSpend').addClass('ismToSpendError');
            errors.push('Budget');
            canAutocomplete = 0;

            // set rawErrorMsg to data attribute on the player list panel
            rawErrorMsg = $panel.data('errorBank');
            // if the attribute is defined in the template
            if(rawErrorMsg !== undefined) {
                // replace the marked string
                warningMsg = rawErrorMsg.replace('%%bank%%', curOverBudget);
            }

        }
        else {
            $('#ismToSpend').removeClass('ismToSpendError');
        }

        // Update number selected
        $('#ismNumSelected').text(selectedNum);
        $ismNode.find('.ismNumSelected').text(selectedNum);


        if (pageData.mode == 'transfers') {

            var left = pageData.transfersFree - pageData.transfersMade -
                    proposedNum - selectedNum;
            var $wildcardButtons = $ismNode.find('.ismJsWcAction');
            var $wildcardHelp;
            var wildcardValue;
            if ($wildcardButtons.length) {
                $wildcardHelp = $ismNode.find('.ismJsWcHelp');
                wildcardValue = _squadWildcardValue();
                if (wildcardValue === 'True') {
                    if (pageData.transferType === 'limit' && left > 0) {
                        _squadWildcardToggle();
                        wildcardValue = _squadWildcardValue();
                    }
                    else if (pageData.transferType === 'cost' && left >= 0) {
                        _squadWildcardToggle();
                        wildcardValue = _squadWildcardValue();
                    }
                }
            }

            var $remaining = $('#ismTransfersRemaining');
            var txt_unlimited = $remaining.data('txt-unlimited');

            if (pageData.transferType == 'cost') {
                var cost = 0;
                if (left < 0) {
                    cost = (-1 * left) * pageData.transferCost -
                        pageData.transferCosts;
                }
                var $transfersCost = $('#ismTransfersCost');
                var $freeTooltip = $('#ismFreeTransfersTooltip');

                if (wildcardValue === 'True') {
                    $('#ismResetTransfers').button('disable').addClass('invisible');
                    $remaining.html(txt_unlimited);
                    $transfersCost.html(0).parent().removeClass(
                        'ismToSpendError');
                    if ($freeTooltip.length) {
                        var txtWildcard = $freeTooltip.data('txt-wildcard');
                        if (txtWildcard) {
                            $freeTooltip.wijtooltip("option", "content",
                                txtWildcard);
                        }
                    }
                }
                else {
                    $remaining.html(left > 0 ? left : 0);
                    if (pageData.transfersMade > 0 ) {
                        $('#ismResetTransfers').button('enable').removeClass('invisible');
                    }

                    if ($freeTooltip.length) {
                        $freeTooltip.wijtooltip("option", "content",
                                $freeTooltip.attr('title'));
                    }
                    if (cost === 0) {
                        $transfersCost.html(-1 * cost).parent().removeClass(
                        'ismToSpendError');
                    }
                    else {
                        $transfersCost.html(-1 * cost).parent().addClass(
                            'ismToSpendError');
                    }
                }
                if ($wildcardButtons.length) {
                    if (wildcardValue === 'True') {
                        $wildcardButtons.each(function() {
                            var $this = $(this);
                            var label = $this.data('txt-cancel');
                            $this.button('option', 'label', label);
                            $(this).button('enable');
                        });
                        $wildcardHelp.each(function() {
                            var $this = $(this);
                            var tip = $this.data('txt-cancel-good');
                            $this.wijtooltip("option", "content", tip);
                        });
                    }
                    else if (cost > 0) {
                        $wildcardButtons.each(function() {
                            var $this = $(this);
                            var label = $this.data('txt-play');
                            $this.button('option', 'label', label);
                            $this.button('enable');
                        });
                        $wildcardHelp.each(function() {
                            var $this = $(this);
                            var tip = $this.data('txt-available-cost');
                            $this.wijtooltip("option", "content", tip);
                        });
                    }
                    else {
                        $wildcardButtons.each(function() {
                            var $this = $(this);
                            var label = $this.data('txt-play');
                            $this.button('option', 'label', label);
                            $(this).button('disable');
                        });
                        $wildcardHelp.each(function() {
                            var $this = $(this);
                            var tip = $this.data('txt-when-available-cost');
                            $this.wijtooltip("option", "content", tip);
                        });
                    }
                }
            }

            else if (pageData.transferType == 'limit') {
                $remaining.data('remaining', left);
                if (wildcardValue === 'True') {
                    $('#ismResetTransfers').button('disable').addClass('invisible');
                    $remaining.html(txt_unlimited).removeClass(
                        'ismToSpendError');
                }
                else if (left > 0) {
                    if (pageData.transfersMade > 0 ) {
                        $('#ismResetTransfers').button('enable').removeClass('invisible');
                    }
                    $remaining.html(left).removeClass('ismToSpendError');
                }
                else {
                    if (pageData.transfersMade > 0 ) {
                        $('#ismResetTransfers').button('enable').removeClass('invisible');
                    }
                    $remaining.html(left).addClass('ismToSpendError');
                }
                if ($wildcardButtons.length) {
                    if (wildcardValue === 'True') {
                        if (left >= 0) {
                            $wildcardButtons.each(function() {
                                var $this = $(this);
                                var label = $this.data('txt-cancel');
                                $this.button('option', 'label', label);
                                $(this).button('enable');
                            });
                            $wildcardHelp.each(function() {
                                var $this = $(this);
                                var tip = $this.data('txt-cancel-good');
                                $this.wijtooltip("option", "content", tip);
                            });
                        }
                        else {
                            $wildcardButtons.each(function() {
                                var $this = $(this);
                                var label = $this.data('txt-cancel');
                                $this.button('option', 'label', label);
                                $(this).button('disable');
                            });
                            $wildcardHelp.each(function() {
                                var $this = $(this);
                                var tip = $this.data('txt-cancel-bad');
                                tip = tip.replace('%%number%%', -1 * left);
                                $this.wijtooltip("option", "content", tip);
                            });
                        }
                    }
                    else if (left <= 0) {
                        $wildcardButtons.each(function() {
                            var $this = $(this);
                            var label = $this.data('txt-play');
                            $this.button('option', 'label', label);
                            $this.button('enable');
                        });
                        $wildcardHelp.each(function() {
                            var $this = $(this);
                            var tip = $this.data('txt-available');
                            $this.wijtooltip("option", "content", tip);
                        });
                    }
                    else {
                        $wildcardButtons.each(function() {
                            var $this = $(this);
                            var label = $this.data('txt-play');
                            $this.button('option', 'label', label);
                            $(this).button('disable');
                        });
                        $wildcardHelp.each(function() {
                            var $this = $(this);
                            var tip = $this.data('txt-when-available');
                            $this.wijtooltip("option", "content", tip);
                        });
                    }
                }
                // Really you shouldn't get to this state but left in
                // as a safety belt
                if (left < 0 && wildcardValue !== "True") {
                    errors.push('Too many transfers');
                }
            }
        }

        // Enable reset button or not
        if (selectedNum > 0 || proposedNum > 0) {
            $('#ismReset').button('enable');
        } else {
            $('#ismReset').button('disable');
        }

        // We can assign a default tip by setting it in this variable,
        var defaultTip = '';
        // Manage callback and buttons
        if (!errors.length && selectedNum) {
            $preSubmitButtons.button('enable');
            $submitButtons.button('enable');
            $autocompleteButtons.button('disable');
            squadValid = true;
            $('#ismSquadAutocomplete').hide();
            $('#ismSquadInitial').hide();
            $('#ismErrorsTeam').hide();
            $('#ismSquadEnter').show();
            $('#ismSquadEnter li').each(function(i) {
                defaultTip += ($(this).text() + '<br/>');
            });
        }
        else {
            $preSubmitButtons.button('disable');
            $submitButtons.button('disable');
            squadValid = false;
            $('#ismSquadInitial').show();
            $('#ismSquadEnter').hide();
            if (canAutocomplete) {
                $autocompleteButtons.button('enable');
                $('#ismErrorsTeam').hide();
            }
            else {
                $autocompleteButtons.button('disable');
                if (pageData.mode == 'transfers' &&
                   !(proposedNum || selectedNum) ) {
                    $('#ismSquadError').hide();
                    $('#ismSquadInitial').show();
                }
                if (errorsTeam.length) {
                    $('#ismErrorsTeam').show();
                    var errorsTeamList = errorsTeam.join(', ');
                    $('#ismErrorsTeamList, .ismJsErrorsTeamList').html(errorsTeamList);
                    defaultTip = $('#ismErrorsTeam').text() + '<br />';

                    // set rawErrorMsg to data attribute on the player list panel
                    rawErrorMsg = $panel.data('errorTeam');
                    // if the attribute is defined in the template
                    if(rawErrorMsg !== undefined) {
                        // replace the marked string
                        warningMsg = rawErrorMsg.replace('%%teamList%%', errorsTeamList);
                    }
                }
                else {
                    $('#ismErrorsTeam').hide();
                }

                $toSpend = $('#ismToSpend');
                if ($toSpend.hasClass('ismToSpendError')) {
                    defaultTip +=
                            ($toSpend.prev().text() + ': ' + $toSpend.text());
                }
            }
        }

        // Populate assistant manager tips if we have them
        var $am = $('#ismJsAmTips');
        if ($am.length) {
            if (pageData.mode == 'transfers' &&
                !defaultTip &&!selectedNum && !proposedNum) {
                defaultTip = $am.data('tip-none');
            }
            squadPopulateTips(defaultTip);
        }

        // Populate error dialog and trigger custom event
        if (warningMsg) {
            $('#ismErrorMessage').text(warningMsg);
            $ismNode.trigger('showErrorDialog');
        }

        // Extra processing which could cause button not to be active
        var extraCompleted = true;
        if (pageData.mode == 'squad-selection') {
            if (!$('#id_entry_form-name').val()) {
                extraCompleted = false;
                // We don't set squadValid to false here as there is an
                // extra function which checks for a name and squadValid
                // on every keyup in the box
            }
            if (!$('#id_entry_form-terms_agreed:checked').length) {
                extraCompleted = false;
                squadValid = false;
            }
        }
        if (!extraCompleted) {
            $submitButtons.button('disable');
        }

    };

    var _squadWildcardValue = function() {
        return $('#id_transfers_form-wildcard').val();
    };
    var _squadWildcardToggle = function() {
        var $wcHidden = $('#id_transfers_form-wildcard');
        val = $wcHidden.val();
        if (val === 'True') {
            $wcHidden.val("False");
        }
        else {
            $wcHidden.val("True");
        }
    };

    var squadAutocomplete = function(noChange) {

        // Opportunity to make some additions to squad before autocmomplete
        ISM.squadPreAutocomplete();

        // If true is passed to the function then an array of suggested
        // changes (element_id) is returned rather that additions being made
        noChange = noChange ? true : false;
        var suggestions = [];

        // Localise variables
        var i;
        var j;
        var el;
        var elId;

        var elInfo = pageData.elInfo;
        var elStat = pageData.elStat;

        var typesNeeded = [];
        var elIdsByType = [];
        var elCosts = [];
        var numTypes = pageData.typeInfo.length - 1;
        for (i = 1; i <= numTypes; i++) {
            typesNeeded[i] = pageData.maxTypes[i];
            elIdsByType[i] = [];
            elCosts[i] = {
                'total' : 0,
                'count' : 0,
                'average' : 0,
                'weighted' : 0
            };
        }

        var numEls = elInfo.length - 1;
        for (i = 1; i<=numEls; i++) {

            if (typeof elInfo[i] == 'undefined') continue;

            el = elInfo[i];
            elType = el[elStat['element_type_id']];

            elIdsByType[elType].push(i);
            elCosts[elType]['total'] += el[elStat['now_cost']];
            elCosts[elType]['count'] ++;

        }

        var teamsSelected = [];
        var numTeams = pageData.teamInfo.length - 1;
        for (i = 1; i<= numTeams; i++) teamsSelected[i] = 0;

        var elementSelected = {};
        var positionSelected = [];
        var elementsNeeded = pageData.squadSize;

        // What do we have?
        for (i = 1; i <= pageData.squadSize; i++) {
            elId = parseInt($(squadFieldId(i,'element')).val(), 10);
            if (elId > 0) {
                el = elInfo[elId];
                elType = el[elStat['element_type_id']];
                typesNeeded[elType]--;
                teamsSelected[el[elStat['team_id']]]++;
                elementSelected[elId] = 1;
                positionSelected[i] =  1;
                elementsNeeded--;
            }
        }

        // Prepare data
        var toSpend = $('#ismToSpend').data('rawToSpend');
        var avgToSpend = 0;
        var sortCol1 = elStat['form'];
        var sortCol2 = elStat['now_cost'];

        var shuffle = function shuffle(array) {
            var tmp, current, top = array.length;
            if(top) while(--top) {
                current = Math.floor(Math.random() * (top + 1));
                tmp = array[current];
                array[current] = array[top];
                array[top] = tmp;
            }
            return array;
        };
        var sortFunction = function(a,b) {
                return (elInfo[b][sortCol1] - elInfo[a][sortCol1]) ||
                    (elInfo[b][sortCol2] - elInfo[a][sortCol2]);
        };
        for (i = 1; i<=numTypes; i++) {
            if (typesNeeded[i] === 0) continue;
            // Average costs
            elCosts[i].average = elCosts[i].total / elCosts[i].count;
            avgToSpend += typesNeeded[i] * elCosts[i].average;
            elIdsByType[i] = shuffle(elIdsByType[i]);
            // Sort list
            elIdsByType[i].sort(sortFunction);
        }

        for (i = 1; i<=numTypes; i++) {
            // Weighted
            elCosts[i].weighted = elCosts[i].average * (toSpend / avgToSpend);
        }

        // Get what we need
        var typeNeeded = 0;
        var adjust = 0;
        for (i = 1; i <= pageData.squadSize; i++) {
            if (positionSelected[i]) continue;
            // Find what type we need
            for (j = 1; j <= numTypes; j++) {
                if (typesNeeded[j] > 0){
                    typeNeeded = j;
                    break;
                }
            }
            var maxCost = (elCosts[typeNeeded].weighted + adjust);
            var elLength = elIdsByType[typeNeeded].length;
            for (j = 0; j < elLength; j++) {
                elId = elIdsByType[typeNeeded][j];
                if (elementSelected[elId]) continue;
                el = elInfo[elId];
                var teamId = el[elStat['team_id']];
                var typeId = el[elStat['element_type_id']];
                var nowCost = el[elStat['now_cost']];

                // Reasons why we can't choose this Element
                if (nowCost > toSpend) continue;
                if (nowCost > maxCost) continue;
                if (el[elStat['status']] != 'a') continue;
                if (teamsSelected[teamId] >= pageData.teamLimit) {
                    continue;
                }
                var chance_of_playing =
                    el[elStat['chance_of_playing_next_round']];
                if (chance_of_playing !== null && chance_of_playing < 1) {
                    continue;
                }

                // This is the one
                elementSelected[elId] = 1;
                teamsSelected[teamId]++;
                typesNeeded[typeId]--;
                toSpend -= nowCost;

                if (noChange) {
                    suggestions.push({'pos':i,'id':elId});
                }
                else {
                    squadAddElement(elId);
                }

                //adjust if we spent less than our maxCost
                adjust = (maxCost - nowCost);

                break;
            }
        }

        return suggestions;

    };

    var squadPreAutocomplete = function() {
    };

    var squadFieldId = function(pos,stub) {
        return '#id_pick_formset-'+(pos-1)+'-'+stub;
    };

    var squadPopulateTips = function(defaultTip) {

        tips = [];
        var $am = $('#ismJsAmTips');


        var i, el, elId, text, suggestions, pos;
        var elInfo = pageData.elInfo;
        var elStat = pageData.elStat;
        var typeInfo = pageData.typeInfo;
        var teamInfo = pageData.teamInfo;

        // To start with let's look for tips to add new players
        suggestions = squadAutocomplete(true);
        var addElementHandler = function(event) {
            event.preventDefault();
            squadAddElement(event.data.elId);
            $(event.target).trigger('ismAmAction');
        };
        var changeElementHandler = function(event) {
            event.preventDefault();
            squadOutElement(event.data.pos);
            squadAddElement(event.data.elId);
            $(event.target).trigger('ismAmAction');
        };
        for (i=0; i < suggestions.length; i++) {
            elId = suggestions[i]['id'];
            el = elInfo[elId];
            text = $am.data('tip-new');
            text = text.replace('::position::',
                typeInfo[el[elStat['element_type_id']]].singular_name);
            text = text.replace('::name::', el[elStat['web_name']]);
            text = text.replace('::team::',
                teamInfo[el[elStat['team_id']]].name);
            text = text.replace('::price::',
                currency(el[elStat['now_cost']]));
            tips.push({
                'text': text,
                'handler': addElementHandler,
                'event_data': {'elId': elId}
            });
        }
        if (tips.length) {
            $am.find('.ismJsAmAction').text($am.data('label-add'));
        }
        else  {
            // We don't have any empty spaces to fill so now look for
            // players with less than 50% chance of playing
            var havePossibleChange = false;
            var possibleChanges = {};
            var toSpend = $('#ismToSpend').data('rawToSpend');
            var originalToSpend = toSpend;
            for (i = 1; i <= pageData.squadSize; i++) {
                elId = parseInt($(squadFieldId(i,'element')).val(), 10);
                if (pageData.mode == 'transfers' &&
                    elId == pageData.picks[i].elid) {
                    elId = pageData.picks[i].elid;
                }
                if (elId > 0) {
                    el = elInfo[elId];
                    var chance_of_playing =
                        el[elStat['chance_of_playing_next_round']];
                    if (chance_of_playing !== null && chance_of_playing < 1) {
                        // Remove player and add to bank so we can use
                        // autocomplete. Store so we can restore after we have
                        // the data.
                        havePossibleChange = true;
                        possibleChanges[i] = elId;
                        $(squadFieldId(i,'element')).val(0);
                        // XXX - ON TRANSFERS WE WILL HAVE TO CONSIDER
                        // SELLING PRICE
                        toSpend += parseFloat(el[elStat['now_cost']]);
                    }
                }
            }
            if (havePossibleChange) {
                $('#ismToSpend').data('rawToSpend', toSpend);
                suggestions = squadAutocomplete(true);
                // Reset positions we removed to do the autocomplete
                $('#ismToSpend').data('rawToSpend', originalToSpend);
                for (pos in possibleChanges) {
                    if (possibleChanges.hasOwnProperty(pos)) {
                        $(squadFieldId(pos,'element')).val(
                            possibleChanges[pos]);
                    }
                }
                for (i=0; i < suggestions.length; i++) {
                    pos = suggestions[i]['pos'];
                    var el_out = elInfo[
                        parseInt($(squadFieldId(pos,'element')).val(), 10)];
                    var el_in = elInfo[suggestions[i]['id']];
                    text = $am.data('tip-replace');
                    text = text.replace('::current::',
                        el_out[elStat['web_name']]);
                    text = text.replace('::new::', el_in[elStat['web_name']]);
                    tips.push({
                        'text': text,
                        'handler': changeElementHandler,
                        'event_data': {
                            'pos': pos,
                            'elId': suggestions[i]['id']
                        }
                    });
                }
                $am.find('.ismJsAmAction').text($am.data('label-change'));
            }
        }

        if (!tips.length) {
            $am.find('.ism-speech p').html(defaultTip);
            $am.find('.ismJsAmAction').button('disable').addClass('invisible');
            $am.find('.ismJsAmNext').button('disable').addClass('invisible');
        }
        else {
            showTip(0);
        }
    };

    // End of squad functions ////////////////////////////////////

    // Start of team functions. These are used on pages where the
    // user is managing a team - myteam and substititions
    //   teamInit
    //   teamStartSubstitution
    //   teamStopSubstitution
    //   teamProcessSubstitution
    //   teamCaptainWriteOptions
    //   teamCaptainChange
    //   teamSubmit
    //   teamPopulateTips

    var team = []; // An array of jquery objects on team / subs pages
    var teamData = {}; // An object literal of data view objects keyed by id
    var teamSubActive = false; // Stores first element substituted
    var $capSel = $('#ismCptSelect'); // Captain select box
    var $vCapSel = $('#ismVCptSelect'); // Vice captain select box

    // Initialise a team
    var teamInit = function() {

        // Remove counters as only needed on squad pages
        $('#ismTeamDisplayGraphical').find('.ismJsEtCounters').remove();

        $ismNode.find('div.ismPitchElement').each(function(i) {

            var $this = $(this);
            var data = $this.metadata();
            var $thisData = $('#ismData'+data.id);

            // Only process elements who can take part in substitutions
            if (data.can_sub) {

                // Make shirt draggable
                $this.draggable({
                    delay: 0,
                    distance: 1,
                    handle: '.ismShirt',
                    helper: 'clone',
                    revert: 'invalid',
                    zIndex: 100,
                    start: teamStartSubstitution,
                    stop: teamStopSubstitution
                });

                // Potentially we can click on shirts which is a nicer
                // interface for touch screens. Comment out for now.
                //$this.find('.ismShirt')
                    //.removeClass('ismHide')
                    //.bind('click', $.proxy(teamStartSubstitution, this))
                //;

                // Show pitch sub icon; bind any click to start a substitution
                $this.find('.ismSub')
                    .removeClass('ismHide')
                    .bind('click', $.proxy(teamStartSubstitution, this))
                ;

                // Hide pitch subx icon; bind any click to stop a substitution
                $this.find('.ismSubx')
                    .addClass('ismHide')
                    .bind('click', teamStopSubstitution)
                ;

                // Show data sub icon; bind any click to start a substitution
                $thisData.delegate('.ismSub','click',
                        $.proxy(teamStartSubstitution, this))
                    .find('.ismSub').removeClass('ismHide');

                // Hide data subx icon; bind any click to stop a substitution
                $thisData.delegate('.ismSubX, .ismSubx','click', teamStopSubstitution)
                    .find('ismSubx').addClass('ismHide');

            }

            // Store captain and vice captain
            if (data.is_captain) {
                $capSel.data('curId',data.id);
                $capSel.data('curPos',data.pos);
            }
            else if (data.is_vice_captain) {
                $vCapSel.data('curId',data.id);
                $vCapSel.data('curPos',data.pos);
            }


            // Store the current value of sub and pos in data
            // This will change as the user manages their team
            $this.data('sub',data.sub);
            $this.data('pos',data.pos);
            // Speed up writing of captain lists
            web_name = $this.find('.ismPitchWebName').text();
            $this.data('web_name',web_name);

            // Cache pitch and data values for later use
            team[data.pos] = $this;
            teamData[data.id] = $('#ismData'+data.id);

        });

        // Store the number selected of each type in data
        // This will change as a user manages their team
        var typesSelected = [];
        for (var i = 1; i<= pageData.numTypes; i++) {
            typesSelected[i] = pageData.typeLimits[i].now;
        }
        $ismNode.data('typesSelected',typesSelected);

        // Handle captain changes
        $capSel.bind('change', {stub:'ismCaptain',other:$vCapSel},
                teamCaptainChange);
        $vCapSel.bind('change', {stub:'ismViceCaptain',other:$capSel},
                teamCaptainChange);

        // Write captain select
        $ismNode.on("ismWriteCaptainOptions", function() {
            teamCaptainWriteOptions($capSel);
            teamCaptainWriteOptions($vCapSel);
        });
        $ismNode.trigger("ismWriteCaptainOptions");

        // Handle submit. The data required by django is
        // populated here
        $('#ismTeamForm').bind('submit',teamSubmit);

        // Disable button
        $('#ismSave').button('disable');
        $ismNode.find('.ismJsSave').button('disable');

        // Populate assistant manager tips if we have them
        var $am = $('#ismJsAmTips');
        if ($am.length) {

            // set first_day attribute to help with advice in manager subs
            // games
            for (i=1; i<team.length; i++) {
                team[i].data('first_day',
                    pageData.firstDay[team[i].metadata().team]);
            }

            // re-populate tips when the user changes the team
            $ismNode.on("teamProcessSubstitution ismCaptainChange",
                teamPopulateTips);

            // Do we have a strategy?
            var strategy = $am.data('am-strategy');
            if (pageData.mode === 'subs' || strategy === undefined) {
                teamPopulateTips();
            }
            else {
                var $choice = $('#ismAmStrategy');
                var $tips = $('#ismAmTips');

                // Handle tab loads
                var changeStrategy = function(event, ui) {
                    var selStat = $(ui.tab).data('am-strategy');
                    $am.data('am-strategy', selStat);
                    teamPopulateTips();
                    $.ajax({
                        type: 'POST',
                        url: $am.data('update-url'),
                        data: {'strategy': selStat}
                    });
                };
                // Re-create the tabs with the first option unselected
                // Is there a better way to do this?
                $tips.tabs("destroy");
                $tips.tabs({"selected": -1});
                $tips.on('tabsselect', changeStrategy);

                if (strategy == -1) {

                    // Show the hands-on / hands-off choice
                    var showInitialTips = function(event) {
                        event.preventDefault();
                        var selStat = $(this).data('am-strategy');
                        $choice.addClass('hidden');
                        $tips.removeClass('hidden');
                        $tips.find('a[data-am-strategy='+selStat+']')
                            .trigger('click');
                    };
                    $('#ismHandsOn').on('click', showInitialTips);
                    $('#ismHandsOff').on('click', showInitialTips);
                    $choice.removeClass('hidden');

                }
                else {
                    $tips.removeClass('hidden');
                    $tips.find('a[data-am-strategy='+strategy+']')
                        .trigger('click');
                }
            }
        }

        // Tooltips
        //setupPlayedTooltip();

    };

    var _mark_as_possible = function($possible) {

        // Show as possible pitch target with class and icon
        $possible
            .addClass('ismSubTarget')
            .find('.ismSub').removeClass('ismHide');

        // Show as possible data target with icon
        teamData[$possible.metadata().id]
            .find('.ismSub').removeClass('ismHide');

        // Make a drop target
        $possible.droppable({
            drop: function(event,ui) {
                teamProcessSubstitution(ui.draggable,$(this));
            },
            hoverClass: 'ismDropHover',
            tolerance: 'pointer'
        });

    };

    // Passed a pitch element, return all the pitch elements which can be
    var _get_possibles = function($el) {

        var possibilities = [];
        var el_data = $el.metadata();
        if (pageData.mode == 'subs' && !el_data.can_sub) {
            return possibilities;
        }

        var change  = $el.data('pos');
        var starter = change <= pageData.playSize ? 1 : 0;
        var changeType = el_data.type;
        var i;
        var $possible;

        // If a sub (not a starter), sub priority can be changed
        // Sub priority can only be changed in my_team state
        if (!starter && pageData.mode == 'my_team') {

            for (i = (pageData.playSize + 1);
                 i <= pageData.squadSize; i++) {

                if (change == i) continue; // Same player

                $possible = team[i];

                // autosubByType means only can change if same type
                if (pageData.autosubByType &&
                        $possible.metadata().type != changeType)
                    continue;

                // Honour any locks for the sub type we are changing
                locks = pageData.subPositionsLocked[changeType];
                if (locks.length) {
                    if ($.inArray(i, locks) == -1) {
                        continue;
                    }
                }

                // Honour any locks for the sub type we are checking
                locks = pageData.subPositionsLocked[$possible.metadata().type];
                if (locks.length) {
                    if ($.inArray(i, locks) != -1) {
                        continue;
                    }
                }

                possibilities.push($possible);
            }

        }

        // Work out potential targets based on ElementType limits

        var typeLimit = pageData.typeLimits[changeType];
        var typesNow = $ismNode.data('typesSelected');
        var now = typesNow[changeType];

        // A sub can't be made
        if ( (typeLimit.minPlay == typeLimit.maxPlay) &&
           (typeLimit.minPlay == typeLimit.squad) ) {
            return possibilities;
        }
        var validTypes = []; // Array of valid types

        // Like for like starter
        if (starter) {
            if (typeLimit.minPlay == now) {
                validTypes[changeType] = 1;
            }
        }
        // Looking to bring a player off the bench like for like
        else if (typeLimit.maxPlay == now) {
            validTypes[changeType] = 1;
        }

        // Not like for like so we have to work out what types can be replaced
        if (!validTypes.length) {

            for (i = 1; i <= pageData.numTypes; i++) {

                var thisTL = pageData.typeLimits[i];
                var thisNow = typesNow[i];

                // Looking to replace starter
                if (starter) {

                    // Must be at least one of this type on the bench
                    if (thisTL.squad - thisNow < 1) continue;

                    // Swapping for a different types - need checks
                    if (changeType != i) {

                        // Starting miniumum of type out
                        if (now == typeLimit[changeType]) continue;

                        // Starting maximum of type in
                        if (thisTL.maxPlay == thisNow) continue;

                    }

                }
                // Looking to bring a player off the banch
                else {

                    // Must be at least one of type on pitch
                    if (!thisNow) continue;

                    // Removing type myst be a legal formation
                    if (changeType != i &&
                        thisTL.minPlay == thisNow) continue;

                }
                validTypes[i] = 1;
            }
        }

        // Process validTypes
        // If a sub we need to handle extra options for changing sub order
        var start, stop;
        if (starter) {
            start = pageData.playSize + 1;
            stop = pageData.squadSize;
        }
        else {
            start = 1;
            stop = pageData.playSize;
        }
        for (i=start; i<=stop; i++) {
            $possible = team[i];
            if (validTypes[$possible.metadata().type]) {
                if ($possible.metadata().can_sub) {
                    possibilities.push($possible);
                }
            }
        }

        return possibilities;

    };

    // Handle the start of a substitution
    var teamStartSubstitution = function(event) {
        var $this = $(this);
        var i;
        // Second click of the substitution icon so we try and process
        // a substitution
        // Also could do automatic swapping on click by checking the
        // if the number of .ismSubTarget is 1
        if (teamSubActive && event.type == 'click') {
            teamProcessSubstitution(teamSubActive,$this);
            return;
        }
        teamSubActive = $this;

        // Hide all sub icons on pitch and data view
        for (i=1; i <= pageData.squadSize; i++) {
            team[i].find('.ismSub').addClass('ismHide');
            teamData[team[i].metadata().id].find('.ismSub').addClass('ismHide');
        }
        // Show subx icon for active element
        $this.find('.ismSubx').removeClass('ismHide');
        teamData[$this.metadata().id].find('.ismSubx').removeClass('ismHide');


        var possibilities = _get_possibles($this);
        for (i=0; i < possibilities.length; i++) {
            _mark_as_possible(possibilities[i]);
        }


        // Only one possibility so do it - taken out as not good UI
        //if (possibilities.length == 1) {
            //teamProcessSubstitution($this, possibilities[0]);
        //}


        // trigger a custom event so we can handle custom behaviour for
        // other customers. E.g. UEFA bench animation.
        $(this).trigger('teamStartSubstitution');

    };

    // Handle the stopping of a substitution
    var teamStopSubstitution = function() {

        for (var i=1; i <= pageData.squadSize; i++) {
            team[i].removeClass('ismSubTarget').droppable('destroy');
            if (team[i].metadata().can_sub) {
                team[i].find('.ismSub').removeClass('ismHide');
                team[i].find('.ismSubx').addClass('ismHide');
                teamData[team[i].metadata().id]
                    .find('.ismSub').removeClass('ismHide');
                teamData[team[i].metadata().id]
                    .find('.ismSubx').addClass('ismHide');
            }
        }
        teamSubActive = false;

        // trigger a custom event so we can handle custom behaviour for
        // other customers. E.g. UEFA bench animation.
        $('#ismTeamDisplayGraphical').trigger('teamStopSubstitution');

    };

    // Two elements have been selected - process the substitution
    var teamProcessSubstitution = function($el1,$el2) {

        var el1Pos = $el1.data('pos');
        var el2Pos = $el2.data('pos');
        var e1t = $el1.metadata().type;
        var e2t = $el2.metadata().type;
        var i;

        // Sub order change or changes between elements of the same type are
        // straightforward
        if ( (el1Pos > pageData.playSize && el2Pos > pageData.playSize) ||
             (e1t === e2t) ) {

            // Swap pos data
            $el1.data('pos',el2Pos);
            $el2.data('pos',el1Pos);

            // Swap sub data
            el1Sub = $el1.data('sub');
            $el1.data('sub',$el2.data('sub'));
            $el2.data('sub',el1Sub);

            // Change array elements
            team[el1Pos] = $el2;
            team[el2Pos] = $el1;

        }
        else {

            // Changing elements of different type is a lot more
            // complex as involves a complete redraw
            //
            var $sta, $sub;
            if (el1Pos <= pageData.playSize && el2Pos > pageData.playSize) {
                $sta = $el1;
                $sub = $el2;
            }
            else if (el1Pos > pageData.playSize && el2Pos <= pageData.playSize) {
                $sta = $el2;
                $sub = $el1;
            }
            else {
                alert("Can't change 2 starters of different positions");
            }

            //log('Moving ' + $sta.data('pos') + ' to the bench for ' + $sub.data('pos'));

            var staPos = $sta.data('pos'), staMeta = $sta.metadata();
            var subPos = $sub.data('pos'), subMeta = $sub.metadata();

            // Need to set sub and pos values
            // Used to remove DOM row
            var oldSub = parseInt($sub.data('sub'), 10);
            var elCount = 1;
            var newTeam = [];
            var typesSelected = [];
            var lastType = 0;
            var subCount = 1;
            for (i = 1; i <= pageData.numTypes; i++) {
                typesSelected[i] = 0;
            }
            var placedSta = 0, placedSub = 0;

            for (i = 1; i <= pageData.squadSize; i++) {

                var $el = team[i];
                var elMeta = $el.metadata();

                if (!pageData.autoSubByType && elMeta.id == subMeta.id) {
                    $sta.data('sub',oldSub).data('pos',subPos);
                    newTeam[elCount] = $sta;
                    placedSta = 1;
                    elCount++;
                    continue;
                }
                // Ignore elements we are changing
                else if (elMeta.id == staMeta.id || elMeta.id == subMeta.id) {
                    continue;
                }

                // Put sub as starter. Place at beginning of type.
                if (!placedSub && (elMeta.type >= subMeta.type ||
                    i > pageData.playSize)) {
                    //log('Setting '+i+' as pos '+elCount+ ' sub 0');
                    $sub.data('pos',elCount).data('sub',0);
                    newTeam[elCount] = $sub;
                    typesSelected[subMeta.type]++;
                    placedSub = 1;
                    elCount++;
                }

                // Handle subs, a bit more work as sub will need to be set
                // If not autoSubByType then swap is handled above
                if (i > pageData.playSize && pageData.autoSubByType) {

                    //log(i + ' = ' + elMeta.type);
                    if (elMeta.type != lastType) {
                        subCount = 1;
                        lastType = elMeta.type;
                        if (!placedSta && elMeta.type >= staMeta.type) {
                            // Put starter as sub
                            $sta.data('pos',elCount).data('sub',subCount);
                            newTeam[elCount] = $sta;
                            //log('Setting pos '+elCount+ ' sub '+subCount);
                            placedSta = 1;
                            elCount++;
                            subCount++;
                        }
                    }
                    else {
                        subCount++;
                    }
                    $el.data('sub',subCount);
                    //log('Setting pos '+elCount+ ' sub '+subCount);
                }

                if (elCount <= pageData.playSize)
                    typesSelected[elMeta.type]++;

                $el.data('pos',elCount);
                newTeam[elCount] = $el;
                elCount++;

            }

            // Replaced starter is only one of last type so belongs at the end
            if (!placedSta) {
                newTeam[pageData.squadSize] = $sta;
                $sta.data('pos',elCount).data('sub',1);
            }

            team = newTeam;
            $ismNode.data('typesSelected',typesSelected);


        }

        // Draw pitch view
        var formation = $ismNode.data('typesSelected')
            .slice(1,pageData.numTypes+1).join('-');
        var grid = pageData.formations[formation];
        $ismNode.find('.ismPitchRow').each(function(rowCount) {
            $(this).children().each(function(cellCount) {
                if (grid[rowCount][cellCount]) {
                    var $el = team[grid[rowCount][cellCount]];
                    $(this).append($el);
                }
            });
        });
        // Draw data view
        var $dataEls = $('#ismDataElements');
        for (i = 1; i <= pageData.squadSize; i++) {
            var id = team[i].metadata().id;
            $dataEls.append(teamData[id]);
            if (i <= pageData.playSize) {
                teamData[id].removeClass('ismSubRow');
            }
            else {
                teamData[id].addClass('ismSubRow');
            }
        }

        // Store captain and vice captain now as the position may be
        // changed when the options are written
        var captain = $capSel.data('curPos');
        var vice_captain = $vCapSel.data('curPos');

        // Draw captains
        teamCaptainWriteOptions($capSel);
        teamCaptainWriteOptions($vCapSel);
        // If we have moved a captain or vice captain to the bench
        // then the other element should take over that role
        if (el1Pos == captain && $el1.data('pos') > pageData.playSize) {
            $capSel.val($el2.data('pos')).trigger('change');
            if ($capSel.hasClass('ismSelectMenu')) {
                $capSel.selectmenu();
            }
        }
        else if (el2Pos == captain && $el2.data('pos') > pageData.playSize) {
            $capSel.val($el1.data('pos')).trigger('change');
            if ($capSel.hasClass('ismSelectMenu')) {
                $capSel.selectmenu();
            }
        }
        else if (el1Pos == vice_captain && $el1.data('pos') > pageData.playSize) {
            $vCapSel.val($el2.data('pos')).trigger('change');
            if ($vCapSel.hasClass('ismSelectMenu')) {
                $vCapSel.selectmenu();
            }
        }
        else if (el2Pos == vice_captain && $el2.data('pos') > pageData.playSize) {
            $vCapSel.val($el1.data('pos')).trigger('change');
            if ($vCapSel.hasClass('ismSelectMenu')) {
                $vCapSel.selectmenu();
            }
        }

        $('#ismSave').button('enable');
        $ismNode.find('.ismJsSave').button('enable');
        $ismNode.find('.ismTeamSaved').hide();

        teamStopSubstitution(); // Return to pre sub state

        $ismNode.trigger('teamProcessSubstitution');

    };

    var teamCaptainWriteOptions = function($select) {
        if (!$select.length) {
            return;
        }
        var curId = $select.data('curId');
        var i, el, data, selected;
        // Substitutions, but captain can move and value stored is position!
        if ($select.is('input')) {
            for (i=1; i<=pageData.playSize; i++) {
                el = team[i];
                data = el.metadata();
                selected = (el.metadata().id == curId ? 'selected' : '');
                if (selected) {
                    $select.val(i);
                }
            }
        }
        else {
            $select.empty();
            for (i=1; i<=pageData.playSize; i++) {
                el = team[i];
                data = el.metadata();
                // Don't allow captain to be selected if they have played
                if (!data.is_captain &&
                        (typeof(data.played) != 'undefined' && data.played)) {
                    continue;
                }
                selected = (el.metadata().id == curId ? 'selected' : '');
                if (selected) {
                    // Captain can have moved position!
                    $select.data('curPos', i);
                }
                var option = '<option value="'+i+'"'+selected+' class="ism-option-bold">'+
                    teamCaptainLabel(el)+'</option>';
                $select.append(option);
            }
            if ($select.hasClass('ismSelectMenu')) {
                $select.selectmenu();
            }
        }
    };

    var teamCaptainLabel = function(el) {
        if (ISM && ISM.alternateCaptainLabel) {
            return ISM.alternateCaptainLabel(el);
        }
        else {
            return el.data('web_name');
        }
    };

    var teamCaptainChange = function(event) {
        var $this = $(this);
        var newCaptain = team[this.value];
        var $other = event.data.other;
        var stub = event.data.stub;
        var stubOn = stub + 'On';

        // Remove old captain
        $ismNode.find('.'+stubOn).removeClass(stubOn);

        // Add new captain
        newCaptain.find('.'+stub).addClass(stubOn);
        teamData[newCaptain.metadata().id].find('.'+stub).addClass(stubOn);

        // Selecting to be the other captain, so just switch
        if ($other.val() == this.value) {
            $other.val($this.data('curPos')).trigger('change');
            if ($other.hasClass('ismSelectMenu')) {
                $other.selectmenu();
            }
        }

        $this.data('curPos', newCaptain.data('pos'));
        $this.data('curId', newCaptain.metadata().id);
        $('#ismSave').button('enable');
        $ismNode.find('.ismJsSave').button('enable');
        $ismNode.find('.ismTeamSaved').hide();
        $this.trigger('ismCaptainChange');
    };

    var teamSubmitted = 0;
    var teamSubmit = function(event) {
        var captain = $capSel.val();
        var vice_captain = $vCapSel.val();
        for (var i=1; i<=pageData.squadSize; i++) {
            var pos = team[i].metadata().pos;
            $(squadFieldId(pos, 'position')).val(team[i].data('pos'));
            var cval = ( i == captain ? 'True' : 'False' );
            $(squadFieldId(pos, 'is_captain')).val(cval);
            var vval = ( i == vice_captain ? 'True' : 'False' );
            $(squadFieldId(pos, 'is_vice_captain')).val(vval);
        }
        $('#ismSave').button('disable');
        $ismNode.find('.ismJsSave').button('disable');
        if (teamSubmitted) return false;
        teamSubmitted = 1;
    };

    var teamPopulateTips = function() {

        tips = [];
        var $am = $('#ismJsAmTips');
        var i, j, possibles, sp, bp, text, pitch, bench, captain, best;

        var ep_next_desc = function(a, b) {
            return b.metadata().ep_next - a.metadata().ep_next;
        };
        var ep_next_asc = function(a, b) {
            return a.metadata().ep_next - b.metadata().ep_next;
        };
        var day_asc_ep_desc = function(a, b) {
            ep_key = pageData.mode === 'subs' ? 'ep_this' : 'ep_next';
            // We want nulls to appear last, not first
            var afd = a.data('first_day');
            var bfd = b.data('first_day');
            if (afd === null) {
                return 1;
            }
            else if (bfd === null) {
                return -1;
            }
            return (afd - bfd) || b.metadata()[ep_key] - a.metadata()[ep_key];
        };
        var day_desc_ep_asc = function(a, b) {
            ep_key = pageData.mode === 'subs' ? 'ep_this' : 'ep_next';
            // We want nulls to appear first, not last
            var afd = a.data('first_day');
            var bfd = b.data('first_day');
            if (afd === null) {
                return -1;
            }
            else if (bfd === null) {
                return 1;
            }
            return (bfd - afd) || a.metadata()[ep_key] - b.metadata()[ep_key];
        };

        var subHandler = function(event) {
            event.preventDefault();
            teamProcessSubstitution(event.data.el1, event.data.el2);
        };

        var capHandler = function(event) {
            event.preventDefault();
            $capSel.val(event.data.capPos).trigger('change');
        };

        var strategy = $am.data('am-strategy');
        if (strategy === 0) { // Hands on

            // Player on bench playing before starter or on same day and we
            // expect them to score more points
            bench = team.slice(pageData.playSize+1);
            bench.sort(day_asc_ep_desc);

            benchers_on1:
            for (i = 0; i < bench.length; i++) {
                bp = bench[i];
                bpData = bp.metadata();
                var bFirst = bp.data('first_day');
                // Not playing
                if (!bFirst) {
                    continue;
                }
                var bEp; // Expected points for this bench player
                var worstEp = 2; // Don't swap people who have +2 points
                var worstSp = null;
                if (pageData.mode === 'subs') {
                    bEp = bpData.played ? bpData.event_points : bpData.ep_this;
                }
                else {
                    bEp = bpData.ep_next;
                }
                possibles = _get_possibles(bp);
                if (possibles.length) {
                    // Possibles come in reverse day then points order
                    possibles.sort(day_desc_ep_asc);
                    for (j=0; j<possibles.length; j++) {
                        sp = possibles[j];
                        spData = sp.metadata();
                        if (sp.data('sub')) {
                            continue;
                        }
                        var sFirst = sp.data('first_day');
                        var sEp; // Expected points for starter
                        if (pageData.mode === 'subs') {
                            sEp = spData.played ? spData.event_points
                                                : spData.ep_this;
                        }
                        else {
                            sEp = spData.ep_next;
                        }

                        // Found a possible that either plays before our
                        // bench player or on the same day and expects more
                        // points. On my-team this means we can give up on
                        // subs we need to carry on searching for the worst
                        // scoring starter on < 2 points
                        if ( (sFirst && sFirst < bFirst) ||
                             (sFirst === bFirst && sEp >= bEp)
                        ) {
                            if (pageData.mode !== 'subs') {
                                continue benchers_on1;
                            }
                            else  {
                                // Move along, we think starter will
                                // score more or both havent't played and
                                // starter plays before
                                if (sEp >= bEp || (
                                        (!spData.played && !bpData.played) &&
                                        (sFirst < bFirst))) {
                                    continue;
                                }
                                else {
                                    // This is the worst one we've seen
                                    if (sEp < worstEp) {
                                        worstEp = sEp;
                                        worstSp = sp;
                                    }
                                    // Last one so change to the worstSp
                                    // if we have one
                                    if (j === (possibles.length - 1)) {
                                        if (worstSp !== null) {
                                            sp = worstSp;
                                        }
                                        else {
                                            continue;
                                        }
                                    }
                                    // Keep looking
                                    else {
                                        continue;
                                    }
                                }
                            }
                        }

                        // In subs mode we shouldn't be suggesting players
                        // who have played if their expected points is
                        // less than the current starter. This happens when
                        // you move a starter who has played to the bench.
                        if (bpData.played && sEp >= bEp) {
                            continue;
                        }

                        // played check is for subs mode when starters who have
                        // already played have peen placed on the bench
                        if (bFirst < sFirst && !bpData.played) {
                            text = $am.data('tip-on-before');
                            text = text.replace('::bp::',
                                bp
                                    .find('.ismPitchWebName')
                                    .text()
                                    .replace(/^\s+|\s+$/g, ""));
                            text = text.replace('::sp::',
                                sp
                                    .find('.ismPitchWebName')
                                    .text()
                                    .replace(/^\s+|\s+$/g, ""));
                            tips.push({
                                'text': text,
                                'handler': subHandler,
                                'event_data': {'el1': bp, 'el2': sp}
                            });
                        }
                        else {
                            text = $am.data('tip-off-better');
                            text = text.replace('::bp::',
                                bp
                                    .find('.ismPitchWebName')
                                    .text()
                                    .replace(/^\s+|\s+$/g, ""));
                            text = text.replace('::sp::',
                                sp
                                    .find('.ismPitchWebName')
                                    .text()
                                    .replace(/^\s+|\s+$/g, ""));
                            tips.push({
                                'text': text,
                                'handler': subHandler,
                                'event_data': {'el1': bp, 'el2': sp}
                            });
                        }
                        break benchers_on1;
                    }
                }
            }

            // Captain should on on earliest day with highest expected
            // points
            captain = team[$capSel.val()];
            pitch = team.slice(1,pageData.playSize+1);
            // For subs we need to remove those who have played as they can't
            // be captain
            if (pageData.mode === 'subs') {
                    choices = $.grep(pitch, function(e) {
                        return !e.metadata().played; });
                    best = choices.sort(day_asc_ep_desc)[0];
            }
            else {
                best = pitch.sort(day_asc_ep_desc)[0];
            }
            if (typeof best !== 'undefined') {
                var captFirst = captain.data('first_day');
                var cpData = captain.metadata();
                var captEp;
                if (pageData.mode === 'subs') {
                    captEp = cpData.played ? Math.max(cpData.event_points, 2)
                                           : cpData.ep_this;
                }
                else {
                    captEp = cpData.ep_next;
                }
                var bestFirst = best.data('first_day');
                // If not subs and suggestion plays after captain then we
                // are not interested
                if (pageData.mode === 'subs' || !captFirst ||
                        bestFirst <= captFirst) {

                    var bpData = best.metadata();
                    var bestEp;
                    if (pageData.mode === 'subs') {
                        bestEp = bpData.played ? bpData.event_points
                                               : bpData.ep_this;
                    }
                    else {
                        bestEp = bpData.ep_next;
                    }
                    if (bestFirst < captFirst) {
                        text = $am.data('tip-on-captain');
                        text = text.replace('::pl::',
                            best
                                .find('.ismPitchWebName')
                                .text()
                                .replace(/^\s+|\s+$/g, ""));
                        tips.push({
                            'text': text,
                            'handler': capHandler,
                            'event_data': {capPos: best.data('pos')}
                        });
                    }
                    else if (bestEp > captEp) {
                        text = $am.data('tip-off-captain');
                        text = text.replace('::pl::',
                            best
                                .find('.ismPitchWebName')
                                .text()
                                .replace(/^\s+|\s+$/g, ""));
                        tips.push({
                            'text': text,
                            'handler': capHandler,
                            'event_data': {capPos: best.data('pos')}
                        });
                    }
                }
            }
        }
        else if (strategy === 1) { // Hands off

            // Player on bench with higher expected points than a starter
            bench = team.slice(pageData.playSize+1);
            bench.sort(ep_next_desc);
            benchers:
            for (i = 0; i < bench.length; i++) {
                bp = bench[i];
                if (bp.metadata().ep_next > 0) {
                    possibles = _get_possibles(bp);
                    if (possibles.length) {
                        possibles.sort(ep_next_asc);
                        for (j=0; j<possibles.length; j++) {
                            sp = possibles[j];
                            if (sp.data('sub')) {
                                continue;
                            }
                            if (bp.metadata().ep_next > sp.metadata().ep_next) {
                                text = $am.data('tip-off-better');
                                text = text.replace('::bp::',
                                    bp
                                        .find('.ismPitchWebName')
                                        .text()
                                        .replace(/^\s+|\s+$/g, ""));
                                text = text.replace('::sp::',
                                    sp
                                        .find('.ismPitchWebName')
                                        .text()
                                        .replace(/^\s+|\s+$/g, ""));
                                tips.push({
                                    'text': text,
                                    'handler': subHandler,
                                    'event_data': {'el1': bp, 'el2': sp}
                                });
                                break benchers;
                            }
                        }
                    }
                }
            }
            // Captain not highest expected points
            captain = team[$capSel.val()];
            pitch = team.slice(1,pageData.playSize+1);
            best = pitch.sort(ep_next_desc)[0];
            if (best.metadata().ep_next > captain.metadata().ep_next) {
                text = $am.data('tip-off-captain');
                text = text.replace('::pl::',
                    best
                        .find('.ismPitchWebName')
                        .text()
                        .replace(/^\s+|\s+$/g, ""));
                tips.push({
                    'text': text,
                    'handler': capHandler,
                    'event_data': {capPos: best.data('pos')}
                });
            }

            // Bench set up in expected points order
            bench = team.slice(pageData.playSize+1);
            for (i = 0; i < bench.length; i++) {
                var el = bench[i];
                possibles = _get_possibles(el);
                if (possibles.length) {
                    possibles.sort(ep_next_desc);
                    other_benchers:
                    for (j=0; j<possibles.length; j++) {
                        bp = possibles[j];
                        if (bp.data('sub') < el.data('sub')) {
                            continue;
                        }
                        if (bp.metadata().ep_next > el.metadata().ep_next) {
                            text = $am.data('tip-off-order');
                            text = text.replace('::bp::',
                                bp
                                    .find('.ismPitchWebName')
                                    .text()
                                    .replace(/^\s+|\s+$/g, ""));
                            text = text.replace('::el::',
                                el
                                    .find('.ismPitchWebName')
                                    .text()
                                    .replace(/^\s+|\s+$/g, ""));
                            tips.push({
                                'text': text,
                                'handler': subHandler,
                                'event_data': {'el1': bp, 'el2': el}
                            });
                            break other_benchers;
                        }
                    }
                }
            }


        }

        if (tips.length) {
            showTip(0);
        }
        else {

            if ($('#ismSave').button('option', 'disabled')) {
                $am.find('.ism-speech p').html($am.data('tip-none'));
            }
            else {
                $am.find('.ism-speech p').html($am.data('tip-none-save'));
            }
            $am.find('.ismJsAmAction').button('disable').addClass('invisible');
            $am.find('.ismJsAmNext').button('disable').addClass('invisible');
        }


    };

    // End of team functions //////////////////////////////////////////

    // Start of rules functions ///////////////////////////////////////

    var rulesInit = function(event) {

        // Rules accordian
        var $ismrAccordian = $("#ismRules").wijaccordion({
            header: 'h2',
            //requireOpenedPane: false,
            duration: 1000
        });
        $ismrAccordian.delegate('a', 'click', function(event) {
            var regexp = /#_(\w+)/;
            var matches = regexp.exec(this.href);
            if (!matches) return;
            $ismrAccordian.find('h2').each(function(i) {
                if (this.id == matches[1]) {
                    $(this).trigger('click');
                    event.preventDefault();
                    return;
                }
            });
        });

        // Help page
        $('#ismHelp .ismAnswerWrapper').hide();
        var showMeTheAnswer = function(event) {
            var $this = $(event.target);
            if ($this.hasClass('ismQuestionActive')) {
                $this.removeClass('ismQuestionActive');
                $this.siblings('.ismAnswerWrapper').slideUp('fast');
            }
            else {
                $('#ismHelp .ismAnswerWrapper').hide();
                $('#ismHelp .ismQuestion').removeClass('ismQuestionActive');
                $this
                    .addClass('ismQuestionActive')
                    .siblings('.ismAnswerWrapper').slideDown('fast');
            }
        };
        var validateSupportForm = function(event) {
            var $form = $(event.target);
            var name = $form.find('input[name="ticket[name]"]').val();
            var email = $form.find('input[name="ticket[email]"]').val();
            var subject = $form.find('input[name="ticket[subject]"]').val();
            var message = $form.find('textarea[name="ticket[message]"]').val();
            if (!name || !email || !subject || !message ||
                    !/(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
                var error = $('#ismHelp .ismSupportForm').data('error');
                alert(error);
                event.preventDefault();
                event.stopPropagation();
            }
            else {
                $form.trigger("formValid");
            }
        };
        $('#ismHelp').on('click', '.ismQuestion', showMeTheAnswer);
        $('#ismHelp').on('submit', '.ismSupportForm form', validateSupportForm);

    };

/*    // Start of my-leagues functions ///////////////////////////////////////    */
    var myLeaguesInit = function(event) {

        // Form validation before submitting
        $('#ismCreateClassicLeague').delegate('form','submit',function(e) {
            if ($('#id_create_private_classic_league_form-name').val() === '') {
                e.preventDefault();
            }
        });
        $('#ismCreateH2HLeague').delegate('form','submit',function(e) {
            if ($('#id_create_private_h2h_league_form-name').val() === '') {
                e.preventDefault();
            }
        });
        $('#ismLeagueActions').find('.ismDisabled').on('click', function(event) {
            event.preventDefault();
        });
        // community league stuff
        $('.ismCLStartFilter').bind('change', function(event) {

            // hide all options filters
            $(this).find("option").each(function(index){
                hide_id = $(this).val();
                if (hide_id != '#'){
                    $('.ismCL' + hide_id + 'Options').hide();
                }
            });

            // empty and hide final selection filter
            $('.ismCLFinalOptions select')[0].options.length = 1;
            $('.ismCLFinalOptions').hide();

            // get selected option value
            var id = $(this).val();

            // reset and show the relevant options drop down
            $('#id_join_community_league_form-league_id').val('');
            $('.ismCL' + id + 'Options select').attr('selectedIndex', '-1').children("option:selected").removeAttr("selected");
            $('.ismCL' + id + 'Options').show();

        });

        $('.ismCLFinalFilter').bind('change', function(event) {

            // get selected option value and make sure its valid
            var id = $(this).val();
            id = id.replace(/[^\d_]/g,'');

            // Make AJAX call to get community leagues with this lookup id
            var jqxhr = $.ajax({
                url: '/web/api/community-leagues/' + id + '/',
                cache: false,
                type: 'GET'
            });

            // when data returned ok, display in new drop down
            jqxhr.success(function(data) {
                finalSelect = $('#id_final_options');
                if (data !== '' && typeof data != 'undefined') {

                    finalSelect[0].options.length = 1;

                    // loop through data and make some options
                    for(var i=0; i< data.length; i++){
                        var obj = data[i];
                        finalSelect.append(
                            $('<option class="ism-option-light ism-alpha ism-al-center"></option>').val(obj.id).html(obj.name));
                    }

                    // show the drop down
                    $('.ismCLFinalOptions').show();
                    if (finalSelect.hasClass('ismSelectMenu')) {
                        finalSelect.selectmenu();
                    }
                }
                else {
                    // no cigar so empty and hide
                    $('#id_join_community_league_form-league_id').val('');
                    finalSelect[0].options.length = 1;
                    $('.ismCLFinalOptions').hide();
                }
            });

        });

        // make final filter populate the community league form on change
        $('#id_final_options').bind('change', function(event) {
            var league_id = $(this).val();
            $('#id_join_community_league_form-league_id').val(league_id);
        });

        $('#ismJoinPrivateLeague').delegate('form','submit',function(e) {
            e.preventDefault();
            var $form = $(this);
            code = $form.find('input:text').val();
            if (code) {
                // Strip characters which have no chance of being in code
                code = code.replace(/[^\d-]/g,'');
                var jqxhr = $.ajax({
                    url: $form.attr('action'),
                    type: 'POST',
                    dataType: 'json',
                    data: $form.serialize()
                });

                var $errors = $('#ismJoinPrivateLeague').find('.ismError');
                $errors.hide();
                jqxhr.always(function(data) {
                    if (data.statusCode == 500) {

                        // clear ismError field of default error text
                        $errors.html('');

                        // loop through the errors returned and add to error text
                        for (var key in data.errors) {
                            if (data.errors.hasOwnProperty(key)) {
                                var errorList = data.errors[key];
                                for (var i=0; i<errorList.length; i++) {
                                    $errors.append(errorList[i]);
                                }
                            }
                        }

                        // show the error text
                        $errors.show();
                    }
                    else if (data.statusCode == 302) {
                        location.href = data['location'];
                    }
                });
            }
        });
        $('#ismJoinPublicLeagueChoose').bind('submit',function(e) {
            e.preventDefault();
            choice = $('input[name=ismJoinPublicLeagueType]:checked').val();
            if (choice) {
                $('#ismJoinPublic' + choice).trigger('submit');
            }
        });

        $('#ismLeagueActions .ismOpen').bind('click', function(event) {
            event.preventDefault();
            var $leagueAction = $($(this).attr('href'));
            $($leagueAction).slideDown('fast');
            $leagueAction.find('.ismClose').on('click', function(event) {
                event.preventDefault();
                $($leagueAction).slideUp('fast', function() {
                    $('#ismLeagueActionWrapper').find('.ismIsActive').removeClass('ismIsActive');
                });
            });
            $leagueAction.find('.ismWizard').wijwizard({navButtons: 'common'});
            $leagueAction.find('.wijmo-wijwizard-buttons a').addClass('ismButton ismGradient');
            $leagueAction.find('.ismWizard .wijmo-wijwizard-steps').attr('style', 'width: 100%;');

            // Internationalize the next and previous buttons.
            $leagueAction.find('.wijmo-wijwizard-buttons a span').each(function(i, obj) {
                if ($(obj).text() == 'next') {
                    t = $leagueAction.find('.ismWizard').data('next');
                    if (t) {
                        $(obj).text(t.toLowerCase());
                    }
                } else if ($(obj).text() == 'back') {
                    t = $leagueAction.find('.ismWizard').data('back');
                    if (t) {
                        $(obj).text(t.toLowerCase());
                    }
                }
            });

            if ($leagueAction.is('#ismRenewLeaguesDialog')) {
                $('#ismLeagueActionWrapper').append($($leagueAction));
                $('#ismLeagueActionWrapper').slideDown();
                $('#ismJoinLeagueDialog').fadeOut('fast', function() {
                    $('#ismRenewLeaguesDialog.ismSlide').fadeIn();
                });
                $('#ismCreateLeagueDialog').fadeOut('fast', function() {
                    $('#ismRenewLeaguesDialog.ismSlide').fadeIn();
                });
                $('#ismRenewLeaguesDialog.ismSlide').fadeIn();

                $('#ismLeagueActionWrapper').find('.ismIsActive').removeClass('ismIsActive');

                //$(this).parent().addClass('ismIsActive');

                $(this).parent().click(function() {
                    $(this).animate({
                        background: 'red'
                    }, 5000, function() {
                        $(this).addClass('ismIsActive');
                    });
                });
                var $next = $leagueAction.find('.ismButton').eq(1);
                var all_checked = function() {
                    // make sure an option for each league has been selected
                    var names = {};
                    $leagueAction.find('.ismWizard input:radio').each(
                    function() {
                        names[$(this).attr('name')] = true;
                    });

                    // count em
                    var count = 0;
                    $.each(names, function() {
                        count++;
                    });

                    // check we have the correct number of selections
                    if($leagueAction.find('.ismWizard input:radio:checked')
                            .length != count) {
                        // Must choose all
                        $next.addClass('ui-state-disabled')
                            .attr('aria-disabled','true');
                        return false;
                    }
                    $next.removeClass('ui-state-disabled')
                        .attr('aria-disabled','false');
                    return true;
                };
                $leagueAction.find('.ismWizard').wijwizard({
                    validating: all_checked,
                    show: function(e, ui) {
                        // reset lists
                        $('#ismLeagueRenewed').empty();
                        $('#ismLeagueDeleted').empty();
                        // add relevant leagues to relevant lists on confirmation page
                        var forms = {};
                        $leagueAction.find('.ismWizard input:radio:checked').each(
                        function() {
                            var name =  $('#' + $(this).attr('name') + '_name')
                                .html();
                            if ( $(this).val() == 'renew' ){
                                    $('<li>' + name + '</li>').appendTo(
                                    '#ismLeagueRenewed'
                                    );
                            }else if ( $(this).val() == 'delete' ){
                                $('<li>' + name + '</li>').appendTo(
                                    '#ismLeagueDeleted'
                                );
                            }

                            // check the length of the lists
                            var renew_size = $("#ismLeagueRenewed li").length;
                            var delete_size = $("#ismLeagueDeleted li").length;

                            // if the lists have no length hide the help text
                            if (renew_size > 0) {
                                $('#ismRenewRenew').removeClass('ismHide');
                            }else{
                                $('#ismRenewRenew').addClass('ismHide');
                            }
                            if (delete_size > 0) {
                                $('#ismRenewDelete').removeClass('ismHide');
                            }else{
                                $('#ismRenewDelete').addClass('ismHide');
                            }
                        });
                    }
                });
                $leagueAction.find('.ismWizard input:radio').bind('change',function() {
                    all_checked();
                    return true;
                });
                all_checked(); // Initial check
            }
            else if ($leagueAction.is('#ismCreateLeagueDialog')) {
                $('#ismLeagueActionWrapper').append($($leagueAction));
                $('#ismJoinLeagueDialog').fadeOut('fast', function() {
                    $('#ismCreateLeagueDialog.ismSlide').fadeIn();
                });
                $('#ismRenewLeaguesDialog').fadeOut('fast', function() {
                    $('#ismCreateLeagueDialog.ismSlide').fadeIn();
                });

                $('#ismLeagueActionWrapper').find('.ismIsActive').removeClass('ismIsActive');
                $(this).parent().addClass('ismIsActive');
                $leagueAction.find('.ismWizard').wijwizard({
                    validating: function (e, ui) {
                        $panel = $(ui.panel);
                        if (ui.index === 0) {
                            choice = $panel.find(
                                'input[name=ismChooseLeagueType]:checked'
                            ).val();
                            if (choice == 'classic') {
                                $('#ismCreateH2HLeague').hide();
                                $('#ismCreateClassicLeague').show();
                            }
                            else if (choice == 'h2h') {
                                $('#ismCreateH2HLeague').show();
                                $('#ismCreateClassicLeague').hide();
                            }
                            else {
                                e.preventDefault();
                            }
                        }
                        var button = $leagueAction.find('.ismButton').eq(1);
                        var wizardSubmit = $leagueAction.find('.ismWizardButton');
                        var wizardStep = $leagueAction.find('.wijmo-wijwizard-steps');

/*                        if(button.length > 0) {
                            $leagueAction.find('.ismWizard').wijwizard({navButtons: 'none'});

                        }*/
                    }

                });
            }
            else if ($leagueAction.is('#ismJoinLeagueDialog')) {
                $('#ismLeagueActionWrapper').append($($leagueAction));
                $('#ismCreateLeagueDialog').fadeOut('fast', function() {
                    $('#ismJoinLeagueDialog.ismSlide').fadeIn();
                });
                $('#ismRenewLeaguesDialog').fadeOut('fast', function() {
                    $('#ismJoinLeagueDialog.ismSlide').fadeIn();
                });

                $('#ismLeagueActionWrapper').find('.ismIsActive').removeClass('ismIsActive');
                $(this).parent().addClass('ismIsActive');
                $leagueAction.find('.ismWizard').wijwizard({
                    validating: function (e, ui) {
                        $panel = $(ui.panel);
                        if (ui.index === 0) {
                            choice = $panel.find(
                                'input[name=ismChooseJoinLeagueType]:checked'
                                ).val();
                            if (choice == 'private') {
                                $('#ismJoinPublicLeague').hide();
                                $('#ismJoinCommunityLeague').hide();
                                $('#ismJoinPrivateLeague')
                                    .find('.ismError').hide().end()
                                    .show()
                                ;
                            }
                            else if (choice == 'community') {
                                $('#ismJoinPrivateLeague').hide();
                                $('#ismJoinPublicLeague').hide();
                                $('#ismJoinCommunityLeague').show();
                            }
                            else if (choice == 'public') {
                                $('#ismJoinCommunityLeague').hide();
                                $('#ismJoinPrivateLeague').hide();
                                $('#ismJoinPublicLeague').show();
                            }
                            else {
                                e.preventDefault();
                            }
                        }
                    }
                });
            }

        });
    };
    // End of myleagues functions //////////////////////////////////////////

    // profile functions

    var myProfileInit = function(event) {

        // Setup kit designer
        $('#ismShirtStripeColorContainer, .ismKitStripes').hide();
        $('#ismShirtHoopColorContainer, .ismKitHoops').hide();
        $('#ismSockHoopColorContainer, .ismSockHoops').hide();

        // Change of shirt type
        $('#ismShirtType').bind('change',function() {
            var shirtType = this.value;
            if(shirtType == "plain") {
                $('#ismShirtStripeColorContainer, #ismShirtHoopColorContainer, .ismKitStripes, .ismKitHoops').hide();
            }
            else if(shirtType =="stripes") {
                    $('#ismShirtHoopColorContainer, #ismKitHoops').hide();
                    $('#ismShirtStripeColorContainer, #ismKitStripes').show();
            }
            else if (shirtType == 'hoops') {
                $('#ismShirtStripeColorContainer, #ismKitStripes').hide();
                $('#ismShirtHoopColorContainer, #ismKitHoops').show();
            }
        });

        // Change of sock type
        $('#ismSockType').bind('change', function() {
            var sockType = this.value;
            if(sockType == "plain") {
                $('#ismSockHoopColorContainer, #ismSockHoops').hide();
            }
            else if (sockType =="hoops") {
                $('#ismSockHoopColorContainer, #ismSockHoops').show();
            }
        });

        $('#ismKitDesigner').delegate('input','change',function() {
            kit_bit = id_to_kit_bit_map[this.id];
            if (kit_bit != 'undefined') {
                $(kit_bit).css('background-color', ''+this.value+'');
            }
        });

        // Change of sponsor mask
        $('#ismKitDesigner').delegate('#ismShirtMask','change',function() {
            $('#ismjs-kit-mask').attr("src", this.value);
        });

        // Make the labels behave as expected for the spans generated
        // by the colour picker
        $('#ismKitDesigner').delegate('label','click',function() {
            $(this).siblings('span').trigger('click');
        });

        // check to see if we have already selected colours
        if (kitBlueprint) {

            // update type drop downs
            $('#ismShirtType').val(kitBlueprint['ismShirtType'])
                .trigger('change');
            $('#ismSockType').val(kitBlueprint['ismSockType'])
                .trigger('change');
            for (var id in id_to_kit_bit_map) {
                $('#'+id).val(kitBlueprint[id]);
            }
            if (kitBlueprint['ismShirtMask']) {
                $('#ismShirtMask').val(kitBlueprint['ismShirtMask'])
                    .trigger('change');
            }

        }

        // handle kit designer changes malarky
        $('#ismUpdateProfileButton').click(function(e){

            e.preventDefault();

            // grab data we need from kit designer
            var ismShirtType = $('#ismShirtType').val();
            var ismSockType = $('#ismSockType').val();

            // colours
            var ismShirtColor = $('#ismShirtColor').val();
            var ismShirtHoopColor = $('#ismShirtHoopColor').val();
            var ismShirtStripeColor = $('#ismShirtStripeColor').val();
            var ismSleevesColor = $('#ismSleevesColor').val();
            var ismShortsColor = $('#ismShortsColor').val();
            var ismSocksColor = $('#ismSocksColor').val();
            var ismSockHoopColor = $('#ismSockHoopColor').val();
            var ismShirtMask =
                $('#ismShirtMask').length ? $('#ismShirtMask').val() : '';

            // create relevant json
            var kitBlueprint = {
                "ismShirtType" : ismShirtType,
                "ismSockType" : ismSockType,
                "ismShirtColor" : ismShirtColor,
                "ismSleevesColor" : ismSleevesColor,
                "ismShortsColor" : ismShortsColor,
                "ismSocksColor": ismSocksColor,
                'ismShirtHoopColor': ismShirtHoopColor,
                'ismShirtStripeColor': ismShirtStripeColor,
                'ismSockHoopColor': ismSockHoopColor,
                'ismShirtMask': ismShirtMask
            };

            // update the hidden kit field
            $('#id_edit_entry_form-kit').val(JSON.stringify(kitBlueprint));

            $('#ismUpdateProfileForm').trigger('submit');

        });

    };

    // end profile functions

    // Start of notes functions ///////////////////////////////////////

    $('#ismNotesLink').click(function(e){

        // prevent default action
        $('#ismNotesError').hide();
        e.preventDefault();

        // send AJAX call to notes web api
        var action = $('#playerNotesForm').attr('action');
        var jqxhr = $.ajax({
            url: action,
            cache: false,
            type: 'GET'
        });

        // when data returned ok, display in textarea
        jqxhr.success(function(data) {
            if (data !== '' && typeof data !== 'undefined') {
                $('#playerNotes').val(data);
                if ($textLimit.length) {
                    $textLimit.trigger('keyup'); // To set remaining
                }
            }
            else {
                $('#playerNotes').val('');
            }
        });

        // create dialog box
        var $dialogTitle = $('#ismNotes h2');
        $($dialogTitle).hide();
        var dialogOptions = {
            minWidth: 450,
            title: $dialogTitle.text(),
            dialogClass: 'ism'
        };
        var $notesDialog = $('#ismNotes');
        $notesDialog.dialog(extendDialogOptions($notesDialog, dialogOptions));
    });

    // handle saving of notes.
    $('#ismNotes input[type="submit"]').click(function(e){
        e.preventDefault();
        var notes = $('#playerNotes').val();
        var action = $('#playerNotesForm').attr('action');

        // call to web api to update player notes
        var jqxhr = $.ajax({
            url: action,
            type: 'PUT',
            dataType: 'json',
            data: {
                'notes': notes
            }
        });

        jqxhr.always(function(data) {
            if (data.statusCode == 200) {
                $('#ismNotes').dialog('close');
            }
            else if (data.statusCode == 400) {
                $('#ismNotesError').show();
                $('#ismNotesError').text(data.error[0]);
            }
        });
    });

    // End of notes functions //////////////////////////////////////////

    // Start of countdown timer function ///////////////////////////////////////

    // Countdown timer JS to go here when Mark can look at it

    // End of countdown timer functions //////////////////////////////////////////

    // Start of utility functions.
    var ismAlert = function(message) {
        alert(message);
    };

    var ismConfirm = function(message) {
        return confirm(message);
    };

    var wrapText = function(text,wrapAt) {

        var wrapForce = '-';
        var wrapStr = '-<br />';

        if (text.length <= wrapAt) return text;

        var textNew = '';
        var textWords = text.split(' ');
        for (var i=0; i<textWords.length; i++) {
            var word = textWords[i];
            if (word.length > wrapAt) {
                // Assumption that after splitting at hypen word will not
                // need further shortening
                if (word.indexOf(wrapForce) > -1) {
                    word.replace(wrapForce,wrapStr);
                }
                else {
                    var wordArray = word.split('');
                    var thisWordLength = wordArray.length;
                    word = '';
                    for (var j=0; j<thisWordLength; j++) {
                        if (j>0 && j<(thisWordLength-1) && j % wrapAt === 0)
                            word += wrapStr;
                        word += wordArray[j];
                    }
                }
            }
            textNew += (word + ' ');
        }
        return textNew;

    };

    var htmlFragment = function(key, id, pos) {

        // Makes life easier for us in doing boolean tests!
        id =  parseInt(id, 10);

        var regexp = /^(\w\w):(\w*)$/;
        var matches = regexp.exec(key);

        var elInfo = pageData.elInfo;
        var elStat = pageData.elStat;

        // Element stat
        if (matches[1] == 'el') {
            if (matches[2] == 'selling_price') {
                return pageData.picks[pos]['elid'] == id ?
                    currency(pageData.picks[pos]['sell']) :
                    currency(pageData.elInfo[id][elStat['now_cost']]);
            }
            else if (matches[2] == 'purchase_price') {
                return pageData.picks[pos]['elid'] == id ?
                    currency(pageData.picks[pos]['paid']) :
                    currency(pageData.elInfo[id][elStat['now_cost']]);
            }
            else {
                return id ? currency_or_raw(
                    elInfo[id][elStat[matches[2]]],
                    matches[2]
                ) : '';

            }
        }

        // Team stat
        else if (matches[1] == 'te') {
            return id ?
                pageData.teamInfo[elInfo[id][elStat['team_id']]][matches[2]]
                : '';
        }

        // Type stat
        else if (matches[1] == 'ty') {
            return id ?
                pageData.typeInfo
                [elInfo[id][elStat['element_type_id']]][matches[2]]
                : '';
        }

        // Icons
        else if (matches[1] == 'ic') {

            if (matches[2] == 'info') {
                return iconInfo(id);
            }
            else if (matches[2] == 'out') {
                return iconOut(id, pos);
            }
            else if (matches[2] == 'add') {
                return iconAdd(id);
            }
            else if (matches[2] == 'dreamteam') {
                return iconDreamteam(id);
            }

        }

        // Shirts
        else if (matches[1] == 'sh') {

            var teamId = 0;
            if (id) {
                var $row = $('#ismData'+pos);
                if ($row.is('.ismDataRemoved')) {
                    teamId = 0;
                }
                else {
                    teamId =
                        pageData.teamInfo[elInfo[id][elStat['team_id']]].id;
                }
            }

            if (matches[2] == 'data') {
                return shirtData(teamId,id);
            }
            else if (matches[2] == 'pitch') {
                return shirtPitch(teamId,id);
            }

        }

    };

    var iconInfo = function(id) {
        if (!id) return '<span class="ismInfo"></span>';
        var e = pageData.elInfo[id];
        var s = pageData.elStat;
        var type = '';
        if (e[s.status] == 'd') {
            type = 'poss';
            // Games which use doubtful and chance of playing_next_round also
            // have specific [i] icons. If you don't want this then we'll need
            // to add a setting
            if (e[s.chance_of_playing_next_round]) {
                copnr = e[s.chance_of_playing_next_round];
                if (copnr == 25 || copnr == 50 || copnr == 75) {
                    type += ('_' + copnr);
                }
            }
            else {
                type = 'poss';
            }
        }
        else if (e[s.status] == 'u' || e[s.news]) {
            type = 'warn';
        }

        return '<a href="#'+id+'" class="ismViewProfile ismInfo"><img src="' +
            pageData.iconDir + '/info' + type + '.' + pageData.iconExt +
            '" alt="i" title="' + pageData.txtViewPlayerInfo +
            '" /></a>';
    };

    var iconOut = function(id, pos) {
        if (!id) return '<span class="ismRemove"></span>';
        return '<a href="#'+pos+'" class="ismRemove"><img src="' +
            pageData.iconDir + '/out.' + pageData.iconExt + '" alt="' +
            pageData.txtOutElement + '" title="' + pageData.txtOutElement +
            '" /></a>';
    };

    var iconAdd = function(id) {
        if (!id) return '';
        return '<a href="#'+id+'" class="ismAddElement"><img src="' +
            pageData.iconDir + '/add.' + pageData.iconExt +
            '" alt="+" title="' +
            pageData.txtAddElement + '" /></a>';
    };

    var iconDreamteam = function(id) {
        if (!id) return '<span class="ismDreamTeam"></span>';
        var e = pageData.elInfo[id];
        var s = pageData.elStat;
        if (!e[s.in_dreamteam]) return '<span class="ismDreamTeam"></span>';

        return '<a href="/dreamteam/" class="ismDreamTeam"><img src="' +
            pageData.iconDir + '/dreamteam' + '.' + pageData.iconExt +
            '" alt="' + pageData.txtDreamteamElement +
            '" /></a>';
    };

    var shirtData = function(id, elid) {
        var team = pageData.teamInfo[id];
        var teamId = team ? team.id : 0;
        return '<img src="' + pageData.shirtDir + '/data_view/shirt_' + teamId +
            _shirt_extra(elid) + '.' + pageData.shirtExt + '" alt="' +
            (team ? team.name : '') + '" title="' + (team ? team.name : '') +
            '" class="ismJsShirt ismShirt ismShirtData ' +
            (teamId === 0 ? 'ismShirtZero'  : '') + '" />';
    };

    var shirtPitch = function(tid, elid) {
        var team = pageData.teamInfo[tid];
        var teamId = team ? team.id : 0;
        return '<img src="' + pageData.shirtDir + '/shirt_' + teamId +
            _shirt_extra(elid) + '.' + pageData.shirtExt + '" alt="' +
            (team ? team.name : '') + '" title="' + (team ? team.name : '') +
            '" class="ismJsShirt ismShirt ismShirtPitch ' +
            (teamId === 0 ? 'ismShirtZero'  : '') + '" />';
    };

    var _shirt_extra = function(elid) {
        if (elid) {
            et = pageData.elInfo[elid][pageData.elStat['element_type_id']];
            if (pageData.typeInfo[et]['shirt_specific']) {
                return '_' + et;
            }
        }
        return '';
    };

    // Run actions based on page name and contents of actions object literal
    var sPath = window.location.pathname;
    if (typeof actions[sPath] == 'function') {
        actions[sPath]();
    }
    // Special case. If the page mode is subs then we need to
    if (typeof pageData.mode !== 'undefined' && pageData.mode == 'subs') {
        teamInit();
    }


    return {
        // Declare which properties and methods are supposed to be public
        //  These things can be used and replaced by other JS
        eiwImage: eiwImage,
        $ismNode: $ismNode,
        openHelp: openHelp,
        eiwExternalLinks: eiwExternalLinks,
        currency: currency,
        squadDrawElement: squadDrawElement,
        pageData: pageData,
        squadPreAutocomplete: squadPreAutocomplete,
        squadFieldId: squadFieldId,
        squadAddElement: squadAddElement,
        team: team,
        teamProcessSubstitution: teamProcessSubstitution,
        $capSel: $capSel,
        $vCapSel: $vCapSel
    };


}(jQuery);

