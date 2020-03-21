define([
    'jquery',
    'underscore',
    'backbone',
    'views/start',
    'views/poislist',
    'collections/pois',
    'map',
    'geocode'
], function ($, _, Backbone, StartView, PoisListView, PoisCollection) {
    return function () {
        var self = this;

        var startView = new StartView();
        $('#content').html(startView.render().el);

        enable_autocomplete_of_address($('#address'));

        $('#search').click(function () {
            geocode_query($('#address').val(), function(lon, lat, zip) {
                location.href = "#pos/" + lon + "/" + lat + "/" + $('#area').val();
            });
        });

        $("#locate").click(function() {
            navigator.geolocation.getCurrentPosition(function(position) {
                location.href = "#pos/" + position.coords.longitude + "/" + position.coords.latitude + "/" + $('#area').val();
            });
        });
    }
});
