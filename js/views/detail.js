define([
    'jquery',
    'underscore',
    'backbone',
    'text!tpl/detail.html'
], function ($, _, Backbone, DetilHtml) {
    return Backbone.View.extend({
        render: function () {
            var compiledTemplate = _.template(DetailHtml);
            this.$el.html(compiledTemplate());

            return this;
        }
    });
});