define([
    'underscore',
    'backbone'
], function(_, Backbone){
    return Backbone.Model.extend({
        urlRoot: 'http://krankenbett.wo-zu-finden.de/api/id.php'
    });
});