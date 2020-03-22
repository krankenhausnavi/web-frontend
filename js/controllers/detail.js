define([
    'jquery',
    'underscore',
    'backbone',
    'views/detail',
    'views/doctor',
    'views/hospital',
    'models/poi',
    'collections/pois',
    'map'
], function ($, _, Backbone, DetailView, DoctorView, HospitalView, PoiModel) {
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
                /*
                var lat = institution.get('latitude');
                var lon = institution.get('longitude');

                var map = new Map("map");

                map.setCenter(lon, lat, 15);

                map.addMarker("Ihre Position", lon, lat, '../../img/marker.png');
                 */
            }
        });
        console.log(institution);
    }
});
