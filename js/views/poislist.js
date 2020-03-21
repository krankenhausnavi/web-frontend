define([
    'jquery',
    'underscore',
    'backbone',
    'text!tpl/poislist.html'
], function ($, _, Backbone, PoislistHtml) {
    return Backbone.View.extend({
        events: {
            "click a": "clicked"
        },
        
        clicked: function(e){
            e.preventDefault();
            var id = $(e.currentTarget).data("id");
            location.href = "#detail/" + id;
            location.reload();
        },
        render: function () {
            var compiledTemplate = _.template(PoislistHtml);
            this.$el.html(compiledTemplate({collection: this.collection}));
            return this;
        }
    });
});