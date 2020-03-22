define([
    'jquery',
    'underscore',
    'backbone',
    'controllers/start',
    'controllers/pos',
    'controllers/detail',
], function($, _, Backbone, StartController, PosController, DetailController) {
    var AppRouter = Backbone.Router.extend({
        routes: {
            "start": "start",
            "pos/:lat/:lon/:area": "pos",
            "detail/:type/:id": "detail"
        },

        start: StartController,
        detail: DetailController,
        pos: PosController,

        initialize: function () {
            var self = this;

            this.on("route", function (route, params) {
                var fragment = Backbone.history.fragment;
                var basePath = fragment.split('/')[0];
                $('#nav').find('a.active').removeClass('active');
                $('#nav a[href="#' + basePath + '"]').addClass('active');
            });
        },
    });

    var initialize = function(){
        var app_router = new AppRouter;
        app_router.on('start',);
        if (!Backbone.history.start()) window.location.hash = 'start';
        return app_router;
    };

    return {
        initialize: initialize
    };
});
