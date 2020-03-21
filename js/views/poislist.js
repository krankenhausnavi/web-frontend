define([
    'jquery',
    'underscore',
    'backbone',
    'text!tpl/poislist.html'
], function ($, _, Backbone, PoislistHtml) {
    return Backbone.View.extend({
        render: function () {
            var compiledTemplate = _.template(PoislistHtml);
            this.$el.html(compiledTemplate({collection: this.collection}));
            return this;
        }
    });
});