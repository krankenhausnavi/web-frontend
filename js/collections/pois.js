define([
    'underscore',
    'backbone',
    'models/poi'
], function(_, Backbone, PoiModel){
    return Backbone.Collection.extend({
        url: 'https://krankenbett.wo-zu-finden.de/api/find.php',
        //url: 'https://1dg8mkclo9.execute-api.us-east-1.amazonaws.com/dev/institutions',
        model: PoiModel,
        comparator: function(a) {
            return a.get('distance');
        }
    });
});
