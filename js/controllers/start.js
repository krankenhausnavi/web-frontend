define([
    'jquery',
    'underscore',
    'backbone',
    'views/start',
    'views/poislist',
    'collections/pois',
    'map',
    'circle',
    'geocode'
], function ($, _, Backbone, StartView, PoisListView, PoisCollection) {
    return function () {
        var self = this;

        var startView = new StartView();
        $('#content').html(startView.render().el);

        enable_autocomplete_of_address($('#address'));

        $('#search').click(function () {
            location.href = "tel:021728216311"
        });

        $("#locate").click(function() {
            navigator.geolocation.getCurrentPosition(function(position) {
                location.href = "#pos/" + position.coords.longitude + "/" + position.coords.latitude + "/" + 50;
            });
        });
    }
});
