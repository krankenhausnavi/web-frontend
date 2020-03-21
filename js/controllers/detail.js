define([
    'jquery',
    'underscore',
    'backbone',
    'views/detail',
    'views/doctor',
    'views/hospital',
    'map'
], function ($, _, Backbone, DetailView, DoctorView, HospitalView) {
    return function () {
        var lat = 50;
        var lon = 8;

        var self = this;
        var detailView = new DetailView();
        $('#content').html(detailView.render().el);

        //choose between displaying doctor or hospital details
        var type = window.location.href.replace(/^.*[\\\/]/, '');
        if (type == 'DOCTOR') {
            var doctorView = new DoctorView();
            $('#detail-content').html(doctorView.render().el);
        }
        else if (type == 'HOSPITAL') {
            var hospitalView = new HospitalView();
            $('#detail-content').html(hospitalView.render().el);
        }

        var map = new Map("map");

        map.setCenter(lon, lat, 15);

        map.addMarker("Ihre Position", lon, lat, '../../img/marker.png');
    }
});
