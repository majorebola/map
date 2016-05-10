'use strict';
const GENERATOR_TIMER = 1000;

var map;                    // google map
var mapElement;             // map element where google map instanciates
var toolbar;                // toolbar element where drawing searchboxes
var listPlaces;             // searchBoxes container
var searchBoxes = [];       // searchBoxes elements of google map

var index;                  // an index, maybe useless
var markers = [];           // markers elements of the google map
var directionsService;      // directions Service for getting the path
var path = {};              // path object (list) from google maps
var poly;                   // polyline used for drawing the path


// main data with all useful infos: marker, searchbox and path.
var data = [
    {
        marker: {},
        searchBox: {},
        path: {}
    }
];

var initMap = function() {
    console.log("initialization of everything");
    mapElement = document.getElementById('map');

    index = -1;
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
    if (markers.length > 1) {
        bounds = map.getBounds();
    }
    bounds.extend(place.geometry.location);

    // set bounds
    map.fitBounds(bounds);
};

var calculatePath = function(start, end, callback) {
    console.log("PANIC MONSTER");
    directionsService.route({
        origin: start,
        destination: end,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    }, function(result, status) {
        var innerPath = new google.maps.MVCArray();
        console.log(index + " | " + status);
        if (status == google.maps.DirectionsStatus.OK) {
            for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
                innerPath.push(result.routes[0].overview_path[i]);
            }
            callback(innerPath, result);
        }
    });
};

var createPath = function(index) {

    var callback = function(innerPath, result) {
        path[index] = innerPath;

        drawPath(path[index]);

        addTravelDatas(result.routes[0].legs[0]);
    };

    calculatePath(markers[index-1].getPosition(), markers[index].getPosition(), callback);
};

var drawPath = function(innerPath) {
    var tpath = poly.getPath();
    for (var i = 1; i < innerPath.length; i++) {
        tpath.push(innerPath.getAt(i));
    }
    poly.setPath(tpath);
    poly.setMap(map);
};

/*
Big bad method that shows distances and duration.
*/
var addTravelDatas = function(leg) {
    var totalDistanceElement = document.getElementById('total-distance');
    var totalDurationElement = document.getElementById('total-duration');
    var totalDistanceUnitElement = document.getElementById('total-distance-unit');
    var totalDurationUnitElement = document.getElementById('total-duration-unit');

    var totalDistance = parseFloat(totalDistanceElement.innerHTML);
    var totalDuration = parseFloat(totalDurationElement.innerHTML);
    var totalDistanceUnit = totalDistanceUnitElement.innerHTML;
    var totalDurationUnit = totalDurationUnitElement.innerHTML;

    var newDistance = leg.distance.value;
    var newDuration = leg.duration.value;

    if (totalDistanceUnit == 'km') {
        newDistance /= 1000;
    }
    switch (totalDurationUnit) {
        case 'hours':
            newDuration /= 3600;
            break;
        case 'mins':
            newDuration /= 60;
            break;
    }

    totalDistance += newDistance;
    totalDuration += newDuration;

    if(totalDistance > 1000) {
        totalDistance /= 1000;
        totalDistanceUnit = "km";
    }
    if(totalDuration > 60 && totalDurationUnit == 'secs') {
        totalDuration /= 60;
        totalDurationUnit = "mins";
    }
    if(totalDuration > 60 && totalDurationUnit == 'mins') {
        totalDuration /= 60;
        totalDurationUnit = "hours";
    }

    totalDistanceElement.innerHTML = totalDistance.toFixed(2);
    totalDurationElement.innerHTML = totalDuration.toFixed(2);
    totalDistanceUnitElement.innerHTML = totalDistanceUnit;
    totalDurationUnitElement.innerHTML = totalDurationUnit;
};

// LISTENERS
var addPoint = function() {
    index++;
    createSearchBox(listPlaces, index);
};
var removePoint = function(element) {
    var id = $(element).data('id');
    $("#sbc-" + id).remove();
    if (markers[id]) {
        markers[id].setMap(null);
        markers.splice(id,1);
    }
    /*
    TODO: I M P O R T A N T ! ! Recalculate Path.

    TODO: get previous and next path, delete them and calculate new path (from previous to next)
    */
};


$(function(){
    $('#add-place').click(addPoint);
});

