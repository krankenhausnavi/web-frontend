define([
    'jquery',
    'underscore',
    'backbone',
    'views/detail',
    'map'
], function ($, _, Backbone, DetailView) {
    return function () {
        var self = this;
        var detailView = new DetailView();
        $('#content').html(detailView.render().el);
    }
});
