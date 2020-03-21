/**
 * @file
 *  Makes OpenLayers.Format.WKT compatible with custom CIRCLE object.
 *  CIRCLE (center_lon center_lat radius(in meter)).
 */

/**
 * Returns a LinearRing feature given a circle WKT fragment.
 * @param string str
 *  A extended WKT fragment representing the circle.
 *
 * @returns OpenLayers.Feature.Vector
 *  A LinearRing feature.
 */
OpenLayers.Format.WKT.prototype.parse.circle = function(str) {
    var coords = OpenLayers.String.trim(str).split(this.regExes.spaces);
    
    var lonlat = new OpenLayers.LonLat(coords[0], coords[1]);
    var radius = parseFloat(coords[2]);

    var sides = 80;
    var points = [];
    for (var i = 0; i < sides; i++) {
        var angle = (i * 360 / sides);
        var p =  OpenLayers.Util.destinationVincenty(lonlat, angle, radius);
        points.push(new OpenLayers.Geometry.Point(p.lon, p.lat));
    }
    
    return new OpenLayers.Feature.Vector(      
          new OpenLayers.Geometry.LinearRing(points)
    );
};
