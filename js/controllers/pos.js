define([
    'jquery',
    'underscore',
    'backbone',
    'views/pos',
    'views/poislist',
    'collections/pois',
    'map',
    'geocode'
], function ($, _, Backbone, PosView, PoisListView, PoisCollection) {
    return function (lon, lat, area) {
        var posView = new PosView();
        $('#content').html(posView.render().el);

        var map = new Map("map");

        map.setCenter(lon, lat, 15);

        map.addMarker("Ihre Position", lon, lat, '../../img/marker.png');

        var poisCollection = new PoisCollection();

        poisCollection.fetch({
            data: $.param({ "lon": lon, "lat": lat, "area": area}),
            success: function(data) {
                var poisListView = new PoisListView({ collection: poisCollection });
                $('#poislist').html(poisListView.render().el);
            }
        });
    };
});
