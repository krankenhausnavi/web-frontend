define([
    'jquery',
    'underscore',
    'backbone',
    'views/start',
    'map'
], function ($, _, Backbone, StartView) {
    return function () {
        var self = this;

        self.move_map_to = function(lon, lat) {
            self.map.setCenter(lon, lat, 15);

            if (self.user_position != undefined && self.user_position != null) {
                self.map.removeLayer(self.user_position);
                self.user_position.destroy();
            }
            self.user_position = self.map.addMarker("Ihre Position", lon, lat, '../../img/marker.png');
        };

        navigator.geolocation.getCurrentPosition(function(position) {
            self.move_map_to(position.coords.longitude, position.coords.latitude);
        });

        var startView = new StartView();
        $('#content').html(startView.render().el);

        enable_autocomplete_of_address($('#address'));

        $('#address').change(function () {
            var data = {
                'query': $('#address').val(),
                'culture': 'de',
                'key': window.Config.BING_API_KEY
            };

        });


        self.map = new Map("map");

        self.move_map_to(7.406265240904387, 48.99908606581882);
    }
});
