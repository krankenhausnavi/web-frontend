define([
    'underscore',
    'backbone',
    'models/poi'
], function(_, Backbone, PoiModel){
    return Backbone.Collection.extend({
        url: 'http://localhost:3000/dev/institutions',
        model: PoiModel
    });
});
