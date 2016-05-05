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
var path;                   // path from google maps
var poly;                   // polyline used for drawing the path

var initMap = function() {
    console.log("initialization of everything");
    mapElement = document.getElementById('map');

    index = -1;
    directionsService = new google.maps.DirectionsService();
    map = new google.maps.Map(mapElement, {
        center: {lat: 45.05, lng: 7.65},
        zoom: 11
    });
    path = new google.maps.MVCArray();
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
        parent.innerHTML += html;

        var input = document.getElementById("sb-" + id);

        searchBoxes[index] = new google.maps.places.SearchBox(input);
        searchBoxes[index].index = index;

        addSearchBoxListenerChanged(searchBoxes[index]);
    });
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

    // create the marker
    markers[index] = new google.maps.Marker({
        map: map,
        title: place.name,
        position: place.geometry.location
    });

    // calculate bounds
    updateBounds(place);

    // calculate path
    if(markers.length > 1) {
        createPath(index);
    }
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
            var inpath = result.routes[0].overview_path;
            var length = inpath.length;
            var tpath = poly.getPath();

            for (var i = 0; i < length; i++) {
                tpath.push(inpath[i]);
            }
            poly.setPath(tpath);
            poly.setMap(map);
            addTravelDatas(result.routes[0].legs[0]);
        }
    });
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
    TODO: Path should be loaded in an array (createPath function).
    TODO: so that we can get previous and next path, delete them and insert new path (from previous to next)
    */
};


$(function(){
    $('#add-place').click(addPoint);
});

