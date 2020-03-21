define([
    'jquery',
    'underscore',
    'backbone',
    'text!tpl/doctor.html'
], function ($, _, Backbone, DoctorHtml) {
    return Backbone.View.extend({
        render: function () {
            var compiledTemplate = _.template(DoctorHtml);
            this.$el.html(compiledTemplate());

            return this;
        }
    });
});