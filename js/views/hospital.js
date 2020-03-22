define([
    'jquery',
    'underscore',
    'backbone',
    'text!tpl/hospital.html'
], function ($, _, Backbone, HospitalHtml) {
    return Backbone.View.extend({
        render: function () {
            var compiledTemplate = _.template(HospitalHtml);
            this.$el.html(compiledTemplate({model: this.model}));

            return this;
        }
    });
});