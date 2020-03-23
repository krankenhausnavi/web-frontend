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
            "Krankenhäuser",
            "https://krankenbett.wo-zu-finden.de/api/find.php?format=geojson&lon=" + lon + "&lat=" + lat + "&area=" + area + "&type=HOSPITAL",
            1,
            '/img/hospital.png',
            '#ff0000'
        );

        map.addPois(
            "Ärzte",
            "https://krankenbett.wo-zu-finden.de/api/find.php?format=geojson&lon=" + lon + "&lat=" + lat + "&area=" + area + "&type=DOCTOR",
            2,
            '/img/doctor.png',
            '#0000ff'
        );

        var searcharea = map.addShapes('Suchbereich', ["CIRCLE (" + lon + " " + lat + " " + (area*1000) + ")"]);
        map.zoomToExtent(searcharea);

        $('#hospital-map_marker_info').on('click', '.more-info', function(){
            $('#hospital-map_marker_info').modal('toggle');
            var type = $(this).attr('data-type');
            var id = $(this).attr('data-id');
            location.href = "detail/" + type + "/" + id;
        });

        var poisCollection = new PoisCollection();
        poisCollection.fetch({
            data: $.param({ "lon": lon, "lat": lat, "area": area}),
            success: function(data) {
                var poisListView = new PoisListView({ collection: poisCollection, lat:lat, lon:lon });
                $('#poislist').html(poisListView.render().el);
            }
        });
    };
});
