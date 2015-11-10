var PLFPL = function($, ISM) {

    "use strict";

    // Login
    $("#ismPLLogin").bind("submit", function(event) {
        event.preventDefault();
        var $this = $(this);
        $this.find(".ismError").addClass("ismHide");
        var email = $this.find("input[name='email']").val();
        if (email.indexOf("@") == -1) {
            window.alert($("#ismEmailMessage").text());
            return;
        }
        var password = $this.find("input[name='password']").val();
        var data = {
            email: email,
            password: password
        };
        var jqxhr = window.jQuery.ajax({
            url: $this.attr("action"),
            dataType: "jsonp",
            data: data,
            timeout: 2000 // Errors won"t be trapped as we"re dealing with
                          // jsonp, so timeout is used to simulate errors
        });
        jqxhr.success(function() {
            window.location = "/accounts/login/";
        });
        jqxhr.error(function() {
            $this.find(".ismError").removeClass("ismHide");
        });
    });

    // Logout
    var userCookie = $.cookie("pluser");
    if (userCookie) {
        $(".siteutils li.login","#masthead").hide();
        $(".siteutils li.logout,.siteutils li.myaccount","#masthead").show();
    }
    // From 2010/11 season - leave in case we need to adapt it
    $("#ismSignOut,.ismSignOut").bind("click", function() {
        var options = {"path":"/"};
        $.cookie("sessionid", null, options);
        $.cookie("_ismgc", null, options);
        options.domain = ".premierleague.com";
        $.cookie("pluser", null, options );
    });

    // League admin accordian
    $("#ismAdministration").wijaccordion({
        header: "h2",
        duration: 1000
    });

    // Player photos
    window.ISM.eiwImage = function(data,pageData) {
        var src = pageData.shirtDir + "/photos/" + data.code + ".jpg";
        var $img = $("<img/>")
            .attr({
                "src": src,
                "alt": data.team_name,
                "class": "ismEiwImage"
            })
        ;
        $img.on("error", function() {
            $img.off("error");
            $img.attr("src", pageData.shirtDir + "/photos/pixel.jpg");
        });
        $("#ismEiwImage").html($img);

    };

    // Standard dialog redraws
    var $eiw = $("#ismEiw");
    var eiwRedraw = function(event, data) {
        var el = data.element_data;
        // Change title
        var $title = $("#ui-dialog-title-ismEiw");
        var text = $title.text();
        $title.text(text+"m");
        // Set name
        $("#ismEiwName").html(el.first_name + " " + el.second_name);
        // Add team badge
        var $img = $("<img/>")
            .attr({
                "src": "http://cdn.ismfg.net/static/plfpl/img/badges/badge_" +
                    el.team_id + ".png",
                "alt": el.team_name
            });
        $("#ismEiwTeamImage").html($img);
        // Add value
        $("#ismEiwValue").html(window.ISM.currency(el.now_cost) + "m");
        // Check for news
        var $news = $("#ismEiwNews");
        if (!$news.text()) {
            $news.text($news.data("no-news"));
        }
        // Check for explain
        var $explain = $("#ismEiwEventExplain tbody");
        if (!$explain.html()) {
            $explain.html($explain.data("empty"));
        }
    };
    $eiw.on("ismEiwDrawn", eiwRedraw);

    // Change EA Player Performance Index acronym
    window.ISM.$ismNode.bind("elementListDisplayFinish", function() {
        if ($("#ismStatSort").val() == "ea_index") {
            $("#ismElementDataTable abbr").each(function() {
                this.innerHTML = "PPI";
            });
        }
    });

    // Bumper end of season scout
    var $ismScoutPart1 = $(".ism-part-1"),
        $ismScoutPart2 = $(".ism-part-2");

    $("#ism-scout-2-link").on("click", function(event) {
        event.preventDefault();
        $ismScoutPart1.hide();
        $ismScoutPart2.show();
    });

    $("#ism-scout-1-link").on("click", function(event) {
        event.preventDefault();
        $ismScoutPart2.hide();
        $ismScoutPart1.show();
    });

    // Links to rules from faqs
    var openRulesSection = function(event) {
        event.preventDefault();
        $("#ismHelp").tabs("select", "#ismRules");
        $("#"+$(event.target).data("target")).trigger("click");
    };
    $("#ismFAQ").on("click", ".ismRulesLink", openRulesSection);

    // Populate round carousel
    var populateRoundCarousel = function() {
        var $car = $("#ismJSCarousel");
        var eid = $car.data("entry");
        var i;

        if ($car.length) {

            // Set entry history links
            $car.find(".ismEhLink").each(function() {
                this.href = this.href.replace(
                    "/entry/0/", "/entry/" + eid + "/");
            });

            // Hide unused links
            if (eid == $car.data("logged-in")) {
                $car.find(".ismJSLoggedOutLinks").hide();
            }
            else {
                $car.find(".ismJSLoggedInLinks").hide();
            }

            // Removed invalid events
            for (i = 1; i < $car.data("started"); i++) {
                $("#event_"+i).remove();
            }

            // Highlight shown event
            $("#event_"+$car.data("highlight")).addClass("ismInProgress");

        }

    };

    // Populate data view stats
    var teamPopulateData = function() {
        var picks = $("#ismDataElements").data("picks");
        if (picks) {
            var html = "";
            for (var i=0; i<picks.length; i++) {
                var stats = picks[i].stats;
                html += "<tr id='ismData" + picks[i].element + "'>";
                for (var j=0; j<stats.length; j++) {
                    html += "<td>" + stats[j] + "</td>";
                }
                html += "</tr>";
            }
            $("#ismDataElements").html(html);
        }
    };

    // Copy pitch view info to data view
    var teamCopyPitchToData = function() {
        var regexp = /^JS_/;
        $("#ismDataElements tr").each(function(i, row) {
            var $pitch = $("#ismGraphical" + (i+1));
            $("td", row).each(function(j, cell) {
                var txt = cell.innerHTML;
                if (txt.match(regexp)) {
                    cell.innerHTML = $pitch.find("." + txt).html();
                }
            });
        });
    };

    // Images in apad
    var appThumbs = window.ISM.$ismNode.find(".ismAppThumbs");
    if (appThumbs.length) {
        var appImages = appThumbs.find("img").length;

        var showAppImage = function(event) {
            // Image
            var preview = $("<img/>").attr({
                "src": event.target.src.replace("-thumb", "")
            });
            appThumbDialog.find("figure").html(preview);
            appThumbDialog.dialog("open");
            // Nav buttons
            var index = $(event.target).index();
            appThumbs.data("viewing", index);
            if (index === 0) {
                $(".ism .ismAppPrev").button("disable");
                $(".ism .ismAppNext").button("enable").blur();
            }
            else if (index === (appImages-1)) {
                $(".ism .ismAppPrev").button("enable").blur();
                $(".ism .ismAppNext").button("disable");
            }
            else {
                $(".ism .ismAppPrev").button("enable").blur();
                $(".ism .ismAppNext").button("enable");
            }
        };

        var changeAppImage = function(event) {
            event.preventDefault();
            var viewing = appThumbs.data("viewing");
            if ($(event.target).parent().hasClass("ismAppPrev")) {
                appThumbs.find("img").eq(viewing-1).trigger("click");
            }
            else {
                appThumbs.find("img").eq(viewing+1).trigger("click");
            }
        };

        var appThumbDialog = window.ISM.$ismNode.find(".ismAppDialog");
            appThumbDialog.dialog({
                autoOpen: false,
                resizable: false,
                width: 355,
                height: 575,
                title: "Official App Preview",
                dialogClass: "ism",
                modal: true,
                draggable: false
            });

        appThumbs.on("click", "img", showAppImage);
        appThumbDialog.on("click", ".ismButton", changeAppImage);
    }

    // Get a list of thumbs (2)
    var $surgeryThumb = window.ISM.$ismNode.find(".ismjs-surgery__thumb");
    if( $surgeryThumb.length ) {

        // show the surgery dialog
        var showSurgeryImage = function(event) {
            event.preventDefault();
            var $this = $(this);
            // get the javascript object so we can replace the src attr for
            // the larger version in the dialog
            var _thumbImg = $this.find(".ism-scout__case__img")[0];
            var $largeImg = $("<img>").attr({
                "src": _thumbImg.src.replace("-thumb", ""),
                "alt": " "
            });

            // get the surgery case heading to populate the dialog title
            var title = $this
                            .closest(".ismjs-scout__case")
                            .find(".ism-scout__case__heading")
                            .text();

            $surgeryDialog.find("figure").html($largeImg);
            $surgeryDialog.dialog("option", "title", title);
            $surgeryDialog.dialog("open");
        };

        var $surgeryDialog = window.ISM.$ismNode.find(".ismjs-dialog--surgery");
            $surgeryDialog.dialog({
                autoOpen: false,
                resizable: false,
                width: 520,
                height: 735,
                dialogClass: "ism",
                modal: true,
                draggable: false
            });

        // Click on a thumb
        var $surgeryItem = window.ISM.$ismNode.find(".ismjs-scout__case");
        $surgeryItem.on("click", ".ismjs-surgery__thumb", showSurgeryImage);
    }

    // Surgery form
    var $surgeryForm = $("#ismjs-surgery-form");
    if ($surgeryForm.length) {

        var $surgeryMessage = $("#ismjs-surgery-message");
        var $surgerySend = $("#ismjs-surgery-send");

        // Enable button if more than 1 character
        $surgeryMessage.on("change keyup", function(e) {
            if (e.currentTarget.value.length > 1) {
                $surgerySend.button("enable");
            }
            else {
                $surgerySend.button("disable");
            }
        });

        // Handle surgery submission
        $surgerySend.on("click", function(e) {

            e.preventDefault();
            $surgerySend.button("disable");
            var data = {
                "entry": $surgeryForm.data("entry"),
                "message": $surgeryMessage.val()
            };
            $.ajax({
                url: "/drf/surgery",
                type: "POST",
                data: JSON.stringify(data),
                contentType: "application/json"
            }).done(function() {

                $surgeryForm.hide();
                $("#ism-js-sent").removeClass("ismHide");

            }).fail(function() {

                // Shouldn"t happen - must have logged out, or be logged in
                // as someone else
                window.location = "/";

            });
        });

    }

    // Select language
    var changeLanguage = function(e) {
        window.location = e.currentTarget.value;
    };
    $("#ism-lang__select").on("change", changeLanguage);

    // Set locale coookie when changing language
    var setLocaleCookie = function(e) {
        var locale = $(e.currentTarget).data("lang-code");
        if (locale) {
            var date = new Date();
            date.setTime(date.getTime()+(365*24*60*60*1000));
            var expires = "; expires="+date.toGMTString();
            var path = "; path=/";
            var domain = "; domain=.premierleague.com";
            document.cookie =  "pllocale=" + locale + expires + path + domain;
        }
    };
    $(".ismjs-lang-selector").on("click", "a", setLocaleCookie);

    // Support form
    var $supportForm = $("#ismjs-support-form");
    $supportForm.on("if:we:could:do:this:with:ajax", function() {
        $.ajax({
            "type": "POST",
            "url": $supportForm.attr("action"),
            "data": $supportForm.serialize()
        }).done(function() {
            $supportForm.hide();
            $("#ism-js-sent").removeClass("ismHide");
        }).fail(function() {
            window.location = "/rules/";
        });
    });

    // Scout tabs
    var $scoutTabs = $("#ismjs-scout-tabs");
    if ($scoutTabs.length) {
        var scoutType = $scoutTabs.data("scout-type");
        if (scoutType === "preview") {
            $scoutTabs.tabs("preview", 0);
        }
        else if (scoutType === "review") {
            $scoutTabs.tabs("select", 1);
        }
        if (scoutType === "surgery") {
            $scoutTabs.tabs("select", 2);
        }
    }

    var showUltimateAdvert = function() {
        var cName = "uDialog";

        if (ISM.pageData.show_ultimate_advert) {

            var uDialog = $("#ismUltimatePromo");

            if (uDialog.length) {

                var promoName = uDialog.data().promoName;
                var cValue = JSON.parse($.cookie(cName)) || {};
                if (!cValue[promoName]) {

                    uDialog.dialog({
                        autoOpen: true,
                        resizable: false,
                        width: 810,
                        height: 610,
                        dialogClass: "ism ism-ultimate-promo",
                        modal: true,
                        draggable: false,
                        zIndex: 1901
                    });

                    cValue[promoName] = 1;
                    $.cookie(cName, JSON.stringify(cValue), {
                        expires: new Date(2016, 6, 1)
                    });
                }

                // Listen for close button click
                uDialog.find(".ismjs-close").on("click", function(e) {
                    e.preventDefault();
                    uDialog.dialog("close");
                });


            }

        }

    };

    // Club league join form
    var $clubLeagueForm = $("#ismjs-club-league-form");
    $clubLeagueForm.on("submit", function(e) {
        e.preventDefault();
        var club = $clubLeagueForm.find("select").val();
        if (club) {
            var data = {
                "favourite_team": club
            };
            $.ajax({
                url: "/drf/entry-details-fave/",
                type: "PUT",
                data: JSON.stringify(data),
                contentType: "application/json"
            }).done(function() {
                window.location.reload(true);
            });
        }
    });

    var $clubLeagueButton = $clubLeagueForm.find("input").button("disable");
    $clubLeagueForm.on("change", function(e) {
        var club = $clubLeagueForm.find("select").val();
        if (club) {
            $clubLeagueButton.button("enable");
        }
        else {
            $clubLeagueButton.button("disable");
        }
    });


    // Chips
    var CHIPS = function() {

        var chipsByName = {};
        var $chipContainer = $("#ismjs-chips");
        var $chipButtons = $chipContainer.find(".ismjs-chip-button");
        var $chipButtonsCancel = $chipContainer.find(".ismjs-chip-button-cancel");
        var $chipData = $("#ismjs-chips-data");
        var $saveTeam = $("#ismSave");
        var $pitch = $(".ismjs-pitch");
        var txtCancel = $chipContainer.data("txtcancel");
        var txtPlay = $chipContainer.data("txtplay");

        var setup = function() {
            $chipButtons.on("click", chipClick);
            $chipButtonsCancel.on("click", chipClick);
            $.each(ISM.pageData.chips, function(i, chip) {
                chip.originalStatus = chip.status_for_entry;
                chipsByName[chip.name] = chip;
            });
            renderChips();
        };

        var chipClick = function(e) {
            e.preventDefault();
            var activeChip = $(e.currentTarget).data("chipname");
            var status = chipsByName[activeChip].status_for_entry;
            if (status == "active") {
                cancelChipActive(activeChip);
            }
            else if (status == "available") {
                setChipActive(activeChip);
            }
            renderChips();
        };

        var cancelChipActive = function(chipName) {
            $.each(ISM.pageData.chips, function(i, chip) {
                if (chip.status_for_entry !== "played") {
                    chip.status_for_entry = "available";
                }
            });
            $pitch.removeClass("ism-chip-" + chipName);
            if (chipName == "attack") {
                force343();
            }
            else if (chipName === "3xc") {
                hide3xcIcon();
            }
            else if (chipName === "bboost") {
                boostOff();
            }
        };

        var setChipActive = function(chipName) {
            $.each(ISM.pageData.chips, function(i, chip) {
                if (chip.name == chipName) {
                    chip.status_for_entry = "active";
                }
                else if (chip.status_for_entry !== "played") {
                    chip.status_for_entry = "unavailable";
                }
            });
            $pitch.addClass("ism-chip-" + chipName);
            if (chipName === "attack") {
                force253();
            }
            else if (chipName === "3xc") {
                use3xcIcon();
            }
            else if (chipName === "bboost") {
                boostOn();
            }
        };

        var renderChips = function() {

            // Set buttons dependent on status
            $chipButtons.each(function() {
                var $button = $(this);
                var chipName = $button.data("chipname");
                var status = chipsByName[chipName].status_for_entry;
                if (status == "active") {
                    $button.text(txtCancel);
                    $button.prop("disabled", false);
                    $button
                        .closest(".ismjs-chip")
                        .removeClass("is-disabled");
                    $("#ismjs-chip-cancel-"+chipName).show();
                    $("#ismjs-chip-tip-"+chipName).hide();
                }
                else if (status == "available") {
                    $button.text(txtPlay);
                    $button.prop("disabled", false);
                    $button
                        .closest(".ismjs-chip")
                        .removeClass("is-disabled");
                    $("#ismjs-chip-cancel-"+chipName).hide();
                    $("#ismjs-chip-tip-"+chipName).show();
                }
                else if (status == "unavailable") {
                    $button.text(txtPlay);
                    $button.prop("disabled", true);
                    $button
                        .closest(".ismjs-chip")
                        .addClass("is-disabled");
                    $("#ismjs-chip-cancel-"+chipName).hide();
                    $("#ismjs-chip-tip-"+chipName).show();
                }
            });

            // Populate data as required
            $chipData.val(JSON.stringify(getChipAPIData()));

            // If we have a changed chip then enable the button
            if ($chipData.val() !== "{}") {
                $saveTeam.button("enable");
            }

        };

        var getChipAPIData = function() {
            var data = {};
            $.each(ISM.pageData.chips, function(i, chip) {
                if (chip.status_for_entry !== chip.originalStatus) {
                    if (chip.originalStatus == "active") {
                        data["delete"] = chip.name;
                    }
                    else if (chip.status_for_entry == "active") {
                        data.play = chip.name;
                    }
                }
            });
            return data;
        };

        var force253 = function() {
            ISM.pageData.typeLimits[2].minPlay = 2;
            ISM.pageData.typeLimits[2].maxPlay = 2;
            ISM.pageData.typeLimits[3].minPlay = 5;
            ISM.pageData.typeLimits[3].maxPlay = 5;
            ISM.pageData.typeLimits[4].minPlay = 3;
            ISM.pageData.typeLimits[4].maxPlay = 3;

            // Go through subs and for each one who isn't a type 2 replace
            // with a type 2 who isn't captain or vice captain
            for (var i=1; i<=15; i++) {
                var elI = ISM.team[i];
                if (elI.data("pos") >= 13 && elI.metadata().type != 2) {
                    for (var j=1; j<=15; j++) {
                        var elJ = ISM.team[j],
                            elJPos = elJ.data("pos");
                        if (
                            elJ.metadata().type == 2 && elJPos <= 11 &&
                            elJPos != ISM.$capSel.data("curPos") &&
                            elJPos != ISM.$vCapSel.data("curPos")
                        ) {
                            ISM.teamProcessSubstitution(elI, elJ);
                            break;
                        }

                    }
                }
            }


        };

        var force343 = function() {
            ISM.pageData.typeLimits[2].minPlay = 3;
            ISM.pageData.typeLimits[2].maxPlay = 5;
            ISM.pageData.typeLimits[3].minPlay = 2;
            ISM.pageData.typeLimits[3].maxPlay = 5;
            ISM.pageData.typeLimits[4].minPlay = 1;
            ISM.pageData.typeLimits[4].maxPlay = 3;

            // Replace position 13 with first type 3 who isn't captain or vc
            for (var i=1; i<=15; i++) {
                var elI = ISM.team[i];
                if (elI.data("pos") == 13 ) {
                    for (var j=1; j<=15; j++) {
                        var elJ = ISM.team[j],
                            elJPos = elJ.data("pos");
                        if (
                            elJ.metadata().type == 3 &&
                            elJPos != ISM.$capSel.data("curPos") &&
                            elJPos != ISM.$vCapSel.data("curPos")
                        ) {
                            ISM.teamProcessSubstitution(
                                ISM.team[i], ISM.team[j]);
                            break;
                        }

                    }
                }
            }
        };

        var use3xcIcon = function() {
            ISM.$ismNode.find("img.ismjs-capicon").each(function() {
                this.src = this.src.replace("captain", "captain-3xc");
            });
        };

        var hide3xcIcon = function() {
            ISM.$ismNode.find("img.ismjs-capicon").each(function() {
                this.src = this.src.replace("captain-3xc", "captain");
            });
        };

        var boostOff = function() {
            ISM.$ismNode.find(".ismjs-boost-on").addClass("hidden");
            ISM.$ismNode.find(".ismjs-boost-off").removeClass("hidden");
        };

        var boostOn = function() {
            ISM.$ismNode.find(".ismjs-boost-off").addClass("hidden");
            ISM.$ismNode.find(".ismjs-boost-on").removeClass("hidden");
        };

        return {
            setup: setup
        };

    };

    // Run actions based on page name
    var sPath = window.location.pathname;
    if (sPath == "/my-team/" || sPath.indexOf == "/event-history/" !== -1) {
        populateRoundCarousel();
        teamPopulateData();
        teamCopyPitchToData();
    }
    if (sPath == "/my-team/") {
        CHIPS().setup();
        showUltimateAdvert();
    }


}(window.jQuery, window.ISM);


