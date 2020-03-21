define([
    'jquery',
    'underscore',
    'backbone',
    'bootstrap',
    'router',
    'address_field'
], function ($, _, Backbone, Bootstrap, Router) {
        var initialize = function () {

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
                errorMsg += "\n"  + JSON.stringify(jqxhr.responseJSON, null, 4);
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