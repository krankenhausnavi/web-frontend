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
        jquery: '../libs/material-kit/js/core/jquery.min',
        jqueryui: '../libs/jquery-ui/jquery-ui',
        OpenLayers: '../libs/openlayers/OpenLayers',
        map: 'map/map',
        circle: 'map/circle',
        address_field: 'map/address_field',
        geocode: 'map/geocode',
        popper: '../libs/material-kit/js/core/popper.min',
        bootstrap: '../libs/material-kit/js/core/bootstrap-material-design.min',
        moment: '../libs/material-kit/js/plugins/moment.min',
        datepicker: '../libs/material-kit/js/plugins/bootstrap-datetimepicker',
        nouislider: '../libs/material-kit/js/plugins/nouislider.min',
        materialkit: '../libs/material-kit/js/material-kit',
        initBootstrap : "initBootstrap"
    },
    shim: {
        popper: {
            deps: ["jquery"]
        },
        bootstrap: {
            deps: ["jquery"]
        },
        backgridSelect2Cell: {
            deps: ["select2"]
        },
        map: {
            deps: ["OpenLayers", "materialkit", "jquery", "popper"]
        },
        circle: {
            deps: ["OpenLayers"]
        },
        address_field: {
            deps: ["jqueryui"]
        },
        materialkit: {
            deps: ["initBootstrap", "moment", "datepicker", "nouislider"]
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
