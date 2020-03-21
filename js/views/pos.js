define([
    'jquery',
    'underscore',
    'backbone',
    'text!tpl/pos.html'
], function ($, _, Backbone, PosHtml) {
    return Backbone.View.extend({
        render: function () {
            var compiledTemplate = _.template(PosHtml);
            this.$el.html(compiledTemplate());

            return this;
        }
    });
});
