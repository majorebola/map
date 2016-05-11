/**
 * Singleton that handles the entire map-marker-path data structure.
 */
var MapManager = (function() {
    var self = this;
    var markers;
    var map;

    var getLastMarker = function() {
        if(markers.length > 0) {
            return markers[markers.length-1];
        }
    };

    var updateBounds = function() {
        var bounds = new google.maps.LatLngBounds();
        for (var k in markers) {
            if(markers.hasOwnProperty(k)) {
                bounds.extend(markers[k].getPosition());
            }
        }
        // set bounds
        map.fitBounds(bounds);
    };

    self.init = function(inputMap) {
        markers = [];
        map = inputMap;
    };

    // Not sure if useful, now for debug purpose only
    self.getMarkers = function() {
        return markers;
    };

    self.createMarker = function(place) {
        return new google.maps.Marker({
            map: map,
            title: place.name,
            position: place.geometry.location
        });
    };

    self.addMarker = function(marker) {
        if (markers.length > 0) {
            var previousMarker = getLastMarker();
            previousMarker.nextMarker = marker;
            marker.previousMarker = previousMarker;
            marker.index = markers.length;
        }
        markers.push(marker);
        updateBounds();
    };


    return self;
})();