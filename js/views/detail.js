define([
    'jquery',
    'underscore',
    'backbone',
    'text!tpl/detail.html'
], function ($, _, Backbone, DetailHtml) {
    return Backbone.View.extend({
        render: function () {
            var compiledTemplate = _.template(DetailHtml);
            var openings = this.model.get("opening_hours");
            this.$el.html(compiledTemplate({model: this.model, opening_hours: openings}));
            return this;
        }
    });
});