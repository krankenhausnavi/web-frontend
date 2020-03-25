define([
    'jquery',
    'underscore',
    'backbone',
    'router',
    'address_field',
    'materialkit',
    'address_field',
    'geocode'
], function ($, _, Backbone, Router) {
    var initialize = function () {

        enable_autocomplete_of_address($('#nav-address'));

        $('#nav-search').click(function () {
            geocode_query($('#nav-address').val(), function(lon, lat, zip) {
                location.href = "#pos/" + lon + "/" + lat + "/" + 50;
            });
        });

        $("#nav-locate-btn").click(function() {
            navigator.geolocation.getCurrentPosition(function(position) {
                location.href = "#pos/" + position.coords.longitude + "/" + position.coords.latitude + "/" + 50;
            });
        });

        // global ajax error handler.
        $(document).ajaxError(function (event, jqxhr, settings, thrownError) {
            var errorMsg = thrownError;

            if (
                jqxhr.status != undefined
                && jqxhr.status != null
            ) {
                errorMsg += " (" + jqxhr.status + ")";
            }

            errorMsg += "\n";

            if (
                settings.url != undefined
                && settings.url != null
            ) {
                errorMsg += "\nUrl: " + settings.url;
            }

            if (
                settings.type != undefined
                && settings.type != null
            ) {
                errorMsg += "\nMethod: " + settings.type;
            }

            if (
                jqxhr.responseJSON !== undefined
            ) {
                errorMsg += "\n" + JSON.stringify(jqxhr.responseJSON, null, 4);
            }

            console.error(errorMsg);
            alert(errorMsg);
        });

        Router.initialize();
    }

    return {
        initialize: initialize
    };
});