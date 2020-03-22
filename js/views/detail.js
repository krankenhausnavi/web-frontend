define([
    'jquery',
    'underscore',
    'backbone',
    'text!tpl/detail.html'
], function ($, _, Backbone, DetailHtml) {
    return Backbone.View.extend({
        render: function () {
            var compiledTemplate = _.template(DetailHtml);
            var times = this.model.get("waiting_times").collection;
            console.log(times);
            _.each(times, function(time) {
                console.log(time.type);
            });
            this.$el.html(compiledTemplate({model: this.model}));
            return this;
        }
    });
});