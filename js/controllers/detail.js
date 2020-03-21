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
        var detailView = new DetailView();
        $('#content').html(detailView.render().el);

        var institution = new PoiModel({ id: id });
        institution.fetch({
            success: function () {
                //choose between displaying doctor or hospital details
                if (type == 'DOCTOR') {
                    var doctorView = new DoctorView({model: institution});
                    $('#detail-content').html(doctorView.render().el);
                }
                else if (type == 'HOSPITAL') {
                    var hospitalView = new HospitalView({model: institution});
                    $('#detail-content').html(hospitalView.render().el);
                }
                var lat = institution.get('latitude');
                var lon = institution.get('longitude');

                var map = new Map("map");

                map.setCenter(lon, lat, 15);

                map.addMarker("Ihre Position", lon, lat, '../../img/marker.png');
            }
        });
        console.log(institution);
    }
});
