define([
    'jquery',
    'underscore',
    'backbone',
    'views/start'
], function ($, _, Backbone, StartView) {
    return function () {
        var self = this;

        var startView = new StartView();
        $('#content').html(startView.render().el);
    }
});
