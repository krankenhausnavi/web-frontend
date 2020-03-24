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
            openings = openings.sort(function(a, b) {
                var weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
                if (weekdays.indexOf(a.day) > weekdays.indexOf(b.day)) {
                    return 1;
                }
                if (weekdays.indexOf(a.day) < weekdays.indexOf(b.day)) {
                    return -1;
                }

                if (a.start_time < b.start_time) {
                    return 1;
                }
                if (a.start_time > b.start_time) {
                    return -1;
                }

                return 0;
            });
            
            this.$el.html(compiledTemplate({model: this.model, opening_hours: openings}));
            return this;
        }
    });
});