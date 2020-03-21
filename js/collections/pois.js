define([
    'underscore',
    'backbone',
    'models/poi'
], function(_, Backbone, PoiModel){
    return Backbone.Collection.extend({
        url: 'http://localhost:3000/dev/find?lat=50&lon=8&area=12',
        model: PoiModel
    });
});
