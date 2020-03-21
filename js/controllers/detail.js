define([
    'jquery',
    'underscore',
    'backbone',
    'views/detail',
    'views/poislist',
    'collections/pois',
    'map'
], function ($, _, Backbone, DetailView) {
    return function () {
        var self = this;
        var detailView = new DetailView();
        $('#content').html(detailView.render().el);
    }
});
