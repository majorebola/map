/**
 * Singleton that handles the entire map-marker-path data structure.
 * uses a List of markers.
 * Each marker has a previous and a next marker. So each remove, add or update SHOULD absolutely update previousMarker and NextMarker
 * There is also an array (markers) which is used to cycle through all marker available. So this also should be updated for each crud operation
 * If there is a nextMarker, a marker has also an extremely important pathToNextMarker representing the path (given by Gmaps API) to the next marker
 *
 */
var MapManager = (function() {
    var self = this;
    var markers;                    // array of markers. Must be updated for each add, update or delete
    var map;                        // THE GMAP
    var directionsService;          // GMAP Direction Services
    var poly;                       // polyline used to draw the routes

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

    var buildPath = function(result) {
        var innerPath = new google.maps.MVCArray();
        for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
            innerPath.push(result.routes[0].overview_path[i]);
        }
        return innerPath;
    };

    var drawPath = function() {
        var tpath = new google.maps.MVCArray();

        for (var k in markers) {
            if (markers.hasOwnProperty(k) && markers[k].pathToNextMarker) {
                for (var i = 0; i < markers[k].pathToNextMarker.length; i++) {
                    tpath.push(markers[k].pathToNextMarker.getAt(i));
                }
            }
        }
        poly.setPath(tpath);
        poly.setMap(map);
    };

    /**
     * Private call to Google Maps Services.
     * TODO: better error handling
     * @param start
     * @param end
     * @param callback
     */
    var calculatePath = function(start, end, callback) {
        directionsService.route({
            origin: start,
            destination: end,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        }, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                // result.index = index;
                callback(result);
            } else {
                console.log("error");
            }
        });
    };

    self.init = function(inputMap) {
        markers = [];
        map = inputMap;

        directionsService = new google.maps.DirectionsService();
        poly = new google.maps.Polyline({
            strokeColor: '#DE4343',
            strokeWeight: 3,
            map: map
        });
    };

    // Not sure if useful, now for debug purpose only
    self.getMarkers = function() {
        return markers;
    };

    // Not sure if useful, shoud be included in the addMarker function?
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

        if (markers.length > 1) {
            var callback = function(result) {
                previousMarker.pathToNextMarker = buildPath(result);
                drawPath();
                DataManager.addTravelDatas(result.routes[0].legs[0]);
            };
            calculatePath(previousMarker.getPosition(), marker.getPosition(), callback);
        }
    };

    self.removeMarker = function(marker) {
        if(marker.previousMarker && marker.nextMarker) {
            // Middle Point case: I have a previous and a next marker. I should recalculate the path
            marker.previousMarker.nextMarker = marker.nextMarker;
            marker.nextMarker.previousMarker = marker.previousMarker;
            var callback = function(result) {
                marker.previousMarker.pathToNextMarker = buildPath(result);
                drawPath();
                DataManager.addTravelDatas(result.routes[0].legs[0]);
            };
            calculatePath(marker.previousMarker.getPosition(), marker.nextMarker.getPosition(), callback);
        } else if(marker.nextMarker) {
            // First Point case: I have a next marker but not a previous one.
            delete marker.nextMarker.previousMarker;
            delete marker.pathToNextMarker;
            drawPath();
        } else if(marker.previousMarker) {
            // Last Point case: I have a previous marker but not a next one.
            delete marker.previousMarker.nextMarker;
            delete marker.previousMarker.pathToNextMarker;
            drawPath();
        }
        markers.splice(getMarkerIndex(marker), 1);
        marker.setMap(null);
        updateBounds();
    };

    var getMarkerIndex = function(marker) {
        for (var m in markers) {
            if (markers.hasOwnProperty(m) && marker == markers[m]) {
                return m;
            }
        }
    };

    return self;
})();