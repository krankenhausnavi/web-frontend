define([
    'jquery',
    'underscore',
    'backbone',
    'views/start',
    'map'
], function ($, _, Backbone, StartView) {
    return function () {
        var self = this;

        var startView = new StartView();
        $('#content').html(startView.render().el);

        var map = new Map("map");
        map.setCenter(8.406265240904387, 48.99908606581882, 15);
    }
});
