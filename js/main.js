'use strict';
const GENERATOR_TIMER = 1000;

var map;                    // google map
var mapElement;             // map element where google map instanciates
var toolbar;                // toolbar element where drawing searchboxes
var listPlaces;             // searchBoxes container

var searchBoxesIndex = 0;

var initMap = function() {
    console.log("initialization of everything");
    mapElement = document.getElementById('map');

    map = new google.maps.Map(mapElement, {
        center: {lat: 45.05, lng: 7.65},
        zoom: 11
    });

    MapManager.init(map);

    toolbar = document.getElementById('toolbar');
    listPlaces = document.getElementById('list-places');
};

var createSearchBox = function(parent) {

    var id = searchBoxesIndex++;
    var templateData = {
        id: id
    };

    $("<div>", {id: 'template-mustache'}).appendTo('body');
    $('#template-mustache').load("parts/search-box.html", function() {
        var html = Mustache.to_html(document.getElementById("search-box-template").innerHTML, templateData);
        $(parent).append(html);

        var input = document.getElementById("sb-" + id);
        input.searchBox = new google.maps.places.SearchBox(input);

        addSearchBoxListenerChanged(input.searchBox);
    });
};

var addSearchBoxListenerChanged = function(searchBox) {
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        if(places.length == 1) {
            addMarkerAndCreatePath(places[0], searchBox);
        } else if(places.length == 0){
            alert("No point found");
        } else {
            alert("Too many points found");
        }
    });
};

var addMarkerAndCreatePath = function(place, searchBox) {
    if (searchBox.marker) {
        MapManager.updateMarker(searchBox.marker, place);
    } else {
        var marker = MapManager.createMarker(place);
        marker.searchBox = searchBox;
        searchBox.marker = marker;
        MapManager.addMarker(marker);
    }
};

// (pseudo)listener
var addPoint = function() {
    createSearchBox(listPlaces);
};

var removePoint = function(element) {
    //$(element).siblings('.search-box')[0].searchBox.marker.previousMarker.pathToNextMarker
    var $element = $(element);
    var searchBox = $element.siblings('.search-box')[0].searchBox;
    MapManager.removeMarker(searchBox.marker);
    $element.parent().remove();
};


$(function(){
    $('#add-place').click(addPoint);
});

