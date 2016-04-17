'use strict';
const GENERATOR_TIMER = 1000;

var map;
var toolbar;
var listPlaces;
var mapElement;
var index;
var searchBoxes = [];
var markers = [];

var initMap = function() {
    console.log("init Map");
    mapElement = document.getElementById('map');

    index = 0;

    map = new google.maps.Map(mapElement, {
        center: {lat: 45.05, lng: 7.65},
        zoom: 11
    });
    toolbar = document.getElementById('toolbar');
    listPlaces = document.getElementById('list-places');
    createSearchBox(listPlaces, index);
};

var createSearchBox = function(parent, index) {
    var input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', 'Search Box');
    input.classList.add('search-box');

    parent.appendChild(input);
    searchBoxes[index] = new google.maps.places.SearchBox(input);

    addSearchBoxListenerChanged(searchBoxes[index]);
    return searchBoxes[++index];
};


var addSearchBoxListenerChanged = function(searchBox) {
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });

};