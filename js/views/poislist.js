define([
    'jquery',
    'underscore',
    'backbone',
    'text!tpl/poislist.html'
], function ($, _, Backbone, PoislistHtml) {
    return Backbone.View.extend({
        initialize: function (options) {
            this.options = options || {};
        },

        render: function () {
            var compiledTemplate = _.template(PoislistHtml);
            var html = compiledTemplate({collection: this.collection, area: this.options.area});
            this.$el.html(html);
            return this;
        }
    });
});
