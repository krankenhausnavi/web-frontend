define([
    'jquery',
    'underscore',
    'backbone',
    'text!tpl/start.html'
], function ($, _, Backbone, StartHtml) {
    return Backbone.View.extend({
        render: function () {
            var compiledTemplate = _.template(StartHtml);
            this.$el.html(compiledTemplate());
            return this;
        }
    });
});
