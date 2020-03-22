define([
    'jquery',
    'underscore',
    'backbone',
    'views/pos',
    'views/poislist',
    'collections/pois',
    'map',
    'circle',
    'geocode'
], function ($, _, Backbone, PosView, PoisListView, PoisCollection) {
    return function (lon, lat, area) {
        lon = parseFloat(lon);
        lat = parseFloat(lat);
        area = parseInt(area);

        var posView = new PosView();
        $('#content').html(posView.render().el);

        var map = new Map("hospital-map");

        map.setCenter(lon, lat, 15);

        map.addMarker("Ihre Position", lon, lat, '../../img/marker.png');

        var searcharea = map.addShapes('Suchbereich', ["CIRCLE (" + lon + " " + lat + " " + (area*1000) + ")"]);

        map.zoomToExtent(searcharea);

        var poisCollection = new PoisCollection();

        poisCollection.fetch({
            data: $.param({ "lon": lon, "lat": lat, "area": area}),
            success: function(data) {
                var poisListView = new PoisListView({ collection: poisCollection, area: area });
                $('#poislist').html(poisListView.render().el);
            }
        });
    };
});
