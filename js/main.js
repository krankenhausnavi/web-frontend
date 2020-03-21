// Filename: main.js

window.Config = {
    "BING_API_KEY": "AsXsS7fjmdljPUWBsUshFg-W-kN_HMoTgbCticeMsV9zrhCpF9dN5ZRWx54yWjXk"
};

// Require.js allows us to configure shortcut alias
// There usage will become more apparent further along in the tutorial.
require.config({
    paths: {
        underscore: '../libs/underscore/underscore',
        backbone: '../libs/backbone/backbone',
        jquery: '../libs/jquery/jquery',
        jqueryui: '../libs/jquery-ui/jquery-ui',
        bootstrap: '../libs/bootstrap/bootstrap',
        OpenLayers: '../libs/openlayers/OpenLayers',
        map: 'map/map',
        address_field: 'map/address_field',
        geocode: 'map/geocode'
    },
    shim: {
        bootstrap: {
            deps: ["jquery"]
        },
        backgridSelect2Cell: {
            deps: ["select2"]
        },
        map: {
            deps: ["OpenLayers"]
        },
        address_field: {
            deps: ["jqueryui"]
        }
    }
});

require([
    // Load our app module and pass it to our definition function
    'app',
], function(App){
    // The "app" dependency is passed in as "App"
    App.initialize();
});
