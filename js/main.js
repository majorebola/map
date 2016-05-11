'use strict';
const GENERATOR_TIMER = 1000;

var map;                    // google map
var mapElement;             // map element where google map instanciates
var toolbar;                // toolbar element where drawing searchboxes
var listPlaces;             // searchBoxes container
var searchBoxes = [];       // searchBoxes elements of google map

var markers = [];           // markers elements of the google map
var directionsService;      // directions Service for getting the path
var path = {};              // path object (list) from google maps
var poly;                   // polyline used for drawing the path

var initMap = function() {
    console.log("initialization of everything");
    mapElement = document.getElementById('map');

    directionsService = new google.maps.DirectionsService();
    map = new google.maps.Map(mapElement, {
        center: {lat: 45.05, lng: 7.65},
        zoom: 11
    });
    poly = new google.maps.Polyline({
        strokeColor: '#DE4343',
        strokeWeight: 3,
        map: map
    });

    toolbar = document.getElementById('toolbar');
    listPlaces = document.getElementById('list-places');
};

var createSearchBox = function(parent, index) {

    var id = index;
    var templateData = {
        id: id
    };

    $("<div>", {id: 'template-mustache'}).appendTo('body');
    $('#template-mustache').load("parts/search-box.html", function() {
        var html = Mustache.to_html(document.getElementById("search-box-template").innerHTML, templateData);
        $(parent).append(html);

        var input = document.getElementById("sb-" + id);

        searchBoxes[index] = new google.maps.places.SearchBox(input);
        searchBoxes[index].index = index;

        addSearchBoxListenerChanged(searchBoxes[index]);
    });
};

var addSearchBoxListenerChanged = function(searchBox) {
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        if(places.length == 1) {
            addMarkerAndCreatePath(places[0], searchBox.index);
        } else if(places.length == 0){
            alert("No point found");
        } else {
            alert("Too many points found");
        }
    });
};

var addMarkerAndCreatePath = function(place, index) {
    // create the marker
    markers[index] = createMarker(place);

    // calculate bounds
    updateBounds(place);

    // calculate path
    if(markers.length > 1) {
        createPath(index);
    }
};

var createMarker = function(place) {
    return new google.maps.Marker({
        map: map,
        title: place.name,
        position: place.geometry.location
    });
};

var updateBounds = function(place) {
    var bounds = new google.maps.LatLngBounds();
    for (var k in markers) {
        bounds.extend(markers[k].getPosition());
    }
    // set bounds
    map.fitBounds(bounds);
};

/**
 * Calculate Path between Start and End. calls a callback with the result (if OK)
 * TODO: better handling of errors.
 * @param start
 * @param end
 * @param index
 * @param callback
 */
var calculatePath = function(start, end, index, callback) {
    console.log("PANIC MONSTER");
    directionsService.route({
        origin: start,
        destination: end,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    }, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            result.index = index;
            callback(result);
        } else {
            console.log("error");
        }
    });
};

var buildPath = function(result) {
    var innerPath = new google.maps.MVCArray();
    for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
        innerPath.push(result.routes[0].overview_path[i]);
    }
    return innerPath;
};

var createPath = function(index) {

    var callback = function(result) {
        path[index] = buildPath(result);

        drawPath();
        DataManager.addTravelDatas(result.routes[0].legs[0]);
    };

    calculatePath(markers[index-1].getPosition(), markers[index].getPosition(), index, callback);
};

var drawPath = function() {
    var tpath = new google.maps.MVCArray();

    for (var k in path) {
        for (var i = 1; i < path[k].length; i++) {
            tpath.push(path[k].getAt(i));
        }
    }
    poly.setPath(tpath);
    poly.setMap(map);
};


// (pseudo)listener
var addPoint = function() {
    // get the max index +1 for the new index
    createSearchBox(listPlaces, getMaxSearchBoxIndex(searchBoxes)+1);
};

/**
 * calculate actual max index of the searchBoxes.
 * @param array
 * @returns {number}
 */
var getMaxSearchBoxIndex = function(array) {
    var max = -1;
    for(var k in array) {
        var i = array[k].index;
        if (max < i) {
            max = i;
        }
    }
    return max;
};
var removePoint = function(element) {
    var index = $(element).data('id');
    $("#sbc-" + index).remove();
    if (markers[index]) {
        markers[index].setMap(null);
        markers.splice(index,1);
    }
    debugger;

    delete path[index];
    delete path[index-1];

    var callback = function(result) {
        path[result.index] = buildPath(result);

        drawPath();

        addTravelDatas(result.routes[0].legs[0]);
    };

    calculatePath(markers[index-1].getPosition(), markers[index].getPosition(), index, callback);
    /*
    TODO: I M P O R T A N T ! ! Recalculate Path.

    TODO: get previous and next path, delete them and calculate new path (from previous to next)
    */
};


$(function(){
    $('#add-place').click(addPoint);
});

