define([
    'underscore',
    'backbone'
], function(_, Backbone){
    return Backbone.Model.extend({
        urlRoot: 'http://localhost:3000/dev/institutions'
    });
});