'use strict';
const GENERATOR_TIMER = 1000;

var map;
var toolbar;
var listPlaces;
var mapElement;
var index;
var searchBoxes = [];
var markers = [];
var directionsService;


var initMap = function() {
    console.log("init Map");
    mapElement = document.getElementById('map');

    index = -1;
    directionsService = new google.maps.DirectionsService();

    map = new google.maps.Map(mapElement, {
        center: {lat: 45.05, lng: 7.65},
        zoom: 11
    });
    toolbar = document.getElementById('toolbar');
    listPlaces = document.getElementById('list-places');
};

var createSearchBox = function(parent, index) {
    console.log(index);
    var input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', 'Search Box');
    input.classList.add('search-box');

    parent.appendChild(input);
    searchBoxes[index] = new google.maps.places.SearchBox(input);
    searchBoxes[index].index = index;

    addSearchBoxListenerChanged(searchBoxes[index]);
    return searchBoxes[index];
};


var addSearchBoxListenerChanged = function(searchBox) {
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        switch(places.length) {
            case 0:
                alert("No point found");
                break;
            case 1:
                addMarkerAndCreatePath(places[0], searchBox.index);
                break;
            default:
                alert("Too many points found");
                break;
        }
    });
};

var addMarkerAndCreatePath = function(place, index) {
    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();

    markers[index] = new google.maps.Marker({
        map: map,
        title: place.name,
        position: place.geometry.location
    });

    if(markers.length >= 2 && index > 1) {
        createPath(index);
    }
};

var createPath = function(index) {
    console.log("PANIC MONSTER");

    directionsService.route({
        origin: markers[index-1].getPosition(),
        destination: markers[index].getPosition(),
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    }, function(result, status) {
        console.log(index + " | " + status);
        if (status == google.maps.DirectionsStatus.OK) {
            for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
                path.push(result.routes[0].overview_path[i]);
            }
            var length = result.routes[0].overview_path.length;

            drawPath(result.routes[0].overview_path, whenDestinationReached);
            window.setTimeout(function() {
                routifyInternal(index+1);
            }, 999);
        }
    });
};

var drawPath = function(pathToDraw, destinationReached) {
    var index = 0;
    var timeToWait = 1000 / pathToDraw.length;
    var path = new google.maps.MVCArray();
    map.setCenter({'lat': 46.5246986, 'lng': 43.0680423});
    map.setZoom(4);
    var interval = window.setInterval(function() {
        if(index < pathToDraw.length) {
            path.push(pathToDraw[index]);
            poly.setPath(path);
            poly.setMap(map);
            index++;
        } else {
            window.clearInterval(interval);
            destinationReached(poly);
        }
    }, timeToWait);
};

var addPoint = function() {
    createSearchBox(listPlaces, index);
    index++;
};