define([
    'jquery',
    'underscore',
    'backbone',
    'views/detail',
    'views/doctor',
    'views/hospital',
    'models/poi',
    'collections/pois',
    'views/poislist',
    'map'
], function ($, _, Backbone, DetailView, DoctorView, HospitalView, PoiModel, PoisCollection, PoisListView) {
    return function (type, id) {
        var self = this;
        var institution = new PoiModel();

        institution.fetch({
            data: $.param({ "id": id}),
            success: function () {
                var detailView = new DetailView({model: institution});
                $('#content').html(detailView.render().el);
                //choose between displaying doctor or hospital details
                if (type.toLowerCase() == 'doctor') {
                    var doctorView = new DoctorView({model: institution});
                    $('#detail-content').html(doctorView.render().el);
                }
                else if (type.toLowerCase() == 'hospital') {
                    var hospitalView = new HospitalView({model: institution});
                    $('#detail-content').html(hospitalView.render().el);
                }

                var lat = institution.get('latitude');
                var lon = institution.get('longitude');
                var area = 50;

                var map = new Map("hospital-map");

                map.setCenter(lon, lat, 15);

                map.addPois(
                    "Krankenhäuser",
                    "https://krankenbett.wo-zu-finden.de/api/find.php?format=geojson&lon=" + lon + "&lat=" + lat + "&area=" + area + "&type=HOSPITAL",
                    1,
                    '/img/hospital.svg',
                    '#ff0000'
                );

                map.addPois(
                    "Ärzte",
                    "https://krankenbett.wo-zu-finden.de/api/find.php?format=geojson&lon=" + lon + "&lat=" + lat + "&area=" + area + "&type=DOCTOR",
                    2,
                    '/img/doctor.svg',
                    '#0000ff'
                );

                var searcharea = map.addShapes('Suchbereich', ["CIRCLE (" + lon + " " + lat + " " + (area*1000) + ")"]);
                map.zoomToExtent(searcharea);

                $('#hospital-map_marker_info').on('click', '.more-info', function(){
                    $('#hospital-map_marker_info').modal('toggle');
                    var type = $(this).attr('data-type');
                    var id = $(this).attr('data-id');
                    location.href = "#detail/" + type + "/" + id;
                });

                var poisCollection = new PoisCollection();
                poisCollection.fetch({
                    data: $.param({ "lon": lon, "lat": lat, "area": area}),
                    success: function(data) {
                        poisCollection.sort();
                        poisCollection.remove(institution);
                        var poisListView = new PoisListView({ collection: poisCollection, area: area});
                        $('#poislist').html(poisListView.render().el);
                    }
                });
            }
        });
    }
});
