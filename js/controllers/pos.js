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

        var map = new Map("hospital-map");

        map.setCenter(lon, lat, 15);

        map.addMarker("Ihre Position", lon, lat, '../../img/marker.png');

        map.addPois(
            "Krankenhäuser und Ärzte",
            "https://krankenbett.wo-zu-finden.de/api/find.php?format=geojson&lon=" + lon + "&lat=" + lat + "&area=" + area,
            1,
            '/img/marker.png',
            '#BF0000'
        );

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
