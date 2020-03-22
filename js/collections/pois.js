define([
    'underscore',
    'backbone',
    'models/poi'
], function(_, Backbone, PoiModel){
    return Backbone.Collection.extend({
        url: 'http://krankenbett.wo-zu-finden.de/api/find.php',
        model: PoiModel
    });
});
