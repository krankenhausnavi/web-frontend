define([
    'jquery',
    'underscore',
    'backbone',
    'views/detail',
    'map'
], function ($, _, Backbone, DetailView) {
    return function () {
        var lat = 50;
        var lon = 8;

        var self = this;
        var detailView = new DetailView();
        $('#content').html(detailView.render().el);

        var map = new Map("map");

        map.setCenter(lon, lat, 15);

        map.addMarker("Ihre Position", lon, lat, '../../img/marker.png');
    }
});
