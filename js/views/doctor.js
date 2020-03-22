define([
    'jquery',
    'underscore',
    'backbone',
    'text!tpl/doctor.html'
], function ($, _, Backbone, DoctorHtml) {
    return Backbone.View.extend({
        render: function () {
            var compiledTemplate = _.template(DoctorHtml);
            var times = this.model.get("waiting_times");
            this.$el.html(compiledTemplate({model: this.model, waiting_times: times}));

            return this;
        }
    });
});